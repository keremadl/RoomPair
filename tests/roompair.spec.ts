import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end flows for the RoomPair demo, in the chosen Card design
 * language with tabbed profile details. Selectors use roles and names.
 */

const card = (page: Page) =>
  page
    .getByRole("heading", {
      level: 2,
      name: /^(Ella|Leo|Ines|Maya|Noah|Felix|Sofia|Anna|Oliver)/,
    })
    .first();

async function openApp(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Discover",
      level: 1,
    }),
  ).toBeVisible();
}

test("discover shows the card and grouped details; arrows pass, undo restores", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openApp(page);
  await expect(card(page)).toHaveText(/^Ella/);
  const portrait = page.getByRole("img", { name: "Ella" }).first();
  await expect
    .poll(() =>
      portrait.evaluate((img) => (img as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(100);
  // Card language, Home → Person → Fit as tabs
  await expect(page.locator("[data-direction]").first()).toHaveAttribute(
    "data-direction",
    "card",
  );
  const tabs = page.getByRole("tablist", { name: "Profile sections" });
  await expect(tabs).toBeVisible();
  await expect(page.getByRole("tabpanel")).toContainText(/the room/i);
  await tabs.getByRole("tab", { name: "Ella" }).click();
  await expect(page.getByRole("tabpanel")).toContainText(/Ella/);
  await tabs.getByRole("tab", { name: /% fit/ }).click();
  await expect(page.getByRole("tabpanel")).toContainText(/96/);

  // Arrow keys move between tabs while a tab has focus; leave the tabs first.
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
  await page.keyboard.press("ArrowLeft");
  await expect(card(page)).toHaveText(/^Leo/);
  await expect(page.getByRole("status")).toContainText("Skipped");
  await page.getByRole("button", { name: "Undo" }).first().click();
  await expect(card(page)).toHaveText(/^Ella/);
  expect(errors).toEqual([]);
});

test("a mutual like opens a match, then a conversation with a simulated reply", async ({
  page,
}) => {
  await openApp(page);
  await page.keyboard.press("ArrowRight");
  const match = page.getByRole("dialog", { name: "It’s a RoomPair!" });
  await expect(match).toBeVisible();
  await match.getByRole("button", { name: "Send a message" }).click();
  await expect(
    page.getByRole("heading", { name: "Messages", level: 1 }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "What’s your ideal Sunday at home?" })
    .click();
  await expect(
    page.getByText("What’s your ideal Sunday at home?").last(),
  ).toBeVisible();
  const conversation = page.getByRole("region", { name: "Ella" });
  await expect(
    conversation.getByText(/respect each other’s space/),
  ).toBeVisible({ timeout: 6000 });
});

test("likes, rooms, the shared space and the moving checklist", async ({
  page,
}) => {
  await openApp(page);
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("button", { name: /Likes/ }).click();
  await expect(page.getByRole("tab", { name: /Liked you/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: "Team up" }).first().click();
  await expect(
    page.getByRole("dialog", { name: "It’s a RoomPair!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Not now" }).click();

  await nav.getByRole("button", { name: "Discover" }).click();
  await page.getByRole("radio", { name: "Find a room" }).click();
  await page
    .getByRole("button", { name: "Save room", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText("Saved");

  await nav.getByRole("button", { name: "My space" }).click();
  await expect(
    page.getByRole("heading", { name: /Saved rooms · 2/ }),
  ).toBeVisible();
  const task = page.getByRole("button", { name: /^Cleaning/ });
  await task.click();
  await expect(task).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("textbox", { name: "Notes" })
    .fill("Ask about the balcony");
  await page.reload();
  await nav.getByRole("button", { name: "My space" }).click();
  await expect(page.getByRole("textbox", { name: "Notes" })).toHaveValue(
    "Ask about the balcony",
  );
});

test("filters validate, onboarding updates the profile, report and block work", async ({
  page,
}) => {
  await openApp(page);
  await page.getByRole("button", { name: "Filters" }).click();
  const filters = page.getByRole("dialog", { name: "Filters" });
  await filters
    .getByRole("spinbutton", { name: "Monthly budget, from" })
    .fill("900");
  await expect(filters.getByRole("alert")).toContainText("maximum budget");
  await filters
    .getByRole("spinbutton", { name: "Monthly budget, from" })
    .fill("350");
  await filters.getByRole("button", { name: "Show my people" }).click();
  await expect(filters).toBeHidden();

  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: /My profile/ })
    .click();
  await page.getByRole("button", { name: "Edit" }).click();
  const setup = page.getByRole("dialog", { name: "Your profile" });
  await setup
    .getByRole("textbox", { name: "What should we call you?" })
    .fill("");
  await setup.getByRole("button", { name: "Continue" }).click();
  await expect(setup.getByRole("alert")).toContainText(
    "Please enter your name",
  );
  await setup
    .getByRole("textbox", { name: "What should we call you?" })
    .fill("Deniz");
  for (let i = 0; i < 3; i++)
    await setup.getByRole("button", { name: "Continue" }).click();
  await setup.getByRole("button", { name: "Save and show people" }).click();
  await expect(page.getByRole("status")).toContainText("Deniz");
  // Discover puts its filters at the top right, where other pages show your initial.
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Filters" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "View your profile" }),
  ).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: /Likes/ })
    .click();
  await expect(
    page.getByRole("button", { name: "View your profile" }),
  ).toHaveText("D");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: /Discover/ })
    .click();

  await page.getByRole("button", { name: "Report" }).first().click();
  const options = page.getByRole("dialog", { name: "Profile options" });
  await options.getByRole("button", { name: /^Block Ella/ }).click();
  await expect(page.getByRole("status")).toContainText("blocked");
  await expect(card(page)).not.toHaveText(/Ella/);
});

