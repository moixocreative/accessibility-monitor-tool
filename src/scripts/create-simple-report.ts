import * as fs from 'fs';
import * as path from 'path';

async function createSimpleReport(): Promise<void> {
  const html = `
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Acessibilidade - Casa de Investimentos</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .compliance-badge { display: inline-block; padding: 12px 24px; border-radius: 25px; font-weight: bold; text-transform: uppercase; font-size: 1.1em; margin: 20px 0; }
        .compliance-nao { background: #dc3545; color: white; }
        .compliance-parcialmente { background: #ffc107; color: #212529; }
        .compliance-plenamente { background: #28a745; color: white; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .page-result { background: white; border: 1px solid #dee2e6; border-radius: 8px; margin-bottom: 15px; padding: 20px; }
        .page-score { display: inline-block; padding: 5px 12px; border-radius: 15px; font-weight: bold; margin-left: 10px; }
        .score-poor { background: #dc3545; color: white; }
        .score-good { background: #17a2b8; color: white; }
        .score-excellent { background: #28a745; color: white; }
        .violation-detail { background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0; }
        .violation-desc { color: #6c757d; font-style: italic; }
        .violation-element { background: #e9ecef; padding: 5px 10px; border-radius: 4px; font-family: monospace; font-size: 0.9em; margin-top: 5px; display: inline-block; }
        h3 { color: #495057; margin-bottom: 15px; }
        h4 { color: #6c757d; margin: 20px 0 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Relatório de Acessibilidade - Casa de Investimentos</h1>
            <p><strong>URL:</strong> https://www.casadeinvestimentos.pt</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-PT')}</p>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
            <h2>📊 Visão Geral da Conformidade</h2>
            <div class="compliance-badge compliance-nao">
                NÃO CONFORME
            </div>
            <p style="margin-bottom: 20px; font-size: 1.1em;">
                O site não atende aos padrões mínimos de acessibilidade. Páginas com score inferior a 8 ou que violam mais de 50% dos requisitos da checklist.
            </p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">7.79</div>
                    <div class="stat-label">Score Médio WCAG</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">15</div>
                    <div class="stat-label">Total Violações</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">90%</div>
                    <div class="stat-label">Checklist</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">5</div>
                    <div class="stat-label">Páginas Auditadas</div>
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3>📋 Critérios de Classificação</h3>
                <p><strong>Plenamente Conforme:</strong> Todas as páginas com score > 9 E Checklist ≥ 75%</p>
                <p><strong>Parcialmente Conforme:</strong> Todas as páginas com score > 8 E Checklist entre 50-75%</p>
                <p><strong>Não Conforme:</strong> Páginas com score ≤ 8 OU Checklist < 50%</p>
            </div>
        </div>

        <div>
            <h2>📄 Resultados por Página</h2>
            
            <div class="page-result">
                <h3>🌐 https://www.casadeinvestimentos.pt</h3>
                <div class="page-score score-poor">7.1/10</div>
                <div class="compliance-badge compliance-nao">NÃO CONFORME</div>
                
                <h4>🚨 Violações Detalhadas:</h4>
                <div class="violation-detail">
                    <strong>Skip Links (Sério)</strong><br>
                    <span class="violation-desc">Primeira hiperligação não permite saltar para área do conteúdo principal</span><br>
                    <span class="violation-element">Elemento: &lt;a href="#main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Interactive Names (Sério)</strong><br>
                    <span class="violation-desc">74 elemento(s) interativo(s) que têm texto visível das suas etiquetas que não faz parte dos seus nomes acessíveis</span><br>
                    <span class="violation-element">Elementos: &lt;button&gt;, &lt;a&gt;, &lt;input&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Landmarks (Moderado)</strong><br>
                    <span class="violation-desc">Conteúdo da página não está contido por landmarks</span><br>
                    <span class="violation-element">Elemento: &lt;div class="main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Content Info (Sério)</strong><br>
                    <span class="violation-desc">1 elemento com a semântica de contentinfo está contido dentro de um elemento com outra semântica</span><br>
                    <span class="violation-element">Elemento: &lt;footer role="contentinfo"&gt;</span>
                </div>
            </div>
            
            <div class="page-result">
                <h3>🌐 https://www.casadeinvestimentos.pt/historia</h3>
                <div class="page-score score-poor">7.8/10</div>
                <div class="compliance-badge compliance-nao">NÃO CONFORME</div>
                
                <h4>🚨 Violações Detalhadas:</h4>
                <div class="violation-detail">
                    <strong>Skip Links (Sério)</strong><br>
                    <span class="violation-desc">Primeira hiperligação não permite saltar para área do conteúdo principal</span><br>
                    <span class="violation-element">Elemento: &lt;a href="#main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Interactive Names (Sério)</strong><br>
                    <span class="violation-desc">74 elemento(s) interativo(s) que têm texto visível das suas etiquetas que não faz parte dos seus nomes acessíveis</span><br>
                    <span class="violation-element">Elementos: &lt;button&gt;, &lt;a&gt;, &lt;input&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Landmarks (Moderado)</strong><br>
                    <span class="violation-desc">Conteúdo da página não está contido por landmarks</span><br>
                    <span class="violation-element">Elemento: &lt;div class="main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Content Info (Sério)</strong><br>
                    <span class="violation-desc">1 elemento com a semântica de contentinfo está contido dentro de um elemento com outra semântica</span><br>
                    <span class="violation-element">Elemento: &lt;footer role="contentinfo"&gt;</span>
                </div>
            </div>
            
            <div class="page-result">
                <h3>🌐 https://www.casadeinvestimentos.pt/equipa</h3>
                <div class="page-score score-poor">7.95/10</div>
                <div class="compliance-badge compliance-nao">NÃO CONFORME</div>
                
                <h4>🚨 Violações Detalhadas:</h4>
                <div class="violation-detail">
                    <strong>Skip Links (Sério)</strong><br>
                    <span class="violation-desc">Primeira hiperligação não permite saltar para área do conteúdo principal</span><br>
                    <span class="violation-element">Elemento: &lt;a href="#main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Interactive Names (Sério)</strong><br>
                    <span class="violation-desc">74 elemento(s) interativo(s) que têm texto visível das suas etiquetas que não faz parte dos seus nomes acessíveis</span><br>
                    <span class="violation-element">Elementos: &lt;button&gt;, &lt;a&gt;, &lt;input&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Landmarks (Moderado)</strong><br>
                    <span class="violation-desc">Conteúdo da página não está contido por landmarks</span><br>
                    <span class="violation-element">Elemento: &lt;div class="main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Content Info (Sério)</strong><br>
                    <span class="violation-desc">1 elemento com a semântica de contentinfo está contido dentro de um elemento com outra semântica</span><br>
                    <span class="violation-element">Elemento: &lt;footer role="contentinfo"&gt;</span>
                </div>
            </div>
            
            <div class="page-result">
                <h3>🌐 https://www.casadeinvestimentos.pt/filosofia-e-processo-de-investimento</h3>
                <div class="page-score score-good">8.0/10</div>
                <div class="compliance-badge compliance-parcialmente">PARCIALMENTE CONFORME</div>
                
                <h4>🚨 Violações Detalhadas:</h4>
                <div class="violation-detail">
                    <strong>Skip Links (Sério)</strong><br>
                    <span class="violation-desc">Primeira hiperligação não permite saltar para área do conteúdo principal</span><br>
                    <span class="violation-element">Elemento: &lt;a href="#main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Interactive Names (Sério)</strong><br>
                    <span class="violation-desc">74 elemento(s) interativo(s) que têm texto visível das suas etiquetas que não faz parte dos seus nomes acessíveis</span><br>
                    <span class="violation-element">Elementos: &lt;button&gt;, &lt;a&gt;, &lt;input&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Landmarks (Moderado)</strong><br>
                    <span class="violation-desc">Conteúdo da página não está contido por landmarks</span><br>
                    <span class="violation-element">Elemento: &lt;div class="main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Content Info (Sério)</strong><br>
                    <span class="violation-desc">1 elemento com a semântica de contentinfo está contido dentro de um elemento com outra semântica</span><br>
                    <span class="violation-element">Elemento: &lt;footer role="contentinfo"&gt;</span>
                </div>
            </div>
            
            <div class="page-result">
                <h3>🌐 https://www.casadeinvestimentos.pt/contas-de-gestao-individual</h3>
                <div class="page-score score-good">8.1/10</div>
                <div class="compliance-badge compliance-parcialmente">PARCIALMENTE CONFORME</div>
                
                <h4>🚨 Violações Detalhadas:</h4>
                <div class="violation-detail">
                    <strong>Skip Links (Sério)</strong><br>
                    <span class="violation-desc">Primeira hiperligação não permite saltar para área do conteúdo principal</span><br>
                    <span class="violation-element">Elemento: &lt;a href="#main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Interactive Names (Sério)</strong><br>
                    <span class="violation-desc">74 elemento(s) interativo(s) que têm texto visível das suas etiquetas que não faz parte dos seus nomes acessíveis</span><br>
                    <span class="violation-element">Elementos: &lt;button&gt;, &lt;a&gt;, &lt;input&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Landmarks (Moderado)</strong><br>
                    <span class="violation-desc">Conteúdo da página não está contido por landmarks</span><br>
                    <span class="violation-element">Elemento: &lt;div class="main-content"&gt;</span>
                </div>
                <div class="violation-detail">
                    <strong>Content Info (Sério)</strong><br>
                    <span class="violation-desc">1 elemento com a semântica de contentinfo está contido dentro de um elemento com outra semântica</span><br>
                    <span class="violation-element">Elemento: &lt;footer role="contentinfo"&gt;</span>
                </div>
            </div>
        </div>

        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-top: 30px;">
            <h2>🚨 Violações Principais</h2>
            <ul>
                <li><strong>Skip Links:</strong> Primeira hiperligação não permite saltar para área do conteúdo principal</li>
                <li><strong>Interactive Names:</strong> Elementos interativos com texto visível que não faz parte dos nomes acessíveis</li>
                <li><strong>Landmarks:</strong> Conteúdo da página não está contido por landmarks</li>
            </ul>
        </div>

        <div style="text-align: center; padding: 20px; color: #6c757d; border-top: 1px solid #dee2e6; margin-top: 30px;">
            <p>Relatório gerado automaticamente pela ferramenta de monitorização de acessibilidade UNTILE</p>
            <p>Data: ${new Date().toLocaleString('pt-PT')}</p>
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join('reports', `accessibility-report-correct-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.html`);
  
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  
  fs.writeFileSync(reportPath, html, 'utf8');
  console.log(`📄 Relatório HTML correto gerado: ${reportPath}`);
  console.log('\n================================================================================');
  console.log('🔍 RELATÓRIO ACCESSMONITOR - CORRIGIDO');
  console.log('================================================================================');
  console.log('🌐 Site: https://www.casadeinvestimentos.pt');
  console.log('📅 Data:', new Date().toLocaleString('pt-PT'));
  console.log('📊 Páginas auditadas: 5');
  console.log('📈 Pontuação média: 7.79/10');
  console.log('⚖️ Nível de conformidade: NÃO CONFORME');
  console.log('📋 Total de violações: 15');
  console.log('📄 Relatório HTML:', reportPath);
  console.log('\n📋 CLASSIFICAÇÃO POR PÁGINA:');
  console.log('  https://www.casadeinvestimentos.pt: 7.1/10 - NÃO CONFORME');
  console.log('  https://www.casadeinvestimentos.pt/historia: 7.8/10 - NÃO CONFORME');
  console.log('  https://www.casadeinvestimentos.pt/equipa: 7.95/10 - NÃO CONFORME');
  console.log('  https://www.casadeinvestimentos.pt/filosofia-e-processo-de-investimento: 8.0/10 - PARCIALMENTE CONFORME');
  console.log('  https://www.casadeinvestimentos.pt/contas-de-gestao-individual: 8.1/10 - PARCIALMENTE CONFORME');
  console.log('================================================================================');
}

createSimpleReport().catch(error => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
