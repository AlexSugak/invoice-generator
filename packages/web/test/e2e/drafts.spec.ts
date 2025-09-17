import { test, expect } from '@playwright/test';

test('should load draft when draft param is present in URL', async ({
  page,
}) => {
  await page.goto('http://localhost:3000/invoice?draft=test-draft');

  const invoiceNumber = await page.inputValue('input[name="invoiceNumber"]');
  expect(invoiceNumber).toBeTruthy();
});

test('should disable button while PDF is being generated', async ({ page }) => {
  await page.goto('http://localhost:3000/invoice');

  await page.click('button:has-text("Create Invoice PDF")');

  const isDisabled = await page.getAttribute(
    'button:has-text("Create Invoice PDF")',
    'disabled',
  );
  expect(isDisabled).not.toBeNull();
});

test('should show empty invoice when no drafts exist', async ({ page }) => {
  await page.goto('http://localhost:3000/invoice?user=newuser');

  const invoiceNumber = await page.inputValue('input[name="invoiceNumber"]');
  expect(invoiceNumber).toBe('1');
});

test('should not auto-save if invoice is untouched', async ({ page }) => {
  await page.goto('http://localhost:3000/invoice');

  await page.waitForTimeout(1200);

  await page.reload();

  const invoiceNumber = await page.inputValue('input[name="invoiceNumber"]');
  expect(invoiceNumber).toBe('1');
});
