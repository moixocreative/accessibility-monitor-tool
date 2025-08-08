import { chromium } from 'playwright';
import { logger } from '../utils/logger';

export interface CrawlOptions {
  maxPages: number;
  maxDepth: number;
  includeExternal: boolean;
  excludePatterns: string[];
  includePatterns: string[];
  timeout: number;
}

export interface CrawlResult {
  url: string;
  title: string;
  depth: number;
  crawlTime: Date;
  isValid: boolean;
  error?: string;
}

export class PageCrawler {
  private visitedUrls: Set<string> = new Set();
  private foundUrls: CrawlResult[] = [];
  private baseUrl: string = '';
  private baseDomain: string = '';

  /**
   * Descobrir páginas de um site usando diferentes estratégias
   */
  async discoverPages(
    baseUrl: string, 
    strategy: 'auto' | 'sitemap' | 'manual',
    options: Partial<CrawlOptions> = {}
  ): Promise<CrawlResult[]> {
    const defaultOptions: CrawlOptions = {
      maxPages: 20,
      maxDepth: 2,
      includeExternal: false,
      excludePatterns: [
        '/admin', '/login', '/logout', '/api/', 
        '.pdf', '.jpg', '.png', '.gif', '.zip',
        '/wp-admin', '/wp-content', '#'
      ],
      includePatterns: [],
      timeout: 30000,
      ...options
    };

    this.baseUrl = baseUrl;
    this.baseDomain = new URL(baseUrl).hostname;
    this.visitedUrls.clear();
    this.foundUrls = [];

    logger.info(`Iniciando descoberta de páginas: ${strategy}`, { 
      baseUrl, 
      options: defaultOptions 
    });

    try {
      switch (strategy) {
        case 'auto':
          return await this.crawlAutomatically(defaultOptions);
        case 'sitemap':
          return await this.crawlFromSitemap(defaultOptions);
        case 'manual':
          // Para estratégia manual, apenas retorna a URL base
          return [{
            url: baseUrl,
            title: 'Manual Page',
            depth: 0,
            crawlTime: new Date(),
            isValid: true
          }];
        default:
          throw new Error(`Estratégia de crawling não suportada: ${strategy}`);
      }
    } catch (error) {
      logger.error('Erro durante descoberta de páginas:', error);
      // Retornar pelo menos a URL base se falhar
      return [{
        url: baseUrl,
        title: 'Fallback Page',
        depth: 0,
        crawlTime: new Date(),
        isValid: true,
        error: error instanceof Error ? error.message : String(error)
      }];
    }
  }

