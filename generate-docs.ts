// generate-docs.ts
import { createGenerateDocs } from "@graphql-markdown/nuxt-theme/generate";
import {
  directiveOccurrence,
  hasDirectiveNamed,
} from "@graphql-markdown/graphql";

const OPERATIONS = ["queries", "mutations", "subscriptions"] as const;

const fencedGraphQL = (code: unknown): string =>
  ["```graphql", String(code), "```"].join("\n");

// Create the generator with demo-nuxt's custom sections and decorators
export const generate = createGenerateDocs({
  schema: "./schema/api.graphql",
  printTypeOptions: {
    exampleSection: {
      directive: "example",
    },
    // A decorator predicated on `isOperation` (tried instead of this) hits a
    // duplicate-`graphql`-module bug: demo-nuxt's own `graphql` devDependency
    // and the copy `@graphql-markdown/cli` nests internally are different
    // installs, so GraphQL.js's instanceof-based leaf-type checks fail
    // across that boundary for every operation ("Expected String! to be a
    // GraphQL leaf type") and the page silently isn't written. customSections
    // doesn't touch that code path.
    customSections: [
      {
        name: "exampleResponse",
        title: "Example Response",
        directive: "exampleResponse",
        position: { after: "metadata" },
        appliesTo: [...OPERATIONS],
        render: ([value]) => fencedGraphQL(value?.value),
      },
    ],
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
  },
});
