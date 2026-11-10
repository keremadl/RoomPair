import { test, expect, type Page } from "@playwright/test";

const desktopNav = (page: Page) =>
  page.getByRole("navigation", { name: "Main navigation", exact: true });
const currentCard = (page: Page) => page.locator(".swipe-card");

async function openApp(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Good people. Better living.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    currentCard(page).getByRole("heading", { name: "Ella, 23" }),
  ).toBeVisible();
}

test("discovery renders real assets, explains fit, and supports pass and undo", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openApp(page);
  const portrait = currentCard(page).getByRole("img", {
    name: "Ella, Design student",
  });
  await expect(portrait).toBeVisible();
  await expect
    .poll(() =>
      portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(100);
  await page.getByRole("button", { name: "Why you fit", exact: true }).click();
  const compatibility = page.getByRole("dialog", {
    name: "Why you fit",
    exact: true,
  });
  await expect(compatibility.locator(".large-fit-score")).toContainText("96");
  await expect(
    compatibility.getByText("Budget", { exact: true }),
  ).toBeVisible();
  await expect(
    compatibility.getByText(/not a prediction or a guarantee/),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(compatibility).toBeHidden();
  await page.keyboard.press("ArrowLeft");
  await expect(currentCard(page)).toHaveCount(1);
  await expect(
    currentCard(page).getByRole("heading", { name: "Leo, 24" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Undo/, exact: false }).click();
  await expect(
    currentCard(page).getByRole("heading", { name: "Ella, 23" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("desktop-discovery.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("mutual like creates a match, opens chat, simulates a reply and persists after reload", async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole("button", { name: "Like", exact: true }).click();
  const match = page.getByRole("dialog", {
    name: "It’s a RoomPair!",
    exact: true,
  });
  await expect(match).toBeVisible();
  await expect(match).toContainText("Ella");
  await match
    .getByRole("button", { name: "Say a little hello", exact: true })
    .click();
  await expect(page.locator(".conversation-header")).toContainText("Ella");
  await page
    .getByRole("textbox", { name: "Say something nice…", exact: true })
    .fill("Would you like to meet for coffee?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page
      .locator(".message-stream")
      .getByText("Would you like to meet for coffee?", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".message-stream")
      .getByText(/Coffee sounds lovely! How about Saturday at 11/),
  ).toBeVisible();
  await page.reload();
  await desktopNav(page)
    .getByRole("button", { name: /^Messages/ })
    .click();
  await page.locator(".conversation-item").filter({ hasText: "Ella" }).click();
  await expect(
    page
      .locator(".message-stream")
      .getByText("Would you like to meet for coffee?", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".message-stream")
      .getByText(/Coffee sounds lovely! How about Saturday at 11/),
  ).toBeVisible();
});

test("an impossible city produces an honest empty feed and restoring Riga restores people", async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole("button", { name: /^Filters/ }).click();
  let filters = page.getByRole("dialog", { name: "Filters", exact: true });
  await filters
    .getByRole("textbox", { name: "City", exact: true })
    .fill("Tallinn");
  await filters
    .getByRole("button", { name: "Show my people", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "You’re all caught up.", exact: true }),
  ).toBeVisible();
  await expect(currentCard(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Like", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Adjust my search", exact: true })
    .click();
  filters = page.getByRole("dialog", { name: "Filters", exact: true });
  await filters
    .getByRole("textbox", { name: "City", exact: true })
    .fill("Riga");
  await filters
    .getByRole("button", { name: "Show my people", exact: true })
    .click();
  await expect(
    currentCard(page).getByRole("heading", { name: "Ella, 23" }),
  ).toBeVisible();
});

test("saved rooms, checklist and notes persist; reset restores the original demo", async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole("button", { name: "Find a room", exact: true }).click();
  const room = page
    .locator(".room-card")
    .filter({ hasText: "A peaceful corner in Avoti" });
  await room.getByRole("button", { name: "Save room", exact: true }).click();
  await expect(
    room.getByRole("button", { name: "Unsave room", exact: true }),
  ).toBeVisible();
  await desktopNav(page)
    .getByRole("button", { name: "My space", exact: true })
    .click();
  await expect(
    page.locator(".saved-rooms").getByRole("heading", {
      name: "A peaceful corner in Avoti",
      exact: true,
    }),
  ).toBeVisible();
  const cleaning = page.getByRole("button", {
    name: /Find your cleaning rhythm/,
  });
  await cleaning.click();
  await expect(cleaning).toHaveClass(/checked/);
  await page
    .getByRole("textbox", { name: "Shared notes", exact: true })
    .fill("Ask about bike storage at the viewing.");
  await page.reload();
  await desktopNav(page)
    .getByRole("button", { name: "My space", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Shared notes", exact: true }),
  ).toHaveValue("Ask about bike storage at the viewing.");
  await expect(
    page.getByRole("button", { name: /Find your cleaning rhythm/ }),
  ).toHaveClass(/checked/);
  await expect(
    page.locator(".saved-rooms").getByRole("heading", {
      name: "A peaceful corner in Avoti",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "View your profile", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Demo settings & data", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset demo data", exact: true })
    .click();
  await expect(
    currentCard(page).getByRole("heading", { name: "Ella, 23" }),
  ).toBeVisible();
  await desktopNav(page)
    .getByRole("button", { name: "My space", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Shared notes", exact: true }),
  ).toHaveValue("");
  await expect(
    page.getByRole("button", { name: /Find your cleaning rhythm/ }),
  ).not.toHaveClass(/checked/);
  await expect(
    page.locator(".saved-rooms").getByRole("heading", {
      name: "A peaceful corner in Avoti",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(page.locator(".saved-rooms .room-card")).toHaveCount(1);
});

test("four-step onboarding saves the user and a room host sees people looking for a room", async ({
  page,
}) => {
  await openApp(page);
  await page
    .getByRole("button", { name: "Find your living style", exact: true })
    .click();
  const onboarding = page.locator(".ob-shell");
  await onboarding
    .getByRole("textbox", { name: "What should we call you?", exact: true })
    .fill("Jordan");
  await onboarding
    .locator(".ob-intent")
    .filter({ hasText: "I have a room to share" })
    .click();
  await onboarding
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(
    onboarding.getByRole("heading", {
      name: "Make room for what matters",
      exact: true,
    }),
  ).toBeVisible();
  await onboarding
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(
    onboarding.getByRole("heading", {
      name: "Your kind of everyday",
      exact: true,
    }),
  ).toBeVisible();
  await onboarding
    .getByRole("button", { name: "Continue", exact: true })
    .click();
  await expect(
    onboarding.getByRole("heading", {
      name: "Your search, thoughtfully set",
      exact: true,
    }),
  ).toBeVisible();
  await expect(onboarding.locator(".ob-review")).toContainText("Jordan");
  await onboarding
    .getByRole("button", { name: "Find my people", exact: true })
    .click();
  await expect(onboarding).toBeHidden();
  await expect(currentCard(page)).toHaveCount(1);
  await expect(currentCard(page).locator(".available-pill")).toHaveText([
    "Looking for a room",
  ]);
  await expect(
    currentCard(page).getByRole("heading", { name: "Ella, 23" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(currentCard(page).locator(".available-pill")).toHaveText([
    "Looking for a room",
  ]);
  await page
    .getByRole("button", { name: "View your profile", exact: true })
    .click();
  await expect(
    page
      .locator(".my-profile-card")
      .getByRole("heading", { name: "Jordan", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".profile-intent")).toHaveText(
    "I have a room to share",
  );
});

test("mobile navigation and conversation work without horizontal overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  const nav = page.getByRole("navigation", {
    name: "Mobile navigation",
    exact: true,
  });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("button")).toHaveCount(5);
  async function fitsViewport() {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  await fitsViewport();
  await page.screenshot({
    path: testInfo.outputPath("mobile-discovery.png"),
    fullPage: true,
  });
  await nav.getByRole("button", { name: "Likes", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "A good feeling, returned.",
      exact: true,
    }),
  ).toBeVisible();
  await fitsViewport();
  await nav.getByRole("button", { name: "Messages", exact: true }).click();
  await page.locator(".conversation-item").filter({ hasText: "Maya" }).click();
  await expect(
    page.getByRole("textbox", { name: "Say something nice…", exact: true }),
  ).toBeVisible();
  await fitsViewport();
  await page
    .getByRole("button", { name: "Back to conversations", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Search conversations", exact: true }),
  ).toBeVisible();
  await nav.getByRole("button", { name: "My space", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Before you move in", exact: true }),
  ).toBeVisible();
  await fitsViewport();
  await nav.getByRole("button", { name: "My profile", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit my profile", exact: true }),
  ).toBeVisible();
  await fitsViewport();
});

test("switching to Turkish translates navigation, fit explanations and replies, and persists", async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole("button", { name: "View your profile" }).first().click();
  await page.getByRole("combobox", { name: "Language" }).selectOption("tr");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  const nav = page.getByRole("navigation", {
    name: "Ana gezinme",
    exact: true,
  });
  await expect(nav.getByRole("button", { name: /Keşfet/ })).toBeVisible();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await page
    .getByRole("button", { name: "Neden uyumlusunuz?", exact: true })
    .click();
  const compatibility = page.getByRole("dialog", {
    name: "Neden uyumlusunuz?",
    exact: true,
  });
  await expect(compatibility.getByText("Bütçe", { exact: true })).toBeVisible();
  await expect(
    compatibility.getByText("Uyku düzeni", { exact: true }),
  ).toBeVisible();
  await expect(compatibility.getByText(/ağırlık %25/)).toBeVisible();
  await expect(compatibility.getByText(/weight|Budget/)).toHaveCount(0);
  await page.keyboard.press("Escape");

  await nav.getByRole("button", { name: /Mesajlar/ }).click();
  await page.locator(".message-composer input").fill("Bütçen ne kadar?");
  await page.keyboard.press("Enter");
  await expect(page.locator(".message-row:not(.mine)").last()).toContainText(
    "Faturalar dahil",
  );
});