  /**
   * Crawling automático - descobrir links na homepage e páginas importantes
   */
  private async crawlAutomatically(options: CrawlOptions): Promise<CrawlResult[]> {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    });

    try {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      });
      
      const page = await context.newPage();
      page.setDefaultTimeout(options.timeout);

      // Começar pela homepage
      await this.crawlPage(page, this.baseUrl, 0, options);

      // Crawl adicional baseado nos links encontrados
      let currentDepth = 0;
      while (currentDepth < options.maxDepth && this.foundUrls.length < options.maxPages) {
        const urlsAtDepth = this.foundUrls.filter(url => url.depth === currentDepth);
        
        for (const urlResult of urlsAtDepth) {
          if (this.foundUrls.length >= options.maxPages) break;
          
          if (urlResult.isValid && !this.visitedUrls.has(urlResult.url)) {
            await this.crawlPage(page, urlResult.url, currentDepth + 1, options);
          }
        }
        
        currentDepth++;
      }

      await context.close();
      
      logger.info(`Crawling concluído: ${this.foundUrls.length} páginas descobertas`);
      return this.foundUrls.slice(0, options.maxPages);

    } finally {
      await browser.close();
    }
  }

  /**
   * Crawl individual de uma página
   */
  private async crawlPage(
    page: any, 
    url: string, 
    depth: number, 
    options: CrawlOptions
  ): Promise<void> {
    if (this.visitedUrls.has(url) || this.foundUrls.length >= options.maxPages) {
      return;
    }

    this.visitedUrls.add(url);
    
    try {
      logger.info(`Crawling página: ${url} (profundidade: ${depth})`);
      
      await page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: options.timeout 
      });

      // Obter título da página
      const title = await page.title();
      
      // Adicionar página atual aos resultados
      this.foundUrls.push({
        url,
        title: title || 'Sem título',
        depth,
        crawlTime: new Date(),
        isValid: true
      });

      // Se ainda não atingiu a profundidade máxima, procurar por links
      if (depth < options.maxDepth) {
        const links = await this.extractLinks(page, options);
        
        for (const link of links) {
          if (!this.visitedUrls.has(link) && this.foundUrls.length < options.maxPages) {
            // Adicionar link à lista para crawl posterior
            if (!this.foundUrls.some(result => result.url === link)) {
              this.foundUrls.push({
                url: link,
                title: 'A descobrir...',
                depth: depth + 1,
                crawlTime: new Date(),
                isValid: true
              });
            }
          }
        }
      }

    } catch (error) {
      logger.warn(`Erro ao fazer crawl da página ${url}:`, error);
      
      this.foundUrls.push({
        url,
        title: 'Erro no crawl',
        depth,
        crawlTime: new Date(),
        isValid: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Extrair links válidos de uma página
   */
  private async extractLinks(page: any, options: CrawlOptions): Promise<string[]> {
    try {
      const links = await page.evaluate((options: { baseDomain: string; includeExternal: boolean }) => {
        const linkElements = (globalThis as any).document.querySelectorAll('a[href]');
        const extractedLinks: string[] = [];

        for (const link of linkElements) {
          const href = link.getAttribute('href');
          if (!href) continue;

          try {
            let absoluteUrl: string;
            
            if (href.startsWith('http')) {
              absoluteUrl = href;
            } else if (href.startsWith('/')) {
              absoluteUrl = `${(globalThis as any).window.location.protocol}//${(globalThis as any).window.location.host}${href}`;
            } else if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
              continue; // Ignorar âncoras, javascript e emails
            } else {
              absoluteUrl = new URL(href, (globalThis as any).window.location.href).href;
            }

            const linkUrl = new URL(absoluteUrl);
            
            // Verificar se é do mesmo domínio (ou incluir externos se permitido)
            if (linkUrl.hostname === options.baseDomain || options.includeExternal) {
              extractedLinks.push(absoluteUrl);
            }
            
          } catch (error) {
            // Ignorar URLs malformadas
            continue;
          }
        }

        return [...new Set(extractedLinks)]; // Remover duplicatas
      }, { baseDomain: this.baseDomain, includeExternal: options.includeExternal });

      // Filtrar links baseado nos padrões de exclusão/inclusão
      return links.filter((link: string) => this.shouldIncludeUrl(link, options));

    } catch (error) {
      logger.warn('Erro ao extrair links:', error);
      return [];
    }
  }

  /**
   * Verificar se uma URL deve ser incluída baseado nos padrões
   */
  private shouldIncludeUrl(url: string, options: CrawlOptions): boolean {
    // Verificar padrões de exclusão
    for (const pattern of options.excludePatterns) {
      if (url.includes(pattern)) {
        return false;
      }
    }

    // Se há padrões de inclusão específicos, verificar se a URL corresponde
    if (options.includePatterns.length > 0) {
      return options.includePatterns.some(pattern => url.includes(pattern));
    }

    return true;
  }

  /**
   * Descobrir páginas através do sitemap.xml
   */
  private async crawlFromSitemap(options: CrawlOptions): Promise<CrawlResult[]> {
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // URLs comuns de sitemap
      const sitemapUrls = [
        `${this.baseUrl}/sitemap.xml`,
        `${this.baseUrl}/sitemap_index.xml`,
        `${this.baseUrl}/sitemap-index.xml`,
        `${this.baseUrl}/sitemaps.xml`
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          logger.info(`Tentando sitemap: ${sitemapUrl}`);
          
          const response = await page.goto(sitemapUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: options.timeout 
          });

          if (response && response.ok()) {
            const content = await page.content();
            const urls = this.parseSitemap(content);
            
            if (urls.length > 0) {
              logger.info(`Sitemap encontrado com ${urls.length} URLs`);
              
              return urls.slice(0, options.maxPages).map((url, index) => ({
                url,
                title: `Sitemap URL ${index + 1}`,
                depth: 0,
                crawlTime: new Date(),
                isValid: true
              }));
            }
          }
          
        } catch (error) {
          logger.warn(`Sitemap não encontrado em ${sitemapUrl}:`, error);
          continue;
        }
      }

      // Se não encontrou sitemap, fallback para crawling automático
      logger.info('Nenhum sitemap encontrado, usando crawling automático como fallback');
      await context.close();
      return await this.crawlAutomatically(options);

    } finally {
      await browser.close();
    }
  }

  /**
   * Fazer parse do conteúdo XML do sitemap
   */
  private parseSitemap(xmlContent: string): string[] {
    const urls: string[] = [];
    
    try {
      // Regex simples para extrair URLs do sitemap XML
      const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
      
      if (urlMatches) {
        for (const match of urlMatches) {
          const url = match.replace('<loc>', '').replace('</loc>', '').trim();
          if (url && this.shouldIncludeUrl(url, { excludePatterns: [], includePatterns: [], maxPages: 100, maxDepth: 1, includeExternal: false, timeout: 30000 })) {
            urls.push(url);
          }
        }
      }

      // Verificar se é um sitemap index que referencia outros sitemaps
      const sitemapMatches = xmlContent.match(/<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/g);
      
      if (sitemapMatches) {
        logger.info('Sitemap index detectado, processando sub-sitemaps...');
        // Para simplicidade, vamos processar apenas o primeiro sub-sitemap por agora
        // Uma implementação completa faria parse recursivo de todos os sub-sitemaps
      }

    } catch (error) {
      logger.error('Erro ao fazer parse do sitemap:', error);
    }

    return urls;
  }

  /**
   * Obter estatísticas do crawling
   */
  getStats(): { total: number; valid: number; invalid: number; depths: Record<number, number> } {
    const valid = this.foundUrls.filter(url => url.isValid).length;
    const invalid = this.foundUrls.filter(url => !url.isValid).length;
    
    const depths: Record<number, number> = {};
    for (const url of this.foundUrls) {
      depths[url.depth] = (depths[url.depth] || 0) + 1;
    }

    return {
      total: this.foundUrls.length,
      valid,
      invalid,
      depths
    };
  }
}
