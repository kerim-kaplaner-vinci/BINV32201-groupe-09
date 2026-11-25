import { expect, test, type Page } from "@playwright/test";

const openOffersAsLucas = async (page: Page): Promise<void> => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Connexion de démonstration" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Lucas Dupont", exact: true }).click();
  await page.getByRole("link", { name: "Offres", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Offres de stage" })).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
};

test("Scénario 1 — recherche par titre et visibilité des offres", async ({ page }) => {
  await openOffersAsLucas(page);
  await page.getByLabel("Rechercher par titre").fill("application");

  const table = page.getByRole("table");
  const rows = table.getByRole("row");
  const matchingRow = rows.filter({
    hasText: "Application React de gestion de flotte",
  });

  await expect(page.getByText("1 offre", { exact: true })).toBeVisible();
  await expect(rows).toHaveCount(2);
  await expect(matchingRow).toHaveCount(1);
  await expect(
    matchingRow.getByRole("cell", {
      name: "Application React de gestion de flotte",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    matchingRow.getByRole("cell", { name: "Lumen Digital", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", {
      name: "Migration d'une application vers le cloud",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("cell", { name: "API REST de facturation", exact: true }),
  ).toHaveCount(0);
});

test("Scénario 2 — recherche sans résultat", async ({ page }) => {
  await openOffersAsLucas(page);
  await page.getByLabel("Rechercher par titre").fill("blockchain");

  await expect(
    page.getByText("Aucune offre ne correspond à la recherche.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Aucune offre à afficher.", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.getByText(/^\d+ offres?$/)).toHaveCount(0);
});
