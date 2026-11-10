import { execFileSync } from "node:child_process";
import { test, expect, type Browser, type Page } from "@playwright/test";

/**
 * Accounts and shared data, against a real Supabase stack (see
 * playwright.accounts.config.ts). Every run creates its own members.
 */
const run = Date.now().toString(36);
const password = "correct horse battery";
const emailOf = (name: string) => `${name.toLowerCase()}@e2e.roompair.example`;
const nav = (page: Page) =>
  page.getByRole("navigation", { name: "Main navigation" });
const card = (page: Page) =>
  page
    .getByRole("heading", { level: 2, name: /^\p{L}[\p{L}\p{N}]*, \d+/u })
    .first();

/** Creates an account, answers the setup steps and completes the profile. */
async function join(page: Page, name: string) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "New here? Create an account" })
    .click();
  await page.getByLabel("Your first name").fill(name);
  await page.getByLabel("Email").fill(emailOf(name));
  await page.getByLabel("Password").fill(password);
  // Without the confirmation no account is created.
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(
    page.getByText(/confirm that you are 18 or older/),
  ).toBeVisible();
  await page.getByRole("switch", { name: /I am 18 or older/ }).check();
  await page.getByRole("button", { name: "Create my account" }).click();

  // Setup opens by itself for a new member.
  const setup = page.getByRole("dialog", { name: "Your profile" });
  await expect(
    setup.getByRole("textbox", { name: "Your first name" }),
  ).toHaveValue(name);
  // A new member's date of birth is asked, not assumed, and minors are refused.
  const born = (years: number) => {
    const day = new Date();
    day.setFullYear(day.getFullYear() - years);
    return day.toISOString().slice(0, 10);
  };
  await setup.getByRole("button", { name: "Continue" }).click();
  await expect(setup.getByText("Enter your date of birth.")).toBeVisible();
  await setup.getByLabel("Date of birth").fill(born(17));
  await setup.getByRole("button", { name: "Continue" }).click();
  await expect(setup.getByText(/18 or older to use RoomPair/)).toBeVisible();
  // 27 years and a few months ago: the profile shows 27, never the date.
  await setup.getByLabel("Date of birth").fill(`${born(27).slice(0, 4)}-01-01`);

  const question = setup.getByRole("heading", { level: 2 });
  const proceed = setup.getByRole("button", { name: "Continue" });
  for (let step = 0; step < 30; step++) {
    const finish = setup.getByRole("button", { name: /Save and show people/ });
    if (await finish.count()) {
      await finish.click();
      break;
    }
    const asked = (await question.textContent()) ?? "";
    if (asked === "Add a photo of yourself") {
      // Others only see a profile with a photo, so Continue waits for one.
      await expect(proceed).toBeDisabled();
      await setup
        .locator('input[type="file"]')
        .setInputFiles("public/images/alex-1.jpg");
      await expect(setup.getByText("Main", { exact: true })).toBeVisible();
    }
    if (asked === "What do you do?") {
      await setup.getByLabel("What you study or do").fill("Test engineer");
      await setup.getByLabel("School or workplace").fill("RoomPair QA");
    }
    await proceed.click();
    await expect(question).not.toHaveText(asked);
  }
  await expect(setup).toBeHidden();
  await nav(page)
    .getByRole("button", { name: /Discover/ })
    .click();
  await expect(card(page)).toBeVisible();
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
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(card(page)).toHaveCount(0);
  await page.getByLabel("Email").fill("nobody@e2e.roompair.example");
  await page.getByLabel("Password").fill("not the password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(/do not match an account/)).toBeVisible();
});