test("Turkish interface and a phone-sized layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNav).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await expect(page.getByRole("button", { name: /Design/ })).toHaveCount(0);
  await mobileNav.getByRole("button", { name: /My profile/ }).click();
  await page.getByRole("combobox", { name: "Language" }).selectOption("tr");
  const turkishNav = page.getByRole("navigation", { name: "Mobil gezinme" });
  await expect(
    turkishNav.getByRole("button", { name: /Keşfet/ }),
  ).toBeVisible();
  await turkishNav.getByRole("button", { name: /Mesajlar/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
    "Messages",
  );
});

test.describe("on a phone", () => {
  test.use({
    viewport: { width: 360, height: 780 },
    isMobile: true,
    hasTouch: true,
  });

  test("the page never gets wider than the phone", async ({ page }) => {
    // Anything past the right edge makes a phone lay the page out wider and
    // zoom it, so the tab bar and the score bars get cut off.
    await openApp(page);
    await expect(card(page)).toBeVisible();
    expect(
      await page.evaluate(() =>
        Math.max(window.innerWidth, document.documentElement.scrollWidth),
      ),
    ).toBe(360);
    // Cards use the phone's width instead of shrinking into a column.
    const nav = page.getByRole("navigation", { name: "Mobile navigation" });
    const widthOf = (name: string) =>
      page
        .getByRole("article", { name })
        .first()
        .evaluate((el) => el.getBoundingClientRect().width);
    await nav.getByRole("button", { name: /My space/ }).click();
    expect(await widthOf("A sunny room in Āgenskalns")).toBeGreaterThan(300);
    await nav.getByRole("button", { name: /My profile/ }).click();
    const body = page.locator("article").first().locator("h2").first();
    expect(
      await body.evaluate(
        (el) =>
          el.closest("article")!.firstElementChild!.getBoundingClientRect()
            .width,
      ),
    ).toBeGreaterThan(280);
    await nav.getByRole("button", { name: /Discover/ }).click();
    // A card flying out of view or a sticker past the edge must stay clipped.
    await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "width:200px;height:10px;transform:translateX(300px)";
      document.querySelector("main")!.append(probe);
    });
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(() =>
        Math.max(window.innerWidth, document.documentElement.scrollWidth),
      ),
    ).toBe(360);
  });
});
