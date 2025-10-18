const puppeteer = require('puppeteer');

async function testAdminLogin() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating to admin login page...');
    await page.goto('http://localhost:3000/admin/login');

    console.log('Waiting for login form...');
    await page.waitForSelector('input[type="email"]');

    console.log('Filling login form...');
    await page.type('input[type="email"]', 'superadmin@smawahidiyah.edu');
    await page.type('input[type="password"]', 'admin123');

    console.log('Submitting login form...');
    await page.click('button[type="submit"]');

    console.log('Waiting for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);

    // Check if we're still on login page
    if (currentUrl.includes('/admin/login')) {
      console.log('Still on login page, checking for errors...');
      const errorText = await page.evaluate(() => {
        const errorEl = document.querySelector('[role="alert"], .error, .text-red-500');
        return errorEl ? errorEl.textContent : 'No error message found';
      });
      console.log('Error message:', errorText);
    } else {
      console.log('✅ Navigation successful');

      if (currentUrl.includes('/admin/dashboard')) {
        console.log('✅ Login successful, redirected to dashboard');

        // Check dashboard page
        console.log('Checking dashboard page...');
        const dashboardTitle = await page.$eval('h1', el => el.textContent).catch(() => 'No title found');
        console.log('Dashboard title:', dashboardTitle);

        const dashboardRequests = [];
        page.on('request', request => {
          if (request.resourceType() === 'script' || request.url().includes('.js')) {
            dashboardRequests.push(request.url());
          }
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Dashboard JS files loaded:', dashboardRequests.length);

        const dashboardReactLoaded = await page.evaluate(() => {
          return typeof window.React !== 'undefined';
        });
        console.log('Dashboard React loaded:', dashboardReactLoaded);

        console.log('Navigating to coding lab page...');
        await page.goto('http://localhost:3000/admin/coding-lab');

        await new Promise(resolve => setTimeout(resolve, 2000));

        const codingLabUrl = page.url();
        console.log('Coding lab page URL:', codingLabUrl);

        const title = await page.$eval('h1', el => el.textContent).catch(() => 'No title found');
        console.log('Page title:', title);

        // Check for JavaScript errors
        const jsErrors = [];
        const consoleLogs = [];
        
        page.on('pageerror', error => {
          jsErrors.push(error.message);
        });
        
        page.on('console', msg => {
          consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('JavaScript errors:', jsErrors.length > 0 ? jsErrors : 'None');
        console.log('Console logs (last 10):', consoleLogs.slice(-10));

        const hasButtons = await page.$('button') !== null;
        console.log('Has buttons:', hasButtons);

        // Check for specific elements
        const hasInputs = await page.$('input') !== null;
        const hasSelects = await page.$('select') !== null;
        console.log('Has inputs:', hasInputs);
        console.log('Has selects:', hasSelects);

        const content = await page.evaluate(() => document.body.innerText);
        console.log('Page content preview:', content.substring(0, 200) + '...');

        // Check if React is loaded
        const reactLoaded = await page.evaluate(() => {
          return typeof window.React !== 'undefined';
        });
        console.log('React loaded:', reactLoaded);

        // Check for specific coding lab elements
        const rubricElements = await page.$$('[data-testid="rubric"], .rubric, [class*="rubric"]');
        console.log('Rubric elements found:', rubricElements.length);

        // Check network requests
        const requests = [];
        page.on('request', request => {
          if (request.resourceType() === 'script' || request.url().includes('.js')) {
            requests.push(request.url());
          }
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('JavaScript files loaded:', requests.length);
        console.log('Sample JS URLs:', requests.slice(0, 3));

        // Check if main Next.js scripts are loaded
        const nextScripts = requests.filter(url => url.includes('_next') && url.includes('.js'));
        console.log('Next.js scripts loaded:', nextScripts.length);
      } else {
        console.log('❌ Unexpected redirect:', currentUrl);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

async function testDirectAccess() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Testing direct access to dashboard...');
    await page.goto('http://localhost:3000/admin/dashboard');

    await new Promise(resolve => setTimeout(resolve, 2000));

    const currentUrl = page.url();
    console.log('Direct dashboard URL:', currentUrl);

    const title = await page.$eval('h1', el => el.textContent).catch(() => 'No title found');
    console.log('Dashboard title:', title);

    const jsFiles = [];
    page.on('request', request => {
      if (request.resourceType() === 'script' || request.url().includes('.js')) {
        jsFiles.push(request.url());
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('JS files loaded:', jsFiles.length);

    const reactLoaded = await page.evaluate(() => {
      return typeof window.React !== 'undefined';
    });
    console.log('React loaded:', reactLoaded);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testAdminLogin();
testDirectAccess();