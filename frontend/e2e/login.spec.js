const { test, expect } = require('@playwright/test');

test('un usuario puede iniciar sesión y acceder al dashboard', async ({ page }) => {
  await page.goto('/login.html');

  await page.getByLabel('Email').fill('pedro@gmail.com');
  await page.getByLabel('Contraseña').fill('12345678');

  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL(/dashboard\.html$/);

  const sesion = await page.evaluate(() => ({
    token: localStorage.getItem('finanzas_token'),
    usuario: JSON.parse(localStorage.getItem('finanzas_usuario')),
  }));

  expect(sesion.token).toBeTruthy();
  expect(sesion.usuario).toMatchObject({
    nombre: 'Pedro',
    email: 'pedro@gmail.com',
  });
});
