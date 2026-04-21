import { test, expect } from '@playwright/test';

test.describe('Sanctuary Stream Remote Control Integration (E2E)', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Load the app
    await page.goto('/');

    // 2. Handle potential Setup Wizard
    const setupWizardHeading = page.getByRole('heading', { name: 'Initial Setup' });
    if (await setupWizardHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.getByPlaceholder('http://127.0.0.1:8090').fill('http://127.0.0.1:8090');
      await page.getByRole('button', { name: 'Establish Connection' }).click();
      await expect(page.getByText('Handshake Successful')).toBeVisible();
      await page.getByLabel('Admin Email').fill('admin@local.dev');
      await page.getByLabel('Access Password').fill('admin123456');
      await page.getByLabel('Station Name').fill('Remote Control E2E');
      await page.getByRole('button', { name: 'Create Stream Account' }).click();
    }

    // 3. Ensure we are signed in
    await expect(page.getByText('Signed in as')).toBeVisible({ timeout: 15000 });
  });

  test('Verify Production Switcher scene switching flow', async ({ page }) => {
    // Navigate to Stream Control if not already there
    await page.getByRole('button', { name: 'Stream Control' }).click();

    // 1. Verify Input Bank is populated (by Mock OBS)
    // Scenes from mock-obs: 'Wide Shot', 'Pulpit Zoom', 'Liturgy Overlay', 'Worship Band'
    const wideShotBtn = page.getByTitle('Send "Wide Shot" to Preview');
    const zoomShotBtn = page.getByTitle('Send "Pulpit Zoom" to Preview');
    
    await expect(wideShotBtn).toBeVisible();
    await expect(zoomShotBtn).toBeVisible();

    // 2. Send "Pulpit Zoom" to Preview
    await zoomShotBtn.click();
    
    // Verify T-Bar buttons are now enabled
    const cutBtn = page.locator('#cut-transition-btn');
    const autoBtn = page.locator('#auto-transition-btn');
    await expect(cutBtn).toBeEnabled();
    await expect(autoBtn).toBeEnabled();

    // 3. Perform a CUT transition
    await cutBtn.click();

    // 4. Verify Preview is cleared after CUT
    // (In our implementation, preview is cleared when committed)
    await expect(cutBtn).toBeDisabled();
    
    // 5. Verify the scene button state changed (visual cues like rose-500 border for program)
    // We check the role/label of the zoom-shot button
    await expect(page.getByText('PGM').first()).toBeVisible();
    
    // 6. Test AUTO transition with animation
    await wideShotBtn.click(); // Send another scene to preview
    await expect(autoBtn).toBeEnabled();
    await autoBtn.click();
    
    // Wait for transition animation to complete (normal is 1000ms)
    await page.waitForTimeout(1500);
    await expect(autoBtn).toBeDisabled();
  });

  test('Verify Audio Mixer integration', async ({ page }) => {
    // 1. Verify Audio Mixer exists
    const mixerHeading = page.getByText('Audio Inputs');
    await expect(mixerHeading).toBeVisible();

    // 2. Check for an input (e.g. Mic/Aux from Mock OBS)
    const micLabel = page.getByText('Mic/Aux');
    await expect(micLabel).toBeVisible();

    // 3. Toggle Mute
    const muteButton = page.locator('button').filter({ hasText: 'Mute' }).first();
    const isMutedBefore = await muteButton.getAttribute('class');
    
    await muteButton.click();
    
    // Check if class changed (visual feedback)
    const isMutedAfter = await muteButton.getAttribute('class');
    expect(isMutedAfter).not.toBe(isMutedBefore);
  });
});
