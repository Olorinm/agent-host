import assert from "node:assert/strict";
import { build } from "esbuild";
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";

export async function checkUiBrowser(page) {
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("link", { name: "Docs" })).toHaveAttribute(
    "href",
    "https://example.com",
  );
  assert.equal(await page.locator('a[href^="javascript:"]').count(), 0);
  assert.equal(await page.evaluate(() => Boolean(window.bad)), false);
  const preview = page.getByRole("button", {
    name: "Preview image Sample",
    exact: true,
  });
  await preview.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(preview).toBeFocused();
  const hidden = page.getByRole("button", { name: "Hidden action" });
  await expect(hidden).not.toBeVisible();
  await page.getByRole("button", { name: "Process", exact: true }).click();
  await expect(hidden).toBeVisible();
  await hidden.click();
  await expect(page.getByLabel("Reply", { exact: true })).toHaveText(
    "process-clicked",
  );
  await page.getByRole("button", { name: "Process", exact: true }).click();
  await expect(hidden).not.toBeVisible();
  await page.locator(".thread-resource-card").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Resource action")).toHaveText("preview");
  await page.getByRole("button", { name: "More", exact: true }).click();
  await page.getByRole("menuitem", { name: "Download resource" }).click();
  await expect(page.getByLabel("Resource action")).toHaveText("download");
  await page
    .getByRole("button", { name: "Always allow", exact: true })
    .dblclick();
  await expect(page.getByLabel("Reply", { exact: true })).toHaveText(
    '{"choice":"native-always"}',
  );
  await expect(
    page.getByRole("button", { name: "Allow once", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Retry action" }).click();
  await expect(page.getByRole("alert")).toContainText("Transient failure");
  await page.getByRole("button", { name: "Retry action" }).click();
  await expect(page.getByLabel("Attempts")).toHaveText("2");
  await expect(
    page.getByRole("button", { name: "Retry action" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "questions", exact: true }).click();
  await page.getByRole("button", { name: "1. one,two" }).click();
  await page.getByRole("button", { name: "2. three" }).click();
  await expect(
    page.getByRole("button", { name: "Skip", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Secret", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await page.getByLabel("Secret", { exact: true }).fill("fixture-answer");
  await page.getByRole("button", { name: "Answer", exact: true }).click();
  await expect(page.getByLabel("Reply", { exact: true })).toHaveText(
    '{"answers":{"paths":["one,two","three"],"secret":"fixture-answer"}}',
  );
  await page.getByRole("button", { name: "form", exact: true }).click();
  await page.getByLabel("JSON response", { exact: true }).fill("[]");
  await page.getByRole("button", { name: "Submit response" }).click();
  await expect(page.getByRole("alert")).toContainText("JSON object");
  await page
    .getByLabel("JSON response", { exact: true })
    .fill('{"enabled":true}');
  await page.getByRole("button", { name: "Submit response" }).click();
  await expect(page.getByLabel("Reply", { exact: true })).toHaveText(
    '{"action":"accept","content":{"enabled":true}}',
  );
  await page.getByRole("button", { name: "native", exact: true }).click();
  await page
    .getByLabel("JSON response", { exact: true })
    .fill('{"decision":{"nativeField":true}}');
  await page.getByRole("button", { name: "Submit response" }).click();
  await expect(page.getByLabel("Reply", { exact: true })).toHaveText(
    '{"native":{"decision":{"nativeField":true}}}',
  );
  await page.getByRole("button", { name: "Start interaction" }).click();
  await expect(
    page.getByRole("button", { name: "Live approve" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Abort interaction" }).click();
  await expect(page.getByRole("button", { name: "Live approve" })).toHaveCount(
    0,
  );
  await expect(page.getByLabel("Reply", { exact: true })).toHaveText("aborted");
  const input = page.getByRole("textbox", {
    name: "Ask the agent",
    exact: true,
  });
  await input.fill("你好");
  await input.dispatchEvent("compositionstart");
  await input.press("Enter");
  await expect(page.getByLabel("Sent", { exact: true })).toHaveText("[]");
  await input.dispatchEvent("compositionend");
  await input.fill("hello");
  await input.press("Shift+Enter");
  await expect(page.getByLabel("Sent", { exact: true })).toHaveText("[]");
  await input.fill("hello");
  await input.press("Enter");
  await expect(page.getByLabel("Sent", { exact: true })).toHaveText(
    '["hello"]',
  );
  await input.press("Enter");
  await expect(
    page.getByRole("button", { name: "Stop running" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Stop running" }).click();
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
    "mobile content must not overflow",
  );
}

export async function checkAppBrowser(page) {
  await page.getByRole("button", { name: "Helper Ready", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Helper" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Destroy", exact: true }).click();
  const confirm = page.getByRole("dialog", { name: "Destroy environment?" });
  await expect(confirm).toContainText("Workspace files are removed.");
  await confirm.getByRole("button", { name: "取消" }).click();
  await expect(page.getByLabel("Confirm result")).toHaveText("null");
  await page.getByRole("button", { name: "Destroy", exact: true }).click();
  await page.getByRole("button", { name: "确认" }).click();
  await expect(page.getByLabel("Confirm result")).toHaveText("primary");
  await page.getByRole("button", { name: "Notify", exact: true }).click();
  const notices = page.getByRole("region", { name: "通知" });
  await expect(notices.getByRole("status")).toHaveText("Agent paused");
  await notices.getByRole("button", { name: "关闭通知" }).click();
  await expect(notices.getByRole("status")).toHaveCount(0);
  const background = () => page.evaluate(() => getComputedStyle(document.querySelector(".agent-app")).backgroundColor);
  const light = await background();
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  assert.notEqual(await background(), light, "dark theme must change application tokens");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
    "mobile application content must not overflow",
  );
}

async function buildFixture(entry, output) {
  await mkdir(output, { recursive: true });
  await build({
    entryPoints: [entry],
    outfile: join(output, "app.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    jsx: "automatic",
    loader: { ".json": "json" },
  });
  await writeFile(
    join(output, "index.html"),
    '<meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="./app.css"><div id="root"></div><script src="./app.js"></script>',
  );
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const output = resolve(".local/chat-ui/browser");
  const appOutput = resolve(".local/chat-ui/app");
  await buildFixture("packages/react/test/browser-fixture.tsx", output);
  await buildFixture("packages/react/test/app-fixture.tsx", appOutput);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1100, height: 900 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(pathToFileURL(join(output, "index.html")).href);
    await checkUiBrowser(page);
    await page.screenshot({
      path: join(output, "standalone-mobile.png"),
      fullPage: true,
    });
    const appPage = await browser.newPage({
      viewport: { width: 1100, height: 900 },
      reducedMotion: "reduce",
    });
    appPage.on("pageerror", (error) => errors.push(error.message));
    await appPage.goto(pathToFileURL(join(appOutput, "index.html")).href);
    await checkAppBrowser(appPage);
    await appPage.screenshot({ path: join(appOutput, "app-mobile.png"), fullPage: true });
    assert.deepEqual(errors, []);
    console.log("Shared UI browser interactions passed");
  } finally {
    await browser.close();
  }
}
