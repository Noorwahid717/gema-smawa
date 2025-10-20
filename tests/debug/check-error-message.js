const { chromium } = require('playwright');

async function checkErrorMessage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/admin/login');
    
    console.log('Testing invalid login...');
    await page.getByPlaceholder('admin@smawahidiyah.edu').fill('invalid@admin.com');
    await page.getByPlaceholder('Masukkan password').fill('wrong-password');
    await page.getByRole('button', { name: /Masuk Admin/ }).click();
    
    // Wait a bit for error to appear
    await page.waitForTimeout(2000);
    
    console.log('Looking for error messages...');
    
    // Check various error selectors
    const errorSelectors = [
      '[data-testid="error-message"]',
      '.error-message',
      '.text-red-500',
      '.text-red-600', 
      '[class*="error"]',
      'div[role="alert"]',
      '.bg-red-50',
      'p.text-red-500',
      'span.text-red-500'
    ];
    
    for (const selector of errorSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        const text = await page.locator(selector).first().textContent();
        console.log(`✅ Found error with selector "${selector}": "${text}"`);
      }
    }
    
    // Check all text that might be error-related
    const allText = await page.locator('body').textContent();
    const errorKeywords = ['error', 'invalid', 'wrong', 'failed', 'gagal', 'salah'];
    const foundErrors = errorKeywords.filter(keyword => 
      allText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (foundErrors.length > 0) {
      console.log('Found error keywords in page:', foundErrors);
    }
    
    // Check if we're still on login page (meaning login failed)
    const stillOnLogin = page.url().includes('/admin/login');
    console.log('Still on login page:', stillOnLogin);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

checkErrorMessage();
