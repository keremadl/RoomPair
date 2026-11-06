import { test, expect, type Page } from "@playwright/test";

/**
 * End-to-end flows for the RoomPair demo, in the chosen Card design
 * language with tabbed profile details. Selectors use roles and names.
 */

const card = (page: Page) =>
  page
    .getByRole("heading", {
      level: 2,
      // A card's heading is "Name, age"
      name: /^\p{L}+, \d+/u,
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
  // Card language; Home → Person → Fit sit under the card, as tabs, and
  // the arrow on the card scrolls down to them
  await expect(page.locator("[data-direction]").first()).toHaveAttribute(
    "data-direction",
    "card",
  );
  await page.getByRole("button", { name: "More about Ella" }).click();
  const details = page.getByRole("region", { name: "About Ella" });
  await expect(details).toBeInViewport();
  const tabs = details.getByRole("tablist", { name: "Profile sections" });
  await expect(tabs).toBeVisible();
  await expect(details.getByRole("tabpanel")).toContainText(/the room/i);
  await tabs.getByRole("tab", { name: "Ella" }).click();
  await expect(details.getByRole("tabpanel")).toContainText(/Ella/);
  await tabs.getByRole("tab", { name: /% fit/ }).click();
  await expect(details.getByRole("tabpanel")).toContainText(/96/);
  await page.locator(":focus").blur();
  await page.keyboard.press("ArrowLeft");
  await expect(card(page)).toHaveText(/^Ines/);
  await expect(page.getByRole("status")).toContainText("Skipped");
  await page.getByRole("button", { name: "Undo" }).first().click();
  await expect(card(page)).toHaveText(/^Ella/);
  expect(errors).toEqual([]);
});

test("people you already have a conversation with stay out of Discover", async ({
  page,
}) => {
  await openApp(page);
  // Maya and Sofia are in Messages already: go through the whole deck and
  // make sure neither of them comes up.
  const seen: string[] = [];
  const done = page.getByRole("heading", { name: "You have seen everyone" });
  for (let i = 0; i < 30 && !(await done.isVisible()); i++) {
    const name = (await card(page).textContent()) ?? "";
    seen.push(name);
    await page.keyboard.press("ArrowLeft");
    await expect(card(page).or(done)).not.toHaveText(name);
  }
  await expect(done).toBeVisible();
  expect(seen.length).toBeGreaterThan(2);
  expect(seen.filter((n) => /^(Maya|Sofia)\b/.test(n))).toEqual([]);
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
  // Likes are a grid of tiles; Maya is already in a conversation, so only
  // Ella is waiting for an answer. A tile opens her as a sub-page.
  await expect(page.getByRole("button", { name: /^Maya/ })).toHaveCount(0);
  await page.getByRole("button", { name: /^Ella, 23/ }).click();
  await expect(
    page.getByRole("banner").getByRole("heading", { level: 1 }),
  ).toHaveText("Ella");
  await page.getByRole("button", { name: "Team up" }).click();
  await expect(
    page.getByRole("dialog", { name: "It’s a RoomPair!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Not now" }).click();
  // Back on the grid: Ella moved to Your likes, as a match
  await page.getByRole("tab", { name: /Your likes/ }).click();
  await expect(
    page.getByRole("button", { name: /^Ella, 23.*Matched/ }),
  ).toBeVisible();

  await nav.getByRole("button", { name: "Discover" }).click();
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
  // Equal is not "above"; an emptied city is an inline error, not a pop-up
  await filters
    .getByRole("spinbutton", { name: "Monthly budget, from" })
    .fill("650");
  await expect(filters.getByRole("alert")).toContainText("maximum budget");
  await filters
    .getByRole("spinbutton", { name: "Monthly budget, from" })
    .fill("350");
  await filters.getByRole("textbox", { name: "City" }).fill("");
  await filters.getByRole("button", { name: "Show my people" }).click();
  await expect(filters.getByRole("alert")).toContainText("Enter a city.");
  await filters.getByRole("textbox", { name: "City" }).fill("Riga");
  await filters.getByRole("button", { name: "Show my people" }).click();
  await expect(filters).toBeHidden();

  await page.getByRole("button", { name: "Help" }).click();
  await page.getByRole("button", { name: "Set up my profile" }).click();
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
  // Everyday at home: guests, days at home, noise and sharing
  await setup.getByRole("radio", { name: "Often" }).click();
  await expect(setup.getByRole("radio", { name: "Often" })).toBeChecked();
  await setup.getByRole("button", { name: "Continue" }).click();
  await expect(
    setup.getByRole("group", { name: "Who would you like to live with?" }),
  ).toBeVisible();
  await setup.getByRole("button", { name: "Save and show people" }).click();
  await expect(page.getByRole("status")).toContainText("Deniz");
  // Discover puts its filters at the top right, where other pages show your initial.
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Filters" }),
  ).toBeVisible();
  // The top bar shows the page title, not the logo.
  await expect(
    page
      .getByRole("banner")
      .getByRole("heading", { level: 1, name: "Discover" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: /My profile/ })
    .click();
  await expect(page.getByRole("heading", { name: /^Deniz, / })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: /Discover/ })
    .click();

  await page
    .getByRole("region", { name: "About Ella" })
    .getByRole("button", { name: "Report" })
    .click();
  const options = page.getByRole("dialog", { name: "Profile options" });
  await options.getByRole("button", { name: /^Block Ella/ }).click();
  await expect(page.getByRole("status")).toContainText("blocked");
  await expect(card(page)).not.toHaveText(/Ella/);
});

