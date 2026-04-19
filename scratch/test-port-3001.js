const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    console.log('Page Title:', await page.title());
    
    // Check for "EduCore" text
    const content = await page.content();
    if (content.includes('EduCore')) {
      console.log('Found "EduCore" on the page');
    } else {
      console.log('"EduCore" not found on the page');
    }

    // Check for login button
    const loginLink = await page.getByRole('link', { name: /login|sign in/i });
    if (await loginLink.count() > 0) {
      console.log('Login link found');
      await loginLink.first().click();
      await page.waitForURL('**/login');
      console.log('Arrived at login page:', page.url());
    }

  } catch (error) {
    console.error('Error during browser testing:', error);
  } finally {
    await browser.close();
  }
})();
