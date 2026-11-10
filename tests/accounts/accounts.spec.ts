import { test, expect, type Browser, type Page } from "@playwright/test";

const run = Date.now().toString(36);
const nav = (page: Page) =>
  page.getByRole("navigation", { name: "Main navigation", exact: true });

/** Creates an account and answers the living-style questions with the defaults. */
async function join(page: Page, name: string) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await page.getByLabel("Your first name").fill(name);
  await page
    .getByLabel("Email")
    .fill(`${name.toLowerCase()}@e2e.roompair.example`);
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Create my account" }).click();

  const onboarding = page.locator(".ob-shell");
  await expect(
    onboarding.getByRole("textbox", { name: "What should we call you?" }),
  ).toHaveValue(name);
  for (let step = 0; step < 3; step++)
    await onboarding
      .getByRole("button", { name: "Continue", exact: true })
      .click();
  await onboarding
    .getByRole("button", { name: "Find my people", exact: true })
    .click();
  await expect(onboarding).toBeHidden();
}

async function member(browser: Browser, name: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await join(page, name);
  return page;
}

test("signed-out visitors see only the sign-in screen, and wrong passwords are refused", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  await expect(page.locator(".swipe-card")).toHaveCount(0);
  await page.getByLabel("Email").fill("nobody@e2e.roompair.example");
  await page.getByLabel("Password").fill("not the password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".auth-error")).toContainText("do not match");
});

test("a new member onboards, matches a demo member and keeps the conversation after reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await join(page, `Ada${run}`);

  // Five demo members like every newcomer; the count arrives from the server.
  await expect(nav(page).getByRole("button", { name: /Likes/ })).toContainText(
    "5",
  );
  await expect(
    page.locator(".swipe-card").getByRole("heading", { name: "Ella, 23" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Like", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "It’s a RoomPair!" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Say a little hello", exact: true })
    .click();
  await page
    .locator(".message-composer input")
    .fill("Hello Ella, is the room still free?");
  await page.keyboard.press("Enter");
  await expect(page.locator(".message-row.mine")).toContainText(
    "is the room still free",
  );

  // Demo members do not answer: no simulated reply appears.
  await page.waitForTimeout(2500);
  await expect(page.locator(".message-row:not(.mine)")).toHaveCount(0);

  await page.reload();
  await nav(page)
    .getByRole("button", { name: /Messages/ })
    .click();
  await expect(page.locator(".message-row.mine")).toContainText(
    "is the room still free",
  );
  await expect(nav(page).getByRole("button", { name: /Likes/ })).toContainText(
    "4",
  );
  expect(errors).toEqual([]);
});

test("two members like each other, exchange messages, and a block ends it for both", async ({
  browser,
}) => {
  const ben = await member(browser, `Ben${run}`);
  const cem = await member(browser, `Cem${run}`);

  // Ben finds Cem in the list and likes him.
  await ben.reload();
  await ben.getByRole("button", { name: "Switch to list view" }).click();
  await ben
    .locator(".person-tile")
    .filter({ hasText: `Cem${run}` })
    .click();
  await ben.getByRole("button", { name: "Send a like", exact: true }).click();

  // Cem sees the like arrive and likes back: a match.
  await nav(cem).getByRole("button", { name: /Likes/ }).click();
  const received = cem.locator(".like-tile").filter({ hasText: `Ben${run}` });
  await expect(received).toBeVisible({ timeout: 15_000 });
  await received.getByRole("button", { name: "Like back" }).click();
  await expect(
    cem.getByRole("dialog", { name: "It’s a RoomPair!" }),
  ).toBeVisible();
  await cem
    .getByRole("button", { name: "Say a little hello", exact: true })
    .click();
  await cem
    .locator(".message-composer input")
    .fill("Hi Ben, shall we look at flats?");
  await cem.keyboard.press("Enter");

  // Ben receives the real message without doing anything.
  await nav(ben)
    .getByRole("button", { name: /Messages/ })
    .click();
  const conversation = ben
    .locator(".conversation-item")
    .filter({ hasText: `Cem${run}` });
  await expect(conversation).toBeVisible({ timeout: 15_000 });
  await conversation.click();
  await expect(ben.locator(".message-row:not(.mine)")).toContainText(
    "shall we look at flats",
  );
  await ben.locator(".message-composer input").fill("Yes, Saturday works.");
  await ben.keyboard.press("Enter");
  await expect(cem.locator(".message-row:not(.mine)")).toContainText(
    "Saturday works",
    {
      timeout: 15_000,
    },
  );

  // Ben blocks Cem: the conversation and each other's profiles disappear.
  await ben.getByRole("button", { name: "Conversation options" }).click();
  await ben.getByRole("button", { name: `Block Cem${run}` }).click();
  await expect(
    ben.locator(".conversation-item").filter({ hasText: `Cem${run}` }),
  ).toHaveCount(0);
  await expect(
    cem.locator(".conversation-item").filter({ hasText: `Ben${run}` }),
  ).toHaveCount(0, {
    timeout: 15_000,
  });
  await nav(cem)
    .getByRole("button", { name: /Discover/ })
    .click();
  await cem.getByRole("button", { name: "Switch to list view" }).click();
  await expect(cem.locator(".person-tile").first()).toBeVisible();
  await expect(
    cem.locator(".person-tile").filter({ hasText: `Ben${run}` }),
  ).toHaveCount(0);
  await ben.context().close();
  await cem.context().close();
});

test("signing out returns to the sign-in screen and signing in restores the member", async ({
  page,
}) => {
  const name = `Dee${run}`;
  await join(page, name);
  await page.getByRole("button", { name: "View your profile" }).first().click();
  await page.getByRole("button", { name: "Account", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Account" })).toContainText(
    `${name.toLowerCase()}@e2e.roompair.example`,
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();

  await page
    .getByLabel("Email")
    .fill(`${name.toLowerCase()}@e2e.roompair.example`);
  await page.getByLabel("Password").fill("correct horse battery");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".swipe-card")).toBeVisible();
  await expect(page.locator(".ob-shell")).toHaveCount(0);
  await expect(page.locator(".user-button strong")).toHaveText(name);
});
