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
    strategy: 'auto' | 'sitemap' | 'manual' | 'comprehensive',
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
        case 'comprehensive':
          return await this.crawlComprehensively(defaultOptions);
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
   * Crawling abrangente - combina múltiplas estratégias para descobrir TODAS as páginas
   */
  private async crawlComprehensively(options: CrawlOptions): Promise<CrawlResult[]> {
    logger.info('🚀 Iniciando crawling abrangente com múltiplas estratégias...');
    
    const allUrls = new Set<string>();
    const allResults: CrawlResult[] = [];
    
    // Estratégia 1: Sitemap XML
    logger.info('🗺️ Tentando descoberta via sitemap...');
    try {
      const sitemapUrls = await this.discoverFromSitemap(options);
      sitemapUrls.forEach(result => {
        if (!allUrls.has(result.url)) {
          allUrls.add(result.url);
          allResults.push({ ...result, depth: 0 });
        }
      });
      logger.info(`📋 Sitemap: ${sitemapUrls.length} URLs descobertas`);
    } catch (error) {
      logger.warn('Erro na descoberta via sitemap:', error);
    }

    // Estratégia 2: Robots.txt
    logger.info('🤖 Tentando descoberta via robots.txt...');
    try {
      const robotsUrls = await this.discoverFromRobots(options);
      robotsUrls.forEach(result => {
        if (!allUrls.has(result.url)) {
          allUrls.add(result.url);
          allResults.push({ ...result, depth: 0 });
        }
      });
      logger.info(`🤖 Robots.txt: ${robotsUrls.length} URLs descobertas`);
    } catch (error) {
      logger.warn('Erro na descoberta via robots.txt:', error);
    }

    // Estratégia 3: Crawling automático aprofundado
    logger.info('🕷️ Iniciando crawling automático aprofundado...');
    try {
      const crawlOptions = { ...options, maxDepth: 3, maxPages: Math.max(50, options.maxPages) };
      const crawledUrls = await this.crawlAutomatically(crawlOptions);
      crawledUrls.forEach(result => {
        if (!allUrls.has(result.url)) {
          allUrls.add(result.url);
          allResults.push(result);
        }
      });
      logger.info(`🕷️ Crawling: ${crawledUrls.length} URLs descobertas`);
    } catch (error) {
      logger.warn('Erro no crawling automático:', error);
    }

    // Estratégia 4: Descoberta de padrões comuns
    logger.info('🔍 Tentando descoberta por padrões comuns...');
    try {
      const patternUrls = await this.discoverCommonPatterns(options);
      patternUrls.forEach(result => {
        if (!allUrls.has(result.url)) {
          allUrls.add(result.url);
          allResults.push({ ...result, depth: 0 });
        }
      });
      logger.info(`🔍 Padrões: ${patternUrls.length} URLs descobertas`);
    } catch (error) {
      logger.warn('Erro na descoberta por padrões:', error);
    }

    // Filtrar URLs protegidas por login
    const filteredResults = await this.filterLoginProtectedPages(allResults);
    
    logger.info(`✅ Crawling abrangente concluído: ${filteredResults.length} páginas válidas de ${allResults.length} descobertas`);
    
    return filteredResults.slice(0, options.maxPages);
  }

  /**
   * Descobrir URLs via sitemap (versão dedicada)
   */
  private async discoverFromSitemap(options: CrawlOptions): Promise<CrawlResult[]> {
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const sitemapUrls = [
        `${this.baseUrl}/sitemap.xml`,
        `${this.baseUrl}/sitemap_index.xml`,
        `${this.baseUrl}/sitemap-index.xml`,
        `${this.baseUrl}/sitemaps.xml`,
        `${this.baseUrl}/site-map.xml`
      ];

      for (const sitemapUrl of sitemapUrls) {
        try {
          const response = await page.goto(sitemapUrl, { 
            waitUntil: 'domcontentloaded',
            timeout: options.timeout 
          });

          if (response && response.ok()) {
            const content = await page.content();
            const urls = this.parseSitemap(content);
            
            if (urls.length > 0) {
              await context.close();
              return urls.map((url, index) => ({
                url,
                title: `Sitemap URL ${index + 1}`,
                depth: 0,
                crawlTime: new Date(),
                isValid: true
              }));
            }
          }
        } catch (error) {
          continue;
        }
      }

      await context.close();
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * Descobrir URLs via robots.txt
   */
  private async discoverFromRobots(options: CrawlOptions): Promise<CrawlResult[]> {
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const robotsUrl = `${this.baseUrl}/robots.txt`;
      const response = await page.goto(robotsUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: options.timeout 
      });

      if (response && response.ok()) {
        const content = await page.content();
        const urls = this.parseRobotsTxt(content);
        
        await context.close();
        return urls.map((url, index) => ({
          url,
          title: `Robots.txt URL ${index + 1}`,
          depth: 0,
          crawlTime: new Date(),
          isValid: true
        }));
      }

      await context.close();
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * Descobrir páginas por padrões comuns
   */
  private async discoverCommonPatterns(options: CrawlOptions): Promise<CrawlResult[]> {
    const commonPaths = [
      '/about', '/sobre', '/quem-somos', '/empresa', '/historia',
      '/contact', '/contacto', '/contactos', '/contato', '/contatos',
      '/services', '/servicos', '/produtos', '/products',
      '/portfolio', '/trabalhos', '/projetos', '/projects',
      '/team', '/equipa', '/equipe', '/staff',
      '/news', '/noticias', '/blog', '/artigos',
      '/faq', '/perguntas', '/ajuda', '/help',
      '/privacy', '/privacidade', '/termos', '/terms',
      '/legal', '/juridico', '/politica'
    ];

    const results: CrawlResult[] = [];
    const browser = await chromium.launch({ headless: true });
    
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      for (const path of commonPaths) {
        try {
          const url = `${options.baseUrl}${path}`;
          const response = await page.goto(url, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 // Timeout menor para testar rapidamente
          });

          if (response && response.ok() && response.status() === 200) {
            const title = await page.title();
            results.push({
              url,
              title: title || `Página ${path}`,
              depth: 0,
              crawlTime: new Date(),
              isValid: true
            });
          }
        } catch (error) {
          // Página não existe ou não acessível, continuar
          continue;
        }
      }

      await context.close();
    } finally {
      await browser.close();
    }

    return results;
  }

  /**
   * Filtrar páginas protegidas por login
   */
  private async filterLoginProtectedPages(pages: CrawlResult[]): Promise<CrawlResult[]> {
    const loginPatterns = [
      '/login', '/signin', '/entrar', '/acesso',
      '/register', '/signup', '/registo', '/criar-conta',
      '/admin', '/dashboard', '/painel', '/gestao',
      '/account', '/conta', '/perfil', '/profile',
      '/checkout', '/payment', '/pagamento', '/compra'
    ];

    return pages.filter(page => {
      // Verificar se a URL contém padrões de login
      const hasLoginPattern = loginPatterns.some(pattern => 
        page.url.toLowerCase().includes(pattern)
      );
      
      return !hasLoginPattern;
    });
  }

  /**
   * Parse robots.txt para encontrar sitemaps e URLs mencionadas
   */
  private parseRobotsTxt(content: string): string[] {
    const urls: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();
      
      // Procurar por referências de sitemap
      if (trimmedLine.startsWith('sitemap:')) {
        const sitemapUrl = line.substring(8).trim();
        if (sitemapUrl && this.shouldIncludeUrl(sitemapUrl, { excludePatterns: [], includePatterns: [], maxPages: 100, maxDepth: 1, includeExternal: false, timeout: 30000 })) {
          urls.push(sitemapUrl);
        }
      }
      
      // Procurar por caminhos mencionados em Disallow (às vezes indicam páginas existentes)
      if (trimmedLine.startsWith('disallow:')) {
        const path = line.substring(9).trim();
        if (path && path !== '/' && !path.includes('*') && !path.includes('?')) {
          const fullUrl = `${this.baseUrl}${path}`;
          if (this.shouldIncludeUrl(fullUrl, { excludePatterns: [], includePatterns: [], maxPages: 100, maxDepth: 1, includeExternal: false, timeout: 30000 })) {
            urls.push(fullUrl);
          }
        }
      }
    }
    
    return [...new Set(urls)]; // Remover duplicatas
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