test("a new member sets up, uploads a photo, matches a demo member and keeps everything after reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await join(page, `Ada${run}`);

  // Demo members like every newcomer; five of them fit the default search.
  // The count comes from the server.
  await expect(nav(page).getByRole("button", { name: /Likes/ })).toContainText(
    "5",
  );
  await expect(card(page)).toHaveText(/^Ella/);

  await page.keyboard.press("ArrowRight");
  const match = page.getByRole("dialog", { name: "It’s a RoomPair!" });
  await expect(match).toBeVisible();
  await match
    .getByRole("textbox", { name: "Say hi to Ella" })
    .fill("Hello Ella, is the room still free?");
  await match.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("is the room still free").last()).toBeVisible();

  // Demo members do not answer: no simulated reply appears.
  await page.waitForTimeout(2500);
  await expect(page.getByText(/respect each other’s space/)).toHaveCount(0);

  await page.reload();
  await nav(page)
    .getByRole("button", { name: /Messages/ })
    .click();
  await expect(page.getByText("is the room still free").last()).toBeVisible();
  // The uploaded photo and the answers came back from the server.
  await nav(page)
    .getByRole("button", { name: /My profile/ })
    .click();
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await expect(page.getByText("Main", { exact: true })).toBeVisible();
  await expect(page.getByText("Test engineer, RoomPair QA")).toBeVisible();
  // The age came from the date of birth, worked out by the server.
  await expect(
    page.getByRole("button", { name: new RegExp(`^Ada${run}, 27`) }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("two members like each other, exchange messages, and a block ends it for both", async ({
  browser,
}) => {
  const ben = await member(browser, `Ben${run}`);
  const cem = await member(browser, `Cem${run}`);

  // Both are looking for a room, so they do not see each other; Cem offers one.
  await nav(cem)
    .getByRole("button", { name: /My profile/ })
    .click();
  await cem.getByRole("button", { name: /Why you're here/ }).click();
  await cem
    .getByRole("radio", { name: /I have a room, I need a flatmate/ })
    .click();
  await cem.getByRole("button", { name: "Edit profile", exact: true }).click();
  await cem
    .locator('input[type="file"]')
    .nth(1)
    .setInputFiles("public/images/sofia-room-1.jpg");
  await cem.getByRole("button", { name: /^Title/ }).click();
  const room = cem.getByRole("dialog", { name: "My room" });
  await room.getByLabel("Title").fill(`Room of ${run}`);
  await room.getByRole("button", { name: "Save" }).click();
  await expect(room).toBeHidden();

  // Ben finds Cem's room among the people with a room and likes him.
  await ben.reload();
  for (let i = 0; i < 30; i++) {
    if (((await card(ben).textContent()) ?? "").startsWith(`Cem${run}`)) break;
    await ben.keyboard.press("ArrowLeft");
    await ben.waitForTimeout(350);
  }
  await expect(card(ben)).toHaveText(new RegExp(`^Cem${run}`));
  await ben.keyboard.press("ArrowRight");

  // Cem sees the like arrive and likes back: a match.
  await nav(cem).getByRole("button", { name: /Likes/ }).click();
  const received = cem.getByRole("button", { name: new RegExp(`^Ben${run}`) });
  await expect(received).toBeVisible({ timeout: 20_000 });
  await received.click();
  await cem.getByRole("button", { name: "Team up" }).click();
  const match = cem.getByRole("dialog", { name: "It’s a RoomPair!" });
  await match.getByRole("textbox").fill("Hi Ben, want to see the room?");
  await match.getByRole("button", { name: "Send", exact: true }).click();

  // Ben receives the real message without doing anything. It is pushed live,
  // so it shows up well before the slower background check would find it.
  await nav(ben)
    .getByRole("button", { name: /Messages/ })
    .click();
  await expect(ben.getByText("want to see the room").last()).toBeVisible({
    timeout: 5_000,
  });

  // Ben blocks Cem: the conversation disappears for both.
  await ben
    .getByRole("button", { name: new RegExp(`^Cem${run}`) })
    .first()
    .click();
  await ben.getByRole("button", { name: "Conversation options" }).click();
  await ben
    .getByRole("dialog", { name: "Profile options" })
    .getByRole("button", { name: new RegExp(`^Block Cem${run}`) })
    .click();
  await expect(ben.getByText("want to see the room")).toHaveCount(0);
  await nav(cem)
    .getByRole("button", { name: /Messages/ })
    .click();
  await expect(cem.getByText("want to see the room")).toHaveCount(0, {
    timeout: 20_000,
  });
  await ben.context().close();
  await cem.context().close();
});

test("signing out returns to the sign-in screen and signing in restores the member", async ({
  page,
}) => {
  const name = `Dee${run}`;
  await join(page, name);
  await nav(page)
    .getByRole("button", { name: /My profile/ })
    .click();
  await page.getByRole("button", { name: "Settings" }).first().click();
  await expect(page.getByText(`Signed in as ${emailOf(name)}.`)).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();

  await page.getByLabel("Email").fill(emailOf(name));
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(card(page)).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Your profile" })).toHaveCount(
    0,
  );
});

test("a member can delete their account, and it is gone for good", async ({
  page,
}) => {
  const name = `Eve${run}`;
  await join(page, name);
  await nav(page)
    .getByRole("button", { name: /My profile/ })
    .click();
  await page.getByRole("button", { name: "Settings" }).first().click();
  await page.getByRole("button", { name: "Delete my account" }).click();
  const confirm = page.getByRole("dialog", { name: "Delete your account?" });
  await confirm.getByRole("button", { name: "Delete my account" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();

  await page.getByLabel("Email").fill(emailOf(name));
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(/do not match an account/)).toBeVisible();
});

test("the privacy notice is readable without signing in", async ({ page }) => {
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { level: 1, name: "Privacy notice" }),
  ).toBeVisible();
  await expect(page.getByText(/removed for good/)).toBeVisible();
});

test("a report reaches a moderator, who can hide the reported member", async ({
  browser,
}) => {
  const moderator = await member(browser, `Fay${run}`);
  const reporter = await member(browser, `Gus${run}`);

  // Members who are not moderators see no review entry in Settings.
  await nav(reporter)
    .getByRole("button", { name: /My profile/ })
    .click();
  await reporter.getByRole("button", { name: "Settings" }).first().click();
  await expect(
    reporter.getByRole("button", { name: /Review reports/ }),
  ).toHaveCount(0);

  // Gus reports the first person in Discover.
  await nav(reporter)
    .getByRole("button", { name: /Discover/ })
    .click();
  const reported = ((await card(reporter).textContent()) ?? "").split(",")[0];
  await reporter
    .getByRole("region", { name: `About ${reported}` })
    .getByRole("button", { name: "Report" })
    .click();
  await reporter
    .getByRole("dialog", { name: "Profile options" })
    .getByRole("button", { name: "Send report" })
    .click();
  await expect(reporter.getByRole("status")).toContainText("Report sent");

  // Moderators are listed by hand in the database; nobody can add themselves.
  execFileSync("psql", [
    process.env.SUPABASE_DB_URL ??
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
    "-X",
    "-q",
    "-c",
    `insert into private.moderators (user_id) select id from auth.users where email = '${emailOf(`Fay${run}`)}'`,
  ]);
  await moderator.reload();
  await nav(moderator)
    .getByRole("button", { name: /My profile/ })
    .click();
  await moderator.getByRole("button", { name: "Settings" }).first().click();
  await moderator
    .getByRole("button", { name: "Review reports (1 open)" })
    .click();
  const queue = moderator.getByRole("dialog", { name: "Reports to review" });
  await expect(queue.getByText(`Gus${run} reported ${reported}`)).toBeVisible();
  await queue.getByRole("button", { name: "Hide this member" }).click();
  await expect(queue.getByText("Hidden from other members.")).toBeVisible();
  await expect(queue.getByText("Reviewed", { exact: true })).toBeVisible();

  // The hidden member is gone for everyone else.
  await reporter.reload();
  await expect(card(reporter)).toBeVisible();
  await expect(card(reporter)).not.toHaveText(new RegExp(`^${reported},`));
  await moderator.context().close();
  await reporter.context().close();
});
