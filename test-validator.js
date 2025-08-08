const { WCAGValidator } = require('./src/validation/wcag-validator');

async function testValidator() {
  console.log('Testing WCAGValidator class...');
  
  const validator = new WCAGValidator();
  
  try {
    console.log('✅ Validator created');
    
    console.log('✅ Starting audit...');
    const result = await validator.auditSite('https://example.com', 'test_site');
    console.log('✅ Audit completed');
    console.log('Score:', result.wcagScore);
    console.log('Violations:', result.violations.length);
    
    await validator.close();
    console.log('✅ Validator closed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testValidator();
