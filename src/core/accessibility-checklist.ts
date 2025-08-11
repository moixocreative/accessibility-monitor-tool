import { logger } from '../utils/logger';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  wcagCriteria: string[];
  // eslint-disable-next-line no-unused-vars
  testFunction: (page: any) => Promise<ChecklistResult>;
}

export interface ChecklistResult {
  passed: boolean;
  score: number; // 0-100
  details: string;
  violations?: any[];
}

export class AccessibilityChecklist {
  private checklist: ChecklistItem[] = [];

  constructor() {
    this.initializeChecklist();
  }

  private initializeChecklist() {
    // Baseado na Checklist "10 aspetos críticos de acessibilidade funcional para sítios web"
    // https://amagovpt.github.io/kit-selo/checklists/checklist-10aspetos.html
    
    this.checklist = [
      {
        id: 'checklist-1',
        title: 'Menus de Navegação',
        description: 'Menu estruturado como lista, navegação por teclado, imagens-link com alt',
        wcagCriteria: ['1.3.1', '2.1.1', '2.1.2', '2.4.1'],
        testFunction: this.testNavigationMenus.bind(this)
      },
      {
        id: 'checklist-2',
        title: 'Títulos e Subtítulos',
        description: 'Existência de h1 e hierarquia lógica de cabeçalhos',
        wcagCriteria: ['1.3.1', '2.4.10'],
        testFunction: this.testTitlesAndSubtitles.bind(this)
      },
      {
        id: 'checklist-3',
        title: 'Tabelas de Dados',
        description: 'Cabeçalhos de tabela e associações adequadas',
        wcagCriteria: ['1.3.1'],
        testFunction: this.testDataTables.bind(this)
      },
      {
        id: 'checklist-4',
        title: 'Formulários',
        description: 'Labels associados, validação e botões de submissão',
        wcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
        testFunction: this.testForms.bind(this)
      },
      {
        id: 'checklist-5',
        title: 'Gráficos e Imagens-Link',
        description: 'Textos alternativos adequados para imagens e gráficos',
        wcagCriteria: ['1.1.1'],
        testFunction: this.testGraphicsAndImages.bind(this)
      },
      {
        id: 'checklist-6',
        title: 'Contraste',
        description: 'Relação de contraste adequada entre texto e fundo',
        wcagCriteria: ['1.4.3'],
        testFunction: this.testContrast.bind(this)
      },
      {
        id: 'checklist-7',
        title: 'Players',
        description: 'Controles de media acessíveis',
        wcagCriteria: ['1.2.1', '1.2.2', '1.2.3'],
        testFunction: this.testMediaPlayers.bind(this)
      },
      {
        id: 'checklist-8',
        title: 'Estrutura da Página',
        description: 'Landmarks semânticos e navegação estruturada',
        wcagCriteria: ['1.3.1', '2.4.1'],
        testFunction: this.testPageStructure.bind(this)
      },
      {
        id: 'checklist-9',
        title: 'Modais',
        description: 'Acessibilidade de diálogos e janelas modais',
        wcagCriteria: ['1.3.1', '2.4.1', '4.1.2'],
        testFunction: this.testModals.bind(this)
      },
      {
        id: 'checklist-10',
        title: 'Ficheiros PDF',
        description: 'Acessibilidade de documentos PDF',
        wcagCriteria: ['1.1.1', '1.3.1'],
        testFunction: this.testPDFFiles.bind(this)
      }
    ];
  }

