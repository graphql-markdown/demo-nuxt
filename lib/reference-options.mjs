// lib/reference-options.mjs
// Settings shared by the two outputs of this demo: the nuxt-theme pages
// (generate-docs.ts) and the plain Markdown copies (graphql.config.mjs).
// Keeping them in one place keeps both outputs' content identical.
import {
  directiveOccurrence,
  hasDirectiveNamed,
  isOperation,
} from "@graphql-markdown/graphql";

/**
 * Wraps code in a fenced block.
 * @param {string} lang
 * @param {unknown} code
 * @returns {string}
 */
const fenced = (lang, code) => ["```" + lang, String(code), "```"].join("\n");

// The schema shared by all GraphQL-Markdown demos, served from the main
// repository.
export const schema =
  "https://raw.githubusercontent.com/graphql-markdown/graphql-markdown/main/tests/e2e/__data__/demo_schema.graphql";

export const loaders = {
  UrlLoader: "@graphql-tools/url-loader",
};

export const printTypeOptions = {
  exampleSection: {
    directive: "example",
  },
  hierarchy: "flat",
  // The nuxt-theme's defaults, repeated so the Markdown copies match the pages.
  parentTypePrefix: false,
  typeBadges: true,
};

export const decorators = {
  // Mirrors the built-in `@deprecated` treatment (badge + callout) for the
  // type-level `@deprecatedType` directive, which the spec doesn't allow
  // `@deprecated` to target.
  deprecatedTypeTag: {
    predicate: hasDirectiveNamed("deprecatedType"),
    position: { into: "tags" },
    render: (_values, options) =>
      options.formatMDXBadge({ text: "deprecated" }),
  },
  deprecatedTypeNotice: {
    predicate: hasDirectiveNamed("deprecatedType"),
    position: { into: "description" },
    resolve: directiveOccurrence("deprecatedType"),
    render: ([value], options) =>
      options.formatMDXAdmonition(
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
};

export const referenceOptions = {
  schema,
  loaders,
  printTypeOptions,
  decorators,
};

export default referenceOptions;