test("what you are looking for decides who Discover shows", async ({
  page,
}) => {
  await openApp(page);
  // Looking for a room (default): hosts, room first, with Save room.
  await expect(card(page)).toHaveText(/^Ella/);
  await expect(
    page.getByRole("img", { name: "A sunny room in Āgenskalns" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Save room|Unsave room/ }),
  ).toBeVisible();
  await expect(page.getByRole("radio", { name: "Find a room" })).toHaveCount(0);

  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await nav.getByRole("button", { name: /My profile/ }).click();
  await page.getByRole("button", { name: /Why you're here/ }).click();
  await page
    .getByRole("radio", { name: /I have a room, I need a flatmate/ })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "people looking for a room",
  );
  await nav.getByRole("button", { name: "Discover" }).click();
  // A host without a room photo is held back: required fields come first,
  // and nobody can be liked meanwhile.
  await expect(
    page.getByRole("heading", { name: "Finish your profile to start" }),
  ).toBeVisible();
  await expect(page.getByText("Add a photo of the room")).toBeVisible();
  await page.getByRole("button", { name: "Complete my profile" }).click();
  await expect(
    page.getByRole("banner").getByRole("heading", { name: "Edit profile" }),
  ).toBeVisible();
  await page
    .getByRole("region", { name: "My room" })
    .locator('input[type="file"]')
    .setInputFiles("public/images/room-2.jpg");
  await expect(
    page
      .getByRole("list", { name: "Room photos" })
      .getByRole("button", { name: "Main photo" }),
  ).toBeVisible();
  await nav.getByRole("button", { name: "Discover" }).click();
  // Having a room: only people looking for one, no rooms to save. Leo is
  // looking too, but you already have a conversation with him.
  // The best fit for the demo host among people looking for a room
  await expect(card(page)).toHaveText(/^Chidi/);
  await expect(page.getByRole("button", { name: /Save room/ })).toHaveCount(0);
  await nav.getByRole("button", { name: /My space/ }).click();
  await expect(page.getByRole("heading", { name: /Saved rooms/ })).toHaveCount(
    0,
  );
});

test("my profile: preview from the photo, then edit photos, questions and interests", async ({
  page,
}) => {
  await openApp(page);
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("button", { name: /My profile/ })
    .click();
  // The photo opens the card others see
  await page.getByRole("button", { name: /Preview my card/ }).click();
  await expect(
    page
      .getByRole("dialog", { name: "Your card" })
      .getByRole("heading", { name: /Alex, 22/ }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const before = await page
    .getByRole("button", { name: /Preview my card/ })
    .getAttribute("aria-label");

  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  // The sub-page bar holds only the back button and the page name
  await expect(
    page.getByRole("banner").getByRole("heading", { name: "Edit profile" }),
  ).toBeVisible();
  await expect(page.getByRole("banner").getByRole("progressbar")).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Add a question" }).click();
  const dialog = page.getByRole("dialog", { name: "Add a prompt" });
  await dialog
    .getByRole("textbox", { name: "Your answer" })
    .fill("Cooking for everyone.");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Cooking for everyone.")).toBeVisible();
  await page.getByRole("button", { name: "Edit interests" }).click();
  const interests = page.getByRole("dialog", { name: "Interests" });
  await interests.getByRole("button", { name: "Yoga" }).click();
  await interests.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("listitem").filter({ hasText: /^Yoga$/ }),
  ).toBeVisible();
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles("public/images/room-2.jpg");
  await expect(
    page.getByRole("button", { name: /Photo 2: make main/ }),
  ).toBeVisible();
  // Hosts get a room section
  await page.getByRole("button", { name: /Why you're here/ }).click();
  await page
    .getByRole("radio", { name: /I have a room, I need a flatmate/ })
    .click();
  await expect(page.getByRole("heading", { name: "My room" })).toBeVisible();

  // Back, in the top bar, returns to the profile page; completion went up
  await expect(
    page.getByRole("banner").getByRole("heading", { name: "Edit profile" }),
  ).toBeVisible();
  await page.getByRole("banner").getByRole("button", { name: "Back" }).click();
  await expect(
    page.getByRole("button", { name: /Preview my card/ }),
  ).not.toHaveAttribute("aria-label", before!);
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
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByRole("combobox", { name: "Language" }).selectOption("tr");
  await page.keyboard.press("Escape");
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

  test("an open conversation is a sub-page: back and name in the top bar", async ({
    page,
  }) => {
    await openApp(page);
    const nav = page.getByRole("navigation", { name: "Mobile navigation" });
    await nav.getByRole("button", { name: /Messages/ }).click();
    // New matches sit on top as tiles
    await expect(
      page.getByRole("heading", { name: /New matches/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: /^Maya/ }).click();
    const bar = page.getByRole("banner");
    await expect(bar.getByRole("heading", { level: 1 })).toHaveText("Maya");
    await expect(
      bar.getByRole("button", { name: "Conversation options" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Maya, 22/ })).toBeHidden();
    // The composer sits above the tab bar, with a photo button on its left
    const composer = page.getByRole("textbox", { name: "Write a message" });
    await expect(composer).toBeInViewport();
    await page
      .locator('input[type="file"][accept="image/*"]')
      .setInputFiles("public/images/room-3.jpg");
    await expect(page.getByRole("img", { name: "Photo" })).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Maya" })
        .getByText("Thanks for the photo!"),
    ).toBeVisible({
      timeout: 10_000,
    });
    await bar.getByRole("button", { name: "Back" }).click();
    await expect(bar.getByRole("heading", { level: 1 })).toHaveText("Messages");
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
    await page
      .getByRole("button", { name: "Edit profile", exact: true })
      .click();
    expect(
      await page
        .getByRole("list", { name: "My photos" })
        .evaluate((el) => el.getBoundingClientRect().width),
    ).toBeGreaterThan(300);
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
