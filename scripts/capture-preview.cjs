const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("http://localhost:3000");
  await page.locator(".swipe-card").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".swipe-card")).opacity === "1",
  );
  await page.screenshot({ path: "docs/desktop-preview.png", fullPage: true });
  await page.locator(".action.like").click();
  await page.getByRole("dialog", { name: "It’s a RoomPair!" }).waitFor();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".modal-backdrop")).opacity ===
        "1" && document.querySelectorAll(".swipe-card").length === 1,
  );
  await page.screenshot({ path: "docs/match-preview.png" });
  await page
    .getByRole("button", { name: "Say a little hello", exact: true })
    .click();
  await page.locator(".conversation-header").waitFor();
  await page.locator(".modal-backdrop").waitFor({ state: "detached" });
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".messages-page")).opacity ===
      "1",
  );
  await page.screenshot({ path: "docs/chat-preview.png" });
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "My space", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".space-page")).opacity === "1",
  );
  await page.screenshot({ path: "docs/space-preview.png", fullPage: true });
  await page
    .getByRole("button", { name: "Find your living style", exact: true })
    .click();
  await page.locator(".ob-shell").waitFor();
  await page.screenshot({ path: "docs/onboarding-preview.png" });
  await page.keyboard.press("Escape");
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    isMobile: true,
    hasTouch: true,
  });
  const phone = await mobile.newPage();
  await phone.goto("http://localhost:3000");
  await phone.locator(".swipe-card").waitFor();
  await phone.evaluate(() => document.fonts.ready);
  await phone.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".swipe-card")).opacity === "1",
  );
  await phone.screenshot({ path: "docs/mobile-preview.png", fullPage: true });
  await phone.screenshot({ path: "docs/mobile-fold.png" });
  console.log("Seven final screenshots saved.");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
