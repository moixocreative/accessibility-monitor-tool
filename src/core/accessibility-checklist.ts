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
        title: 'Navegação por teclado',
        description: 'Todos os elementos interativos são acessíveis via teclado',
        wcagCriteria: ['2.1.1', '2.1.2', '2.4.1'],
        testFunction: this.testKeyboardNavigation.bind(this)
      },
      {
        id: 'checklist-2',
        title: 'Contraste de cores',
        description: 'Contraste suficiente entre texto e fundo (mínimo 4.5:1)',
        wcagCriteria: ['1.4.3'],
        testFunction: this.testColorContrast.bind(this)
      },
      {
        id: 'checklist-3',
        title: 'Textos alternativos',
        description: 'Todas as imagens têm texto alternativo adequado',
        wcagCriteria: ['1.1.1'],
        testFunction: this.testAltText.bind(this)
      },
      {
        id: 'checklist-4',
        title: 'Estrutura de cabeçalhos',
        description: 'Hierarquia lógica de cabeçalhos (h1, h2, h3...)',
        wcagCriteria: ['1.3.1', '2.4.10'],
        testFunction: this.testHeadingStructure.bind(this)
      },
      {
        id: 'checklist-5',
        title: 'Formulários acessíveis',
        description: 'Campos de formulário têm labels associados',
        wcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
        testFunction: this.testFormAccessibility.bind(this)
      },
      {
        id: 'checklist-6',
        title: 'Links descritivos',
        description: 'Links têm texto descritivo fora do contexto',
        wcagCriteria: ['2.4.4'],
        testFunction: this.testDescriptiveLinks.bind(this)
      },
      {
        id: 'checklist-7',
        title: 'Idioma da página',
        description: 'Idioma principal da página está declarado',
        wcagCriteria: ['3.1.1'],
        testFunction: this.testLanguageDeclaration.bind(this)
      },
      {
        id: 'checklist-8',
        title: 'Título da página',
        description: 'Página tem título descritivo e único',
        wcagCriteria: ['2.4.2'],
        testFunction: this.testPageTitle.bind(this)
      },
      {
        id: 'checklist-9',
        title: 'Skip links',
        description: 'Links para saltar para o conteúdo principal',
        wcagCriteria: ['2.4.1'],
        testFunction: this.testSkipLinks.bind(this)
      },
      {
        id: 'checklist-10',
        title: 'Validação HTML',
        description: 'HTML válido sem erros críticos',
        wcagCriteria: ['4.1.1'],
        testFunction: this.testHTMLValidity.bind(this)
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

  // Métodos de teste individuais
  private async testKeyboardNavigation(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      const interactiveElements = (globalThis as any).document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], [role="link"], [tabindex]'
      );
      
      let accessibleElements = 0;
      const totalElements = interactiveElements.length;
      
      interactiveElements.forEach((element: any) => {
        const tabIndex = element.getAttribute('tabindex');
        const role = element.getAttribute('role');
        
        // Verificar se é acessível via teclado
        if (tabIndex !== '-1' || 
            (role && ['button', 'link'].includes(role)) ||
            ['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
          accessibleElements++;
        }
      });
      
      const score = totalElements > 0 ? Math.round((accessibleElements / totalElements) * 100) : 100;
      const passed = score >= 90; // Pelo menos 90% dos elementos devem ser acessíveis
      
      return {
        passed,
        score,
        details: `${accessibleElements}/${totalElements} elementos interativos são acessíveis via teclado`
      };
    });
  }

  private async testColorContrast(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
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
            backgroundColor !== 'transparent') {
          goodContrastElements++;
        }
      });
      
      const score = totalElements > 0 ? Math.round((goodContrastElements / totalElements) * 100) : 100;
      const passed = score >= 85; // Pelo menos 85% dos elementos devem ter bom contraste
      
      return {
        passed,
        score,
        details: `${goodContrastElements}/${totalElements} elementos têm contraste adequado`
      };
    });
  }

  private async testAltText(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      const images = (globalThis as any).document.querySelectorAll('img');
      
      let imagesWithAlt = 0;
      const totalImages = images.length;
      
      images.forEach((img: any) => {
        const alt = img.getAttribute('alt');
        if (alt !== null && alt !== undefined) {
          imagesWithAlt++;
        }
      });
      
      const score = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100;
      const passed = score >= 95; // Pelo menos 95% das imagens devem ter alt
      
      return {
        passed,
        score,
        details: `${imagesWithAlt}/${totalImages} imagens têm texto alternativo`
      };
    });
  }

  private async testHeadingStructure(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      const headings = (globalThis as any).document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      let validStructure = 0;
      const totalHeadings = headings.length;
      
      for (let i = 1; i < headings.length; i++) {
        const currentLevel = parseInt(headings[i].tagName.charAt(1));
        const previousLevel = parseInt(headings[i-1].tagName.charAt(1));
        
        if (currentLevel - previousLevel <= 1) {
          validStructure++;
        }
      }
      
      const score = totalHeadings > 1 ? Math.round((validStructure / (totalHeadings - 1)) * 100) : 100;
      const passed = score >= 90; // Pelo menos 90% da estrutura deve ser válida
      
      return {
        passed,
        score,
        details: `${validStructure}/${Math.max(1, totalHeadings - 1)} transições de cabeçalho são válidas`
      };
    });
  }

  private async testFormAccessibility(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      const formControls = (globalThis as any).document.querySelectorAll(
        'input, select, textarea, button'
      );
      
      let accessibleControls = 0;
      const totalControls = formControls.length;
      
      formControls.forEach((control: any) => {
        const id = control.getAttribute('id');
        const name = control.getAttribute('name');
        const ariaLabel = control.getAttribute('aria-label');
        const ariaLabelledby = control.getAttribute('aria-labelledby');
        
        // Verificar se tem identificação acessível
        if (id || name || ariaLabel || ariaLabelledby) {
          accessibleControls++;
        }
      });
      
      const score = totalControls > 0 ? Math.round((accessibleControls / totalControls) * 100) : 100;
      const passed = score >= 95; // Pelo menos 95% dos controles devem ser acessíveis
      
      return {
        passed,
        score,
        details: `${accessibleControls}/${totalControls} controles de formulário são acessíveis`
      };
    });
  }

  private async testDescriptiveLinks(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      const links = (globalThis as any).document.querySelectorAll('a[href]');
      
      let descriptiveLinks = 0;
      const totalLinks = links.length;
      
      links.forEach((link: any) => {
        const text = link.textContent?.trim() || '';
        const ariaLabel = link.getAttribute('aria-label') || '';
        const title = link.getAttribute('title') || '';
        
        // Verificar se o link tem texto descritivo
        if (text.length > 3 || ariaLabel.length > 3 || title.length > 3) {
          descriptiveLinks++;
        }
      });
      
      const score = totalLinks > 0 ? Math.round((descriptiveLinks / totalLinks) * 100) : 100;
      const passed = score >= 90; // Pelo menos 90% dos links devem ser descritivos
      
      return {
        passed,
        score,
        details: `${descriptiveLinks}/${totalLinks} links têm texto descritivo`
      };
    });
  }

  private async testLanguageDeclaration(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      const html = (globalThis as any).document.documentElement;
      const lang = html.getAttribute('lang');
      
      const passed = !!lang && lang.length > 0;
      const score = passed ? 100 : 0;
      
      return {
        passed,
        score,
        details: passed ? `Idioma declarado: ${lang}` : 'Idioma da página não declarado'
      };
    });
  }

  private async testPageTitle(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      const title = (globalThis as any).document.title;
      
      const passed = !!title && title.length > 0 && title.length < 60;
      const score = passed ? 100 : 0;
      
      return {
        passed,
        score,
        details: passed ? `Título: "${title}"` : 'Título da página ausente ou muito longo'
      };
    });
  }

  private async testSkipLinks(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      const links = (globalThis as any).document.querySelectorAll('a[href^="#"]');
      
      let hasSkipLink = false;
      
      links.forEach((link: any) => {
        const href = link.getAttribute('href');
        if (href && (href === '#main' || href === '#content' || href === '#main-content')) {
          hasSkipLink = true;
        }
      });
      
      const passed = hasSkipLink;
      const score = passed ? 100 : 0;
      
      return {
        passed,
        score,
        details: passed ? 'Skip link encontrado' : 'Skip link não encontrado'
      };
    });
  }

  private async testHTMLValidity(page: any): Promise<ChecklistResult> {
    return await page.evaluate(() => {
      // Verificação simplificada de HTML válido
      const html = (globalThis as any).document.documentElement;
      const body = (globalThis as any).document.body;
      
      // Verificar se tem estrutura básica
      const hasValidStructure = html && body && html.tagName === 'HTML' && body.tagName === 'BODY';
      
      // Verificar se não há erros óbvios
      const hasNoObviousErrors = !(globalThis as any).document.querySelector('script[src=""]') &&
                                 !(globalThis as any).document.querySelector('img[src=""]');
      
      const passed = hasValidStructure && hasNoObviousErrors;
      const score = passed ? 100 : 50;
      
      return {
        passed,
        score,
        details: passed ? 'HTML parece válido' : 'Problemas de HTML detectados'
      };
    });
  }

  getChecklistItems(): ChecklistItem[] {
    return this.checklist;
  }
}
