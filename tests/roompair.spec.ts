import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end flows for the RoomPair demo. Selectors use roles and names, so
 * the tests hold in every design language.
 */

const card = (page: Page) => page.getByRole("heading", { level: 2, name: /^(Ella|Leo|Ines|Maya|Noah|Felix|Sofia|Anna|Oliver)/ }).first();

async function openApp(page: Page, language?: string, layout: "blocks" | "tabs" = "blocks") {
  if (language)
    await page.addInitScript(
      ([l, lay]) => localStorage.setItem("roompair-appearance-v1", JSON.stringify({ language: l, layout: lay })),
      [language, layout],
    );
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Good people. Better living.", level: 1 })).toBeVisible();
}

test("discover shows the card and grouped details; arrows pass, undo restores", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openApp(page);
  await expect(card(page)).toHaveText(/Ella, 23/);
  const portrait = page.getByRole("img", { name: "Ella" }).first();
  await expect.poll(() => portrait.evaluate((img) => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(100);
  // Home → Person → Fit, each its own section
  await expect(page.getByRole("region", { name: "The room" })).toBeVisible();
  await expect(page.getByRole("region", { name: "About Ella" })).toBeVisible();
  await expect(page.getByRole("region", { name: /Why 96%/ })).toBeVisible();

  await page.keyboard.press("ArrowLeft");
  await expect(card(page)).toHaveText(/Leo, 24/);
  await expect(page.getByRole("status")).toContainText("Passed");
  await page.getByRole("button", { name: "Undo" }).first().click();
  await expect(card(page)).toHaveText(/Ella, 23/);
  expect(errors).toEqual([]);
});

test("a mutual like opens a match, then a conversation with a simulated reply", async ({ page }) => {
  await openApp(page);
  await page.keyboard.press("ArrowRight");
  const match = page.getByRole("dialog", { name: "It’s a RoomPair!" });
  await expect(match).toBeVisible();
  await match.getByRole("button", { name: "Say a little hello" }).click();
  await expect(page.getByRole("heading", { name: "From hello to home.", level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "What’s your ideal Sunday at home?" }).click();
  await expect(page.getByText("What’s your ideal Sunday at home?").last()).toBeVisible();
  const conversation = page.getByRole("region", { name: "Ella" });
  await expect(conversation.getByText(/respect each other’s space/)).toBeVisible({ timeout: 6000 });
});

test("the top-right menu switches all six design languages and remembers the choice", async ({ page }) => {
  await openApp(page);
  const app = page.locator("[data-direction]").first();
  const languages: [string, string][] = [
    ["A · Sohbet", "chat"],
    ["B · Kolaj", "collage"],
    ["C · Afiş", "poster"],
    ["D · Gün", "day"],
    ["E · Ev Planı", "plan"],
    ["F · Kart", "card"],
  ];
  for (const [name, id] of languages) {
    await page.getByRole("button", { name: /Design/ }).click();
    await page.getByRole("radio", { name: new RegExp(`^${name}`) }).click();
    await expect(app).toHaveAttribute("data-direction", id);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { level: 2, name: /Ella/ }).first()).toBeVisible();
  }
  // Kolaj palettes and the tabs layout
  await page.getByRole("button", { name: /Design/ }).click();
  await page.getByRole("radio", { name: /^B · Kolaj/ }).click();
  await page.getByRole("radio", { name: "Gece" }).click();
  await expect(app).toHaveAttribute("data-palette", "night");
  await page.getByRole("radio", { name: "Tabs" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tablist", { name: "Profile sections" })).toBeVisible();
  await page.getByRole("tab", { name: "Ella" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("About Ella");

  await page.reload();
  await expect(app).toHaveAttribute("data-direction", "collage");
  await expect(app).toHaveAttribute("data-palette", "night");
  await expect(page.getByRole("tablist", { name: "Profile sections" })).toBeVisible();
});

test("likes, rooms, the shared space and the moving checklist", async ({ page }) => {
  await openApp(page, "plan");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("button", { name: /Likes/ }).click();
  await expect(page.getByRole("tab", { name: /Liked you/ })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Like back" }).first().click();
  await expect(page.getByRole("dialog", { name: "It’s a RoomPair!" })).toBeVisible();
  await page.getByRole("button", { name: "Keep exploring" }).click();

  await nav.getByRole("button", { name: "Discover" }).click();
  await page.getByRole("radio", { name: "Find a room" }).click();
  await page.getByRole("button", { name: "Save room", exact: true }).first().click();
  await expect(page.getByRole("status")).toContainText("Saved");

  await nav.getByRole("button", { name: "My space" }).click();
  await expect(page.getByRole("heading", { name: /Places worth a look · 2/ })).toBeVisible();
  const task = page.getByRole("button", { name: /Find your cleaning rhythm/ });
  await task.click();
  await expect(task).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("textbox", { name: "Shared notes" }).fill("Ask about the balcony");
  await page.reload();
  await nav.getByRole("button", { name: "My space" }).click();
  await expect(page.getByRole("textbox", { name: "Shared notes" })).toHaveValue("Ask about the balcony");
});

test("filters validate, onboarding updates the profile, report and block work", async ({ page }) => {
  await openApp(page, "day");
  await page.getByRole("button", { name: "Filters" }).click();
  const filters = page.getByRole("dialog", { name: "Filters" });
  await filters.getByRole("spinbutton", { name: "Monthly budget, from" }).fill("900");
  await expect(filters.getByRole("alert")).toContainText("maximum budget");
  await filters.getByRole("spinbutton", { name: "Monthly budget, from" }).fill("350");
  await filters.getByRole("button", { name: "Show my people" }).click();
  await expect(filters).toBeHidden();

  await page.getByRole("button", { name: "Find your living style" }).click();
  const setup = page.getByRole("dialog", { name: "A little about you" });
  await setup.getByRole("textbox", { name: "What should we call you?" }).fill("");
  await setup.getByRole("button", { name: "Continue" }).click();
  await expect(setup.getByRole("alert")).toContainText("Please enter your name");
  await setup.getByRole("textbox", { name: "What should we call you?" }).fill("Deniz");
  for (let i = 0; i < 3; i++) await setup.getByRole("button", { name: "Continue" }).click();
  await setup.getByRole("button", { name: "Find my people" }).click();
  await expect(page.getByRole("status")).toContainText("Deniz");
  await expect(page.getByRole("button", { name: "View your profile" })).toHaveText("D");

  await page.getByRole("button", { name: "Report" }).first().click();
  const options = page.getByRole("dialog", { name: "Profile options" });
  await options.getByRole("button", { name: /^Block Ella/ }).click();
  await expect(page.getByRole("status")).toContainText("blocked");
  await expect(card(page)).not.toHaveText(/Ella/);
});

test("Turkish interface and a phone-sized layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page, "poster");
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNav).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: /Design/ }).click();
  await page.getByRole("radio", { name: "Türkçe" }).click();
  await page.keyboard.press("Escape");
  const turkishNav = page.getByRole("navigation", { name: "Mobil gezinme" });
  await expect(turkishNav.getByRole("button", { name: /Keşfet/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Tasarım/ })).toBeVisible();
  await turkishNav.getByRole("button", { name: /Mesajlar/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText("From hello to home.");
});
