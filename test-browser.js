const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('Page Title:', await page.title());
    
    // Take a screenshot of the landing page
    await page.screenshot({ path: 'landing-page.png' });
    console.log('Screenshot saved as landing-page.png');

    // Check for login button or similar
    const loginLink = await page.getByRole('link', { name: /login|sign in/i });
    if (await loginLink.count() > 0) {
      console.log('Login link found, clicking...');
      await loginLink.first().click();
      await page.waitForURL('**/login');
      console.log('Arrived at login page');
      await page.screenshot({ path: 'login-page.png' });
    }

  } catch (error) {
    console.error('Error during browser testing:', error);
  } finally {
    console.log('Closing browser in 5 seconds...');
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
  }
})();
