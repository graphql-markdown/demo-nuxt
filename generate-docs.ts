// generate-docs.ts
import { useLogger } from "@nuxt/kit";

import { runGraphQLMarkdown } from "@graphql-markdown/cli";
import {
  directiveOccurrence,
  hasDirectiveNamed,
} from "@graphql-markdown/graphql";

/**
 * `@graphql-markdown/types` is a transitive dependency, so the option shape is
 * taken from the CLI's own signature rather than imported by package name.
 */
type GraphQLMarkdownOptions = Parameters<typeof runGraphQLMarkdown>[0];

/** `{ <loader class>: <package providing it> }` — both sides opaque in the types. */
const loaders = {
  GraphQLFileLoader: "@graphql-tools/graphql-file-loader",
} as GraphQLMarkdownOptions["loaders"];

const logger = useLogger("generate-docs");

const formatter = new URL("./graphql-markdown-formatter.ts", import.meta.url)
  .href;

const OPERATIONS = ["queries", "mutations", "subscriptions"] as const;

const fencedGraphQL = (code: unknown): string =>
  ["```graphql", String(code), "```"].join("\n");

const options: GraphQLMarkdownOptions = {
  // Core paths
  schema: "./schema/api.graphql",
  rootPath: "./content",
  baseURL: "api-reference",
  linkRoot: "/",
  formatter,

  // Formatting fallback options to bypass the internal configuration setup
  loaders,

  // Layout extraction flags
  printTypeOptions: {
    parentTypePrefix: false,
    typeBadges: true,
    exampleSection: {
      directive: "example",
    },
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

  // Mirrors the built-in `@deprecated` treatment (badge + callout) for the
  // type-level `@deprecatedType` directive, which the spec doesn't allow
  // `@deprecated` to target.
  decorators: {
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
  groupByDirective: undefined,
};

export async function generate(): Promise<void> {
  try {
    await runGraphQLMarkdown(options, {}, import.meta.resolve("consola"));

    logger.info("GraphQL Markdown generated in ./content/api-reference/");
  } catch (error) {
    logger.error("Generation failed");
    throw new Error("GraphQL Markdown generation failed", { cause: error });
  }
}
