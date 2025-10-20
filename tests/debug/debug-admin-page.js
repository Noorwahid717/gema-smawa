const { chromium } = require('playwright');

async function debugAdminPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to admin login...');
    await page.goto('http://localhost:3000/admin/login');
    
    console.log('Page title:', await page.title());
    console.log('URL:', page.url());
    
    console.log('Page content preview:');
    const bodyText = await page.locator('body').textContent();
    console.log(bodyText.substring(0, 500) + '...');
    
    console.log('Looking for headings...');
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Headings found:', headings);
    
    console.log('Looking for forms...');
    const forms = await page.locator('form').count();
    console.log('Forms found:', forms);
    
    console.log('Looking for input fields...');
    const inputs = await page.locator('input').count();
    console.log('Input fields found:', inputs);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugAdminPage();
