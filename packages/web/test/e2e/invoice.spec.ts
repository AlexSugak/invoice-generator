import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Invoice Page', () => {
  test('should generate and download PDF', async ({ page }) => {
    // 1. Navigate to invoice page
    await page.goto('http://localhost:3000/invoice');

    // 2. Fill in the form with test data
    await page.fill('input[name="invoiceNumber"]', '123');
    await page.fill('input[placeholder="Who is this to?"]', 'Client Name');
    await page.fill(
      'input[placeholder="Description of item/service..."]',
      'Test Service',
    );
    await page.fill('input[name="rate"]', '100');

    // 3. Set up download listener
    const downloadPromise = page.waitForEvent('download');

    // 4. Click generate button
    await page.click('button:has-text("Create Invoice PDF")');

    // 5. Wait for download to start
    const download = await downloadPromise;

    // 6. Verify download
    expect(download.suggestedFilename()).toMatch(
      /^invoice-\d{4}-\d{2}-\d{2}\.pdf$/,
    );

    // 7. Save file and verify it exists
    const downloadPath = path.join(
      __dirname,
      'downloads',
      download.suggestedFilename(),
    );
    await download.saveAs(downloadPath);

    // 8. Optional: Verify file size is non-zero
    const fs = require('fs');
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);
  });

  test('should save and load a draft', async ({ page }) => {
    // 1. Navigate to invoice page
    await page.goto('http://localhost:3000/invoice');

    // 2. Fill in some data
    await page.locator('input[name="invoiceNumber"]').fill('555');
    await page.locator('input[placeholder="Who is this to?"]').fill('Draft Client');
    const firstItemRow = page.locator('.space-y-4 > div').first();
    await firstItemRow.locator('input[placeholder*="Description"]').fill('Draft Service');
    await firstItemRow.getByLabel('Quantity').fill('5');
    await firstItemRow.getByLabel('Rate').fill('50');

    // 3. Name and save the draft
    const draftName = `my-test-draft-${Date.now()}`;
    await page.getByLabel('Draft Name').fill(draftName);

    const saveButton = page.locator('button:has-text("Save Invoice Draft")');

    // Wait for the button to be enabled, which indicates the session is loaded.
    await expect(saveButton).toBeEnabled();

    await saveButton.click();

    // 4. Verify URL is updated
    await expect(page).toHaveURL(`http://localhost:3000/invoice?draft=${draftName}`, { timeout: 10000 });

    // 5. Reload the page to simulate loading from URL
    await page.reload();

    // 6. Verify the form is pre-filled with draft data
    // Wait for the client name to be populated, which indicates the draft has loaded.
    await expect(page.locator('input[placeholder="Who is this to?"]')).toHaveValue('Draft Client');

    // Now that the form has loaded, verify the other fields.
    await expect(page.locator('input[name="invoiceNumber"]')).toHaveValue('555');
    await expect(firstItemRow.locator('input[placeholder*="Description"]')).toHaveValue('Draft Service');
    await expect(firstItemRow.getByLabel('Quantity')).toHaveValue('5');
    await expect(firstItemRow.getByLabel('Rate')).toHaveValue('50');
  });
});
