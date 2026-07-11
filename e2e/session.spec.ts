import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("completes a parent-controlled session without external requests or replay", async ({
  page,
}) => {
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
      externalRequests.push(request.url());
    }
  });

  await page.clock.install({ time: new Date("2026-07-11T08:00:00Z") });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "いろころ" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "1分" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "音をつける" })).not.toBeChecked();

  await page.getByRole("button", { name: "はじめる" }).click();
  const firstCue = await page.getByTestId("scene-cue").textContent();

  await page.clock.runFor(6_000);
  await expect(page.getByTestId("scene-cue")).not.toHaveText(firstCue ?? "");

  await page.getByRole("button", { name: "一時停止" }).click();
  const pausedCue = await page.getByTestId("scene-cue").textContent();
  await page.clock.runFor(20_000);
  await expect(page.getByRole("heading", { name: "ひとやすみ" })).toBeVisible();
  await expect(page.getByTestId("scene-cue")).toHaveText(pausedCue ?? "");

  await page.getByRole("button", { name: "つづける" }).click();
  await page.clock.runFor(60_000);
  await expect(page.getByRole("heading", { name: "おしまい" })).toBeVisible();

  await page.clock.runFor(60_000);
  await expect(page.getByRole("heading", { name: "おしまい" })).toBeVisible();
  expect(externalRequests).toEqual([]);
});

test("keeps every control usable at 320px without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");

  await expect(page.getByRole("button", { name: "はじめる" })).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.getByRole("button", { name: "はじめる" }).click();
  await expect(page.getByRole("button", { name: "一時停止" })).toBeInViewport();
  await expect(page.getByRole("button", { name: "おしまい" })).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("has no automatically detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "はじめる" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
