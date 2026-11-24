// generate-docs.ts
import { createGenerateDocs } from "@graphql-markdown/nuxt-theme/generate";
import referenceOptions from "./lib/reference-options.mjs";

type Options = Parameters<typeof createGenerateDocs>[0];

// Create the generator with demo-nuxt's custom sections and decorators. The
// schema, loaders, print options and decorators are shared with the Markdown
// copies (see lib/reference-options.mjs).
export const generate = createGenerateDocs({
  ...(referenceOptions as unknown as Options),
  // Rendered as the reference's intro (title, SEO description and body).
  homepage: "./schema/homepage.md",
  // Demo builds should not send anonymous usage telemetry.
  telemetry: false,
  // The theme formatter, extended to link the types named in deprecation
  // reasons (see custom-mdx.mjs).
  formatter: new URL("./custom-mdx.mjs", import.meta.url).href,
});
