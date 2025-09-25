import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Invoice Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { email: 'test-user' },
          expires: '2099-01-01T00:00:00.000Z'
        }),
      });
    });
  });
  
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

  test('select should be visible, with mocked drafts and should allow selection', async ({ page }) => {
    await page.route('**/api/users/test-user/drafts', async route => {
      const apiKey = route.request().headers()['x-api-key'];
      expect(apiKey).toBeDefined();
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { userName: 'test-user', name: 'draft-1', content: 'Initial content' },
          { userName: 'test-user', name: 'draft-2', content: 'Some content' },
        ]),
      });
    });

    await page.goto('http://localhost:3000/invoice');
    const select = page.locator('select[name="drafts"]');
    await expect(select).toBeVisible();
    
    await expect(select.locator('option')).toHaveCount(4)
    
    await page.selectOption('select[name="drafts"]', { label: 'draft-2' }, { timeout: 10000 });
    await expect(select).toHaveValue('draft-2');
  });

  test('should open modal with buttons when clicking Save/Edit draft', async ({ page }) => {
    await page.goto('http://localhost:3000/invoice');

    await expect(page.locator('button:has-text("Save/Edit current draft")')).toBeVisible();

    await page.click('button:has-text("Save/Edit current draft")');

    const modal = page.locator('div.update-modal');
    await expect(modal).toBeVisible();

    await expect(modal.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(modal.locator('button:has-text("Save draft")')).toBeVisible();
    await expect(modal.locator('button:has-text("Delete draft")')).toBeVisible();
  });

  test('should show selected draft name in modal input', async ({ page }) => {
    await page.route('**/api/users/test-user/drafts', async route => {
      const apiKey = route.request().headers()['x-api-key'];
      expect(apiKey).toBeDefined();
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { userName: 'test-user', name: 'draft-1', content: 'Initial content' },
          { userName: 'test-user', name: 'draft-2', content: 'Some content' },
        ]),
      });
    });

    await page.goto('http://localhost:3000/invoice');

    const select = page.locator('select[name="drafts"]');
    await expect(select).toBeVisible();

    await page.selectOption('select[name="drafts"]', { value: 'draft-1' }, { timeout: 10000 });
    await expect(select).toHaveValue('draft-1');

    await page.click('button:has-text("Save/Edit current draft")');

    const modal = page.locator('div.update-modal');
    await expect(modal).toBeVisible();
    
    const input = modal.locator('input[name="draftName"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('draft-1');
  });

  test('should close modal when clicking Cancel button', async ({ page }) => {
    await page.goto('http://localhost:3000/invoice');

    await page.click('button:has-text("Save/Edit current draft")');
    const modal = page.locator('div.update-modal');
    await expect(modal).toBeVisible();
    await page.click('button:has-text("Cancel")');
    await expect(modal).toBeHidden();
  });

  test('should delete selected draft from DB when clicking Delete and close modal', async ({ page }) => {
    await page.route('**/api/users/test-user/drafts', async route => {
      const apiKey = route.request().headers()['x-api-key'];
      expect(apiKey).toBeDefined();
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { userName: 'test-user', name: 'draft-1', content: 'Initial content' },
          { userName: 'test-user', name: 'draft-2', content: 'Some content' },
        ]),
      });
    });

    let deleteCalled = false;
    await page.route('**/api/users/test-user/drafts/draft-1', async route => {
      const apiKey = route.request().headers()['x-api-key'];
      expect(apiKey).toBeDefined();

      expect(route.request().method()).toBe('DELETE');
      deleteCalled = true;

      await route.fulfill({
        status: 204,
        body: '',
      });
    });

    await page.goto('http://localhost:3000/invoice');

    const select = page.locator('select[name="drafts"]');
    await expect(select).toBeVisible();

    await page.selectOption('select[name="drafts"]', { value: 'draft-1' }, { timeout: 10000 });
    await expect(select).toHaveValue('draft-1');

    await page.click('button:has-text("Save/Edit current draft")');
    const modal = page.locator('div.update-modal');
    await expect(modal).toBeVisible();
    
    await modal.locator('button:has-text("Delete draft")').click();
    await expect(modal).toBeHidden();
    await expect(select).not.toHaveValue('draft-1');
  });

  test('should save selected draft to DB when clicking Save', async ({ page }) => {
    await page.route('**/api/users/test-user/drafts', async route => {
      const apiKey = route.request().headers()['x-api-key'];
      expect(apiKey).toBeDefined();
      expect(route.request().method()).toBe('GET');

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { userName: 'test-user', name: 'draft-1', content: 'Initial content' },
          { userName: 'test-user', name: 'draft-2', content: 'Some content' },
        ]),
      });
    });

    let saveCalled = false;
    let savedPayload: any = null;

    await page.route('**/api/users/test-user/drafts/draft-1', async route => {
      const apiKey = route.request().headers()['x-api-key'];
      expect(apiKey).toBeDefined();
      expect(route.request().method()).toBe('PUT');

      saveCalled = true;
      savedPayload = await route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
   

    await page.goto('http://localhost:3000/invoice');

    const select = page.locator('select[name="drafts"]');
    await expect(select).toBeVisible();
    await page.selectOption('select[name="drafts"]', { value: 'draft-1' }, { timeout: 10000 });
    await expect(select).toHaveValue('draft-1');

    await page.fill('textarea[name="notes"]', 'Updated notes content');

    await page.click('button:has-text("Save/Edit current draft")');

    const modal = page.locator('div.update-modal');
    await expect(modal).toBeVisible();
    const input = modal.locator('input[name="draftName"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('draft-1');

    await page.click('button:has-text("Save Draft")');

    expect(saveCalled).toBe(true);
    expect(savedPayload).not.toBeNull();
    console.log('savedPayload', savedPayload)
    expect(savedPayload).toMatchObject({
      notes: 'Updated notes content',
    });
    
  });
  
  test('should disable Save button if no draft selected and input is empty', async ({ page }) => {
    await page.goto('http://localhost:3000/invoice');

    await page.click('button:has-text("Save/Edit current draft")');
    const modal = page.locator('div.update-modal');
    await expect(modal).toBeVisible();

    const input = modal.locator('input[name="draftName"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('');

    const saveButton = page.locator('button:has-text("Save draft")');
    await expect(saveButton).toBeDisabled();
  });
});
