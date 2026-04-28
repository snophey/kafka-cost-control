import { test, expect } from '@playwright/test';

test('login and logout flow', async ({ page }) => {
  // 1. Go to home page
  await page.goto('http://localhost:3000/');

  // 2. Ensure registration and login buttons are present, and no logout button
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).not.toBeVisible();

  // 3. Click on the login button
  await page.getByRole('button', { name: 'Login' }).click();

  // 4. Expect to be redirected to authentik (localhost:9000)
  await expect(page).toHaveURL(/.*localhost:9000.*/);

  // 5. Enter email and submit
  // Authentik usually has a 'Username or Email' field.
  // Based on the issue description, we look for that.
  await page.getByLabel(/Username/i).fill('test@example.com');
  await page.keyboard.press('Enter');

  // 6. Wait for password field and enter password
  const passwordField = page.getByLabel(/Password/i);
  await expect(passwordField).toBeVisible();
  await passwordField.fill('hunter2');
  await page.keyboard.press('Enter');

  // 7. Expect to end up again on 'localhost:3000/'
  await expect(page).toHaveURL('http://localhost:3000/');

  // 8. Logout button should be visible, but no login or register button
  await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Register' })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).not.toBeVisible();

  // 9. Click on the logout button
  await page.getByRole('link', { name: 'Logout' }).click();

  // 10. Expect to be redirected to authentik (localhost:9000) and see the username prompt
  await expect(page).toHaveURL(/.*localhost:9000.*/);
  await expect(page.getByLabel(/Username/i)).toBeVisible();

  // 11. Navigate back to localhost:3000/
  await page.goto('http://localhost:3000/');

  // 12. Ensure registration and login buttons have appeared again, and logout button is gone
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Logout' })).not.toBeVisible();
});