  async runChecklist(page: any): Promise<{
    totalItems: number;
    passedItems: number;
    percentage: number;
    results: { [key: string]: ChecklistResult };
    overallScore: number;
  }> {
    logger.info('🔍 Executando Checklist "10 aspetos críticos de acessibilidade funcional"...');
    
    const results: { [key: string]: ChecklistResult } = {};
    let passedItems = 0;

    for (const item of this.checklist) {
      try {
        logger.info(`Testando: ${item.title}`);
        const result = await item.testFunction(page);
        results[item.id] = result;
        
        if (result.passed) {
          passedItems++;
        }
        
        logger.info(`${item.title}: ${result.passed ? '✅' : '❌'} (${result.score}%)`);
      } catch (error) {
        logger.error(`Erro ao testar ${item.title}:`, error);
        results[item.id] = {
          passed: false,
          score: 0,
          details: `Erro no teste: ${error}`
        };
      }
    }

    const totalItems = this.checklist.length;
    const percentage = Math.round((passedItems / totalItems) * 100);
    const overallScore = Math.round(
      Object.values(results).reduce((sum, result) => sum + result.score, 0) / totalItems
    );

    return {
      totalItems,
      passedItems,
      percentage,
      results,
      overallScore
    };
  }

  // Métodos de teste dos 10 aspetos críticos oficiais
  private async testNavigationMenus(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const navs = (globalThis as any).document.querySelectorAll('nav, [role="navigation"]');
        let structuredMenus = 0;
        let keyboardAccessible = 0;
        let imagesWithAlt = 0;
        const totalNavs = navs.length;
        
        navs.forEach((nav: any) => {
          // Verificar se tem estrutura de lista
          const lists = nav.querySelectorAll('ul, ol');
          if (lists.length > 0) structuredMenus++;
          
          // Verificar navegação por teclado
          const interactiveElements = nav.querySelectorAll('a, button, [tabindex]');
          let hasKeyboardAccess = false;
          interactiveElements.forEach((el: any) => {
            if (el.hasAttribute('tabindex') || el.tagName === 'A' || el.tagName === 'BUTTON') {
              hasKeyboardAccess = true;
            }
          });
          if (hasKeyboardAccess) keyboardAccessible++;
          
          // Verificar imagens-link com alt
          const imageLinks = nav.querySelectorAll('a img');
          let imagesWithAltCount = 0;
          imageLinks.forEach((img: any) => {
            if (img.alt && img.alt.trim() !== '') imagesWithAltCount++;
          });
          if (imagesWithAltCount === imageLinks.length) imagesWithAlt++;
        });
        
        return { structuredMenus, keyboardAccessible, imagesWithAlt, totalNavs };
      });
      
      const score = result.totalNavs > 0 ? 
        Math.round(((result.structuredMenus + result.keyboardAccessible + result.imagesWithAlt) / (result.totalNavs * 3)) * 100) : 100;
      
      return {
        passed: score >= 80,
        score,
        details: `Menus: ${result.structuredMenus}/${result.totalNavs} estruturados, ${result.keyboardAccessible}/${result.totalNavs} com teclado, ${result.imagesWithAlt}/${result.totalNavs} com alt`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar menus de navegação'
      };
    }
  }

  private async testTitlesAndSubtitles(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const headings = (globalThis as any).document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const h1s = (globalThis as any).document.querySelectorAll('h1');
        
        let validStructure = 0;
        const totalHeadings = headings.length;
        
        // Verificar se existe exatamente um h1
        if (h1s.length === 1) validStructure++;
        
        // Verificar hierarquia lógica
        if (totalHeadings > 0) {
          let previousLevel = 0;
          let hasValidHierarchy = true;
          
          headings.forEach((heading: any) => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level > previousLevel + 1) {
              hasValidHierarchy = false;
            }
            previousLevel = level;
          });
          
          if (hasValidHierarchy) validStructure++;
        }
        
        return { validStructure, totalHeadings, h1Count: h1s.length };
      });
      
      const score = result.totalHeadings > 0 ? 
        Math.round((result.validStructure / 2) * 100) : 100;
      
      return {
        passed: score >= 80,
        score,
        details: `H1: ${result.h1Count}/1, Hierarquia: ${result.validStructure}/2 critérios válidos`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar títulos e subtítulos'
      };
    }
  }

  private async testDataTables(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const tables = (globalThis as any).document.querySelectorAll('table');
        let validTables = 0;
        const totalTables = tables.length;
        
        tables.forEach((table: any) => {
          let hasHeaders = false;
          let hasAssociations = false;
          
          // Verificar se tem cabeçalhos
          const headers = table.querySelectorAll('th');
          if (headers.length > 0) hasHeaders = true;
          
          // Verificar associações (scope, headers, id)
          const cells = table.querySelectorAll('td');
          if (cells.length > 0) {
            const hasScope = Array.from(cells).some((cell: any) => cell.hasAttribute('scope'));
            const hasHeaders = Array.from(cells).some((cell: any) => cell.hasAttribute('headers'));
            if (hasScope || hasHeaders) hasAssociations = true;
          }
          
          if (hasHeaders && hasAssociations) validTables++;
        });
        
        return { validTables, totalTables };
      });
      
      const score = result.totalTables > 0 ? 
        Math.round((result.validTables / result.totalTables) * 100) : 100;
      
      return {
        passed: score >= 80,
        score,
        details: `${result.validTables}/${result.totalTables} tabelas têm cabeçalhos e associações adequadas`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar tabelas de dados'
      };
    }
  }

  private async testForms(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const forms = (globalThis as any).document.querySelectorAll('form');
        let validForms = 0;
        const totalForms = forms.length;
        
        forms.forEach((form: any) => {
          let hasLabels = false;
          let hasSubmitButton = false;
          
          // Verificar se tem labels associados
          const inputs = form.querySelectorAll('input, select, textarea');
          if (inputs.length > 0) {
            const inputsWithLabels = Array.from(inputs).filter((input: any) => {
              const id = input.getAttribute('id');
              const name = input.getAttribute('name');
              const label = form.querySelector(`label[for="${id}"]`) || 
                           form.querySelector(`label:has(input[name="${name}"])`);
              return label !== null;
            });
            if (inputsWithLabels.length === inputs.length) hasLabels = true;
          }
          
          // Verificar se tem validação
          const requiredInputs = form.querySelectorAll('[required], [aria-required="true"]');
          if (requiredInputs.length > 0) {
            // hasValidation = true; // Removido - não usado
          }
          
          // Verificar se tem botão de submissão
          const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
          if (submitButtons.length > 0) hasSubmitButton = true;
          
          if (hasLabels && hasSubmitButton) validForms++;
        });
        
        return { validForms, totalForms };
      });
      
      const score = result.totalForms > 0 ? 
        Math.round((result.validForms / result.totalForms) * 100) : 100;
      
      return {
        passed: score >= 80,
        score,
        details: `${result.validForms}/${result.totalForms} formulários têm labels e botões de submissão`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar formulários'
      };
    }
  }

  private async testGraphicsAndImages(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const images = (globalThis as any).document.querySelectorAll('img');
        const graphics = (globalThis as any).document.querySelectorAll('svg, canvas, [role="img"]');
        
        let imagesWithAlt = 0;
        let graphicsWithAlt = 0;
        const totalImages = images.length;
        const totalGraphics = graphics.length;
        
        // Verificar imagens com alt
        images.forEach((img: any) => {
          const alt = img.getAttribute('alt');
          if (alt !== null && alt !== undefined && alt.trim() !== '') {
            imagesWithAlt++;
          }
        });
        
        // Verificar gráficos com alt ou aria-label
        graphics.forEach((graphic: any) => {
          const alt = graphic.getAttribute('alt');
          const ariaLabel = graphic.getAttribute('aria-label');
          const title = graphic.getAttribute('title');
          if (alt || ariaLabel || title) {
            graphicsWithAlt++;
          }
        });
        
        return { imagesWithAlt, graphicsWithAlt, totalImages, totalGraphics };
      });
      
      const imageScore = result.totalImages > 0 ? 
        Math.round((result.imagesWithAlt / result.totalImages) * 100) : 100;
      const graphicScore = result.totalGraphics > 0 ? 
        Math.round((result.graphicsWithAlt / result.totalGraphics) * 100) : 100;
      
      const overallScore = Math.round((imageScore + graphicScore) / 2);
      
      return {
        passed: overallScore >= 90,
        score: overallScore,
        details: `Imagens: ${result.imagesWithAlt}/${result.totalImages} com alt, Gráficos: ${result.graphicsWithAlt}/${result.totalGraphics} com descrição`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar gráficos e imagens'
      };
    }
  }

  private async testContrast(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const textElements = (globalThis as any).document.querySelectorAll(
          'p, span, div, h1, h2, h3, h4, h5, h6, a, button, input, label'
        );
        
        let goodContrastElements = 0;
        const totalElements = textElements.length;
        
        textElements.forEach((element: any) => {
          const style = (globalThis as any).window.getComputedStyle(element);
          const color = style.color;
          const backgroundColor = style.backgroundColor;
          
          // Verificação simplificada de contraste
          if (color && backgroundColor && 
              color !== backgroundColor && 
              color !== 'transparent' && 
              backgroundColor !== 'transparent' &&
              color !== 'rgba(0, 0, 0, 0)' &&
              backgroundColor !== 'rgba(0, 0, 0, 0)') {
            goodContrastElements++;
          }
        });
        
        return { goodContrastElements, totalElements };
      });
      
      const score = result.totalElements > 0 ? 
        Math.round((result.goodContrastElements / result.totalElements) * 100) : 100;
      
      return {
        passed: score >= 85,
        score,
        details: `${result.goodContrastElements}/${result.totalElements} elementos têm contraste adequado`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar contraste'
      };
    }
  }

  private async testMediaPlayers(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const videos = (globalThis as any).document.querySelectorAll('video');
        const audios = (globalThis as any).document.querySelectorAll('audio');
        const iframes = (globalThis as any).document.querySelectorAll('iframe[src*="youtube"], iframe[src*="vimeo"]');
        
        let accessibleVideos = 0;
        let accessibleAudios = 0;
        let accessibleIframes = 0;
        
        // Verificar vídeos com controles
        videos.forEach((video: any) => {
          if (video.controls || video.hasAttribute('aria-label') || video.hasAttribute('title')) {
            accessibleVideos++;
          }
        });
        
        // Verificar áudios com controles
        audios.forEach((audio: any) => {
          if (audio.controls || audio.hasAttribute('aria-label') || audio.hasAttribute('title')) {
            accessibleAudios++;
          }
        });
        
        // Verificar iframes com título
        iframes.forEach((iframe: any) => {
          if (iframe.hasAttribute('title') || iframe.hasAttribute('aria-label')) {
            accessibleIframes++;
          }
        });
        
        const totalMedia = videos.length + audios.length + iframes.length;
        const totalAccessible = accessibleVideos + accessibleAudios + accessibleIframes;
        
        return { totalMedia, totalAccessible, accessibleVideos, accessibleAudios, accessibleIframes };
      });
      
      const score = result.totalMedia > 0 ? 
        Math.round((result.totalAccessible / result.totalMedia) * 100) : 100;
      
      return {
        passed: score >= 80,
        score,
        details: `${result.totalAccessible}/${result.totalMedia} elementos de media são acessíveis`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar players de media'
      };
    }
  }

  private async testPageStructure(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const landmarks = (globalThis as any).document.querySelectorAll(
          '[role="banner"], [role="main"], [role="contentinfo"], [role="navigation"], [role="complementary"], [role="search"]'
        );
        const mainContent = (globalThis as any).document.querySelectorAll('main, [role="main"]');
        const skipLinks = (globalThis as any).document.querySelectorAll('a[href^="#"]');
        
        const hasLandmarks = landmarks.length > 0;
        const hasMainContent = mainContent.length > 0;
        let hasSkipLinks = false;
        
        // Verificar skip links
        skipLinks.forEach((link: any) => {
          const href = link.getAttribute('href');
          if (href && (href === '#main' || href === '#content' || href === '#main-content')) {
            hasSkipLinks = true;
          }
        });
        
        const totalCriteria = 3;
        let passedCriteria = 0;
        if (hasLandmarks) passedCriteria++;
        if (hasMainContent) passedCriteria++;
        if (hasSkipLinks) passedCriteria++;
        
        return { passedCriteria, totalCriteria, hasLandmarks, hasMainContent, hasSkipLinks };
      });
      
      const score = Math.round((result.passedCriteria / result.totalCriteria) * 100);
      
      return {
        passed: score >= 80,
        score,
        details: `${result.passedCriteria}/${result.totalCriteria} critérios de estrutura: landmarks=${result.hasLandmarks}, main=${result.hasMainContent}, skip=${result.hasSkipLinks}`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar estrutura da página'
      };
    }
  }

  private async testModals(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const modals = (globalThis as any).document.querySelectorAll(
          '[role="dialog"], [role="alertdialog"], .modal, .popup, [aria-modal="true"]'
        );
        
        let accessibleModals = 0;
        const totalModals = modals.length;
        
        modals.forEach((modal: any) => {
          let hasRole = false;
          let hasAriaLabel = false;
          
          // Verificar role
          if (modal.hasAttribute('role') && ['dialog', 'alertdialog'].includes(modal.getAttribute('role'))) {
            hasRole = true;
          }
          
          // Verificar aria-label ou aria-labelledby
          if (modal.hasAttribute('aria-label') || modal.hasAttribute('aria-labelledby')) {
            hasAriaLabel = true;
          }
          
          // Verificar gestão de foco (tabindex ou focusable)
          if (modal.hasAttribute('tabindex') || modal.hasAttribute('aria-hidden') === 'false') {
            // hasFocusManagement = true; // Removido - não usado
          }
          
          if (hasRole && hasAriaLabel) accessibleModals++;
        });
        
        return { accessibleModals, totalModals };
      });
      
      const score = result.totalModals > 0 ? 
        Math.round((result.accessibleModals / result.totalModals) * 100) : 100;
      
      return {
        passed: score >= 80,
        score,
        details: `${result.accessibleModals}/${result.totalModals} modais são acessíveis`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar modais'
      };
    }
  }

  private async testPDFFiles(page: any): Promise<ChecklistResult> {
    try {
      const result = await page.evaluate(() => {
        const pdfLinks = (globalThis as any).document.querySelectorAll('a[href$=".pdf"], a[href*=".pdf"]');
        const pdfEmbeds = (globalThis as any).document.querySelectorAll('embed[src*=".pdf"], object[data*=".pdf"]');
        
        let accessiblePDFs = 0;
        const totalPDFs = pdfLinks.length + pdfEmbeds.length;
        
        // Verificar links para PDFs com descrição
        pdfLinks.forEach((link: any) => {
          const text = link.textContent?.trim() || '';
          const ariaLabel = link.getAttribute('aria-label') || '';
          const title = link.getAttribute('title') || '';
          
          if (text.length > 3 || ariaLabel.length > 3 || title.length > 3) {
            accessiblePDFs++;
          }
        });
        
        // Verificar embeds de PDF com descrição
        pdfEmbeds.forEach((embed: any) => {
          const ariaLabel = embed.getAttribute('aria-label') || '';
          const title = embed.getAttribute('title') || '';
          
          if (ariaLabel.length > 3 || title.length > 3) {
            accessiblePDFs++;
          }
        });
        
        return { accessiblePDFs, totalPDFs };
      });
      
      const score = result.totalPDFs > 0 ? 
        Math.round((result.accessiblePDFs / result.totalPDFs) * 100) : 100;
      
      return {
        passed: score >= 80,
        score,
        details: `${result.accessiblePDFs}/${result.totalPDFs} ficheiros PDF são acessíveis`
      };
    } catch (error) {
      return {
        passed: false,
        score: 0,
        details: 'Erro ao testar ficheiros PDF'
      };
    }
  }

  getChecklistItems(): ChecklistItem[] {
    return this.checklist;
  }
}
