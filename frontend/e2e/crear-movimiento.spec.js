const { test, expect } = require('@playwright/test');

test('un usuario puede registrar un gasto y verlo en movimientos', async ({ page }) => {
  await page.goto('/login.html');

  await page.getByLabel('Email').fill('pedro@gmail.com');
  await page.getByLabel('Contraseña').fill('12345678');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/dashboard\.html$/);

  await page.goto('/categorias.html');

  const categoria = page.getByRole('button', { name: 'Alimentos', exact: true });
  await expect(categoria).toBeVisible();
  await categoria.click();

  await expect(categoria).toHaveAttribute('aria-pressed', 'true');

  await page.locator('input[name="tipo"][value="gasto"]').check();
  await page.locator('#monto').fill('1234.56');
  await page.getByRole('button', { name: 'Guardar movimiento' }).click();

  await page.goto('/movimientos.html');
  await page.getByRole('button', { name: 'Ver gastos' }).click();

  await expect(page.locator('#lista-movimientos')).toContainText('Alimentos');
  await expect(page.locator('#lista-movimientos')).toContainText('1234.56');
});
