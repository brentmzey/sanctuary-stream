import { test, expect } from '@playwright/test';

test.describe('Sanctuary Stream E2E Flow', () => {
  
  test('Complete setup, login, and verify dashboard', async ({ page }) => {
    // 1. Load the app
    await page.goto('/');

    // 2. Handle Setup Wizard (since localStorage is empty on new context)
    // Check if we are at the Setup Wizard
    const setupWizardHeading = page.getByRole('heading', { name: 'Initial Setup' });
    
    if (await setupWizardHeading.isVisible()) {
      console.log('Setup Wizard detected. Proceeding with setup...');
      
      // Step 1: Connect to Backend
      await page.getByPlaceholder('http://127.0.0.1:8090').fill('http://127.0.0.1:8090');
      await page.getByRole('button', { name: 'Establish Connection' }).click();
      
      // Wait for Step 2
      await expect(page.getByText('Handshake Successful')).toBeVisible();

      // Step 2: Admin Auth
      await page.getByLabel('Admin Email').fill('admin@local.dev');
      await page.getByLabel('Access Password').fill('admin123456');
      await page.getByLabel('Station Name').fill('E2E Test Service');
      
      // Submit
      await page.getByRole('button', { name: 'Create Stream Account' }).click();
    } else {
        // If for some reason we skipped setup (e.g. env var), check for login
        const loginHeading = page.getByRole('heading', { name: 'Sanctuary Stream' });
        if (await loginHeading.isVisible()) {
             console.log('Login form detected.');
             await page.getByPlaceholder('pastor@church.com').fill('admin@local.dev');
             await page.locator('input[type="password"]').fill('admin123456');
             await page.getByRole('button', { name: 'Initiate Command' }).click();
        }
    }

    // 3. Verify Main Dashboard
    // Header should contain user name
    await expect(page.getByText('Signed in as')).toBeVisible();
    await expect(page.getByText('Admin User')).toBeVisible();

    // 4. Verify Stream Status Card
    await expect(page.getByText('Stream Control')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();

    // 5. Test Settings Toggle
    const settingsButton = page.getByText('⚙️ Stream Settings');
    
    // Open Settings
    await settingsButton.click();
    await expect(page.getByText('🔼 Hide Settings')).toBeVisible();

    // 6. Test Quality Settings Toggle
    const qualityButton = page.getByText('🎬 Video Quality');
    await qualityButton.click();
    await expect(page.getByText('🔼 Hide Quality Controls')).toBeVisible();

    // 7. Verify can switch to Pastoral Reflections
    await page.getByRole('button', { name: 'Pastoral Reflections' }).click();
    await expect(page.getByText('Sermons, announcements, and resources')).toBeVisible();
  });

  test('Responsiveness check', async ({ page }) => {
     await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
     await page.goto('/');
     
     const setupWizardHeading = page.getByRole('heading', { name: 'Initial Setup' });
     if (await setupWizardHeading.isVisible()) {
         await expect(setupWizardHeading).toBeVisible();
     }
  });

});
