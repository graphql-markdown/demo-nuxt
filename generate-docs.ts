// generate-docs.ts
import { createGenerateDocs } from "@graphql-markdown/nuxt-theme/generate";
import {
  directiveOccurrence,
  hasDirectiveNamed,
  isOperation,
} from "@graphql-markdown/graphql";

const fenced = (lang: string, code: unknown): string =>
  ["```" + lang, String(code), "```"].join("\n");

// Create the generator with demo-nuxt's custom sections and decorators
export const generate = createGenerateDocs({
  schema: "./schema/api.graphql",
  // Rendered as the reference's intro (title, SEO description and body).
  homepage: "./schema/homepage.md",
  printTypeOptions: {
    exampleSection: {
      directive: "example",
    },
    hierarchy: "flat",
  },
  decorators: {
    // Mirrors the built-in `@deprecated` treatment (badge + callout) for the
    // type-level `@deprecatedType` directive, which the spec doesn't allow
    // `@deprecated` to target.
    deprecatedTypeTag: {
      predicate: hasDirectiveNamed("deprecatedType"),
      position: { into: "tags" },
      render: (_values, options) =>
        options.formatMDXBadge!({ text: "deprecated" }),
    },
    deprecatedTypeNotice: {
      predicate: hasDirectiveNamed("deprecatedType"),
      position: { into: "description" },
      resolve: directiveOccurrence("deprecatedType"),
      render: ([value], options) =>
        options.formatMDXAdmonition!(
          { text: String(value.reason), title: "Deprecated", type: "warning" },
          options.meta,
        ),
    },
    // The theme stacks this section under the Example query in the code column.
    exampleVariables: {
      title: "Example Variables",
      predicate: isOperation,
      position: { after: "metadata" },
      resolve: directiveOccurrence("exampleVariables"),
      render: ([value]) => fenced("json", value?.value),
    },
    // customSections (used here previously) is deprecated in favor of
    // decorators - a titled decorator renders the same top-level section a
    // customSections entry would.
    exampleResponse: {
      title: "Example Response",
      predicate: isOperation,
      position: { after: "metadata" },
      resolve: directiveOccurrence("exampleResponse"),
      // `directiveOccurrence` resolves the directive's own argument record
      // (`@exampleResponse(value: String!)` -> `{ value: "..." }`), not a
      // GraphQL type/field to print as SDL, so a plain fenced block - not
      // `Printer.printCode` (which expects the latter) - is what this needs.
      render: ([value]) => fenced("graphql", value?.value),
    },
  },
});
