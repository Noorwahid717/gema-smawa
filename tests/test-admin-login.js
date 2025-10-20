const { chromium } = require('playwright');

async function testAdminLogin() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to admin login...');
    await page.goto('http://localhost:3000/admin/login');
    
    console.log('Checking login page...');
    const heading = await page.locator('h1:has-text("Masuk Admin")').isVisible();
    console.log('Login page visible:', heading);
    
    if (heading) {
      console.log('Filling credentials...');
      await page.fill('input[name="email"]', 'superadmin@smawahidiyah.edu');
      await page.fill('input[name="password"]', 'admin123');
      
      console.log('Clicking login...');
      await page.click('button:has-text("Masuk Admin")');
      
      console.log('Waiting for navigation...');
      await page.waitForURL('**/admin/dashboard', { timeout: 30000 });
      
      console.log('Checking dashboard...');
      const dashboardHeading = await page.locator('h1:has-text("Dashboard Admin")').isVisible();
      console.log('Dashboard visible:', dashboardHeading);
      
      if (dashboardHeading) {
        console.log('✅ Admin login successful!');
        
        console.log('Trying to navigate to profile...');
        await page.goto('http://localhost:3000/admin/profile');
        
        console.log('Waiting for profile page...');
        await page.waitForSelector('h1:has-text("Profile Admin")', { timeout: 10000 });
        
        const profileHeading = await page.locator('h1:has-text("Profile Admin")').isVisible();
        console.log('Profile page visible:', profileHeading);
        
        if (profileHeading) {
          console.log('✅ Profile page accessible!');
        } else {
          console.log('❌ Profile page not accessible');
        }
      } else {
        console.log('❌ Dashboard not accessible');
      }
    } else {
      console.log('❌ Login page not accessible');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminLogin();
