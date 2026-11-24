import { expect, test, type Page } from "@playwright/test";
import { argosScreenshot } from "@argos-ci/playwright";

// The theme renders the whole reference as a single page (`/api-reference`);
// each type is an `article.api-single-page-entry` anchored by `h2#<slug>`.
// One entry per GraphQL type kind the theme renders differently.
const entries = [
  ["object", "objects-project"],
  ["enum", "enums-project-status"],
  ["interface", "interfaces-node"],
  ["union", "unions-search-result"],
  ["input", "inputs-create-project-input"],
  ["scalar", "scalars-date-time"],
  ["query", "queries-projects"],
  ["mutation", "mutations-create-project"],
  ["subscription", "subscriptions-project-changed"],
  ["directive", "directives-deprecated"],
] as const;

const entry = (page: Page, slug: string) =>
  page.locator(`article.api-single-page-entry:has(h2#${slug})`);

// Element screenshots are stitched while scrolling, so the sticky site
// header/footer would be painted over the entry. Hide them for those shots.
// The entry's code column (ApiCodeColumn, `lg:sticky`) would otherwise land
// wherever the page happened to be scrolled at capture time; pin it to its
// natural position so the shot is deterministic.
const hideChrome = [
  "header, footer { display: none !important; }",
  ".api-single-page-entry .lg\\:sticky { position: static !important; }",
].join("\n");

test("home", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await argosScreenshot(page, "home");
});

test("api-reference layout", async ({ page }) => {
  const response = await page.goto("/api-reference");
  expect(response?.status()).toBe(200);
  // Viewport only: header, sidebar and intro. Entries are captured below.
  await argosScreenshot(page, "api-reference", { fullPage: false });
});

for (const [kind, slug] of entries) {
  test(`entry: ${kind}`, async ({ page }) => {
    await page.goto("/api-reference");
    await argosScreenshot(page, `entry-${kind}`, {
      element: entry(page, slug),
      argosCSS: hideChrome,
    });
  });

  // Per-type URLs are redirect stubs to the single-page anchor. A broken
  // stub or anchor (e.g. a linkRoot regression) must fail the run.
  test(`redirect: ${kind}`, async ({ page }) => {
    const response = await page.goto(`/api-reference/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(new RegExp(`/api-reference#${slug}$`));
    await expect(page.locator(`h2#${slug}`)).toBeInViewport();
  });

  // Each type is also published as plain Markdown next to its page: no MDX
  // or HTML spans.
  test(`markdown copy: ${kind}`, async ({ page }) => {
    const response = await page.request.get(`/api-reference/${slug}.md`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body.startsWith("# ")).toBe(true);
    expect(body).not.toContain("<span");
  });

  // The entry's title row links to its copy.
  test(`markdown link: ${kind}`, async ({ page }) => {
    await page.goto("/api-reference");
    const link = entry(page, slug).getByRole("link", {
      name: "View as Markdown",
    });
    await expect(link).toHaveAttribute(
      "href",
      new RegExp(`/api-reference/${slug}\\.md$`),
    );
    await expect(link).toHaveAttribute("target", "_blank");
  });
}

test.describe("dark mode", () => {
  test.use({ colorScheme: "dark" });

  test("home", async ({ page }) => {
    await page.goto("/");
    await argosScreenshot(page, "home-dark");
  });

  test("entry: object", async ({ page }) => {
    await page.goto("/api-reference");
    await argosScreenshot(page, "entry-object-dark", {
      element: entry(page, "objects-project"),
      argosCSS: hideChrome,
    });
  });
});
