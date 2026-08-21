// tests/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Flujo de Navegación de Propiedades', () => {
  test('debe cargar la lista de propiedades y navegar al detalle', async ({ page }) => {
    // 1. Visitar el buscador
    await page.goto('http://localhost:3000/propiedades');

    // 2. Verificar que exista al menos una tarjeta de propiedad
    const firstCard = page.locator('article, .property-card').first();
    await expect(firstCard).toBeVisible();

    // 3. Hacer clic en la primera tarjeta o en su botón de ficha
    await firstCard.click();

    // 4. Confirmar cambio de URL hacia la ficha técnica ([slug])
    await expect(page).toHaveURL(/\/propiedades\/.+/);
  });
});

// Comando para correr las pruebas en modo gráfico y ver cómo el navegador automatizado interactúa con tu web
// npx playwright test --ui