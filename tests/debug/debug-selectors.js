const { chromium } = require('playwright');

async function debugSelectors() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/admin/login');
    
    console.log('Testing selectors from test...');
    
    // Test heading selector
    console.log('1. Testing heading selector: h1:has-text("Masuk Admin")');
    const heading1 = await page.locator('h1:has-text("Masuk Admin")').isVisible();
    console.log('   Result:', heading1);
    
    console.log('2. Testing heading selector: [role="heading"]:has-text("Masuk Admin")');
    const heading2 = await page.locator('[role="heading"]:has-text("Masuk Admin")').isVisible();
    console.log('   Result:', heading2);
    
    console.log('3. Testing heading selector: h2:has-text("Masuk Admin")');
    const heading3 = await page.locator('h2:has-text("Masuk Admin")').isVisible();
    console.log('   Result:', heading3);
    
    // Test input selectors
    console.log('4. Testing email input: input[name="email"]');
    const email1 = await page.locator('input[name="email"]').count();
    console.log('   Count:', email1);
    
    console.log('5. Testing email input: [placeholder*="Email"]');
    const email2 = await page.locator('[placeholder*="Email"]').count();
    console.log('   Count:', email2);
    
    console.log('6. Testing password input: input[name="password"]');
    const password1 = await page.locator('input[name="password"]').count();
    console.log('   Count:', password1);
    
    // Test button selector
    console.log('7. Testing button: button:has-text("Masuk Admin")');
    const button1 = await page.locator('button:has-text("Masuk Admin")').count();
    console.log('   Count:', button1);
    
    console.log('8. Testing button: [type="submit"]');
    const button2 = await page.locator('[type="submit"]').count();
    console.log('   Count:', button2);
    
    // Get all input placeholders
    console.log('9. Input placeholders:');
    const placeholders = await page.locator('input').evaluateAll(inputs => 
      inputs.map(input => input.placeholder)
    );
    console.log('   Placeholders:', placeholders);
    
    // Get all button texts
    console.log('10. Button texts:');
    const buttonTexts = await page.locator('button').evaluateAll(buttons => 
      buttons.map(button => button.textContent?.trim())
    );
    console.log('   Button texts:', buttonTexts);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugSelectors();
