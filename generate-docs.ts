// generate-docs.ts
import { useLogger } from "@nuxt/kit";

import { runGraphQLMarkdown } from "@graphql-markdown/cli";
import type { ConstDirectiveNode } from "graphql";

/**
 * `@graphql-markdown/types` is a transitive dependency, so the option shape is
 * taken from the CLI's own signature rather than imported by package name.
 */
type GraphQLMarkdownOptions = Parameters<typeof runGraphQLMarkdown>[0];

/**
 * Directive names are opaque branded strings in the library's types, so a plain
 * string key has to be named through the option type it belongs to.
 */
type DirectiveName = keyof NonNullable<
  GraphQLMarkdownOptions["customDirective"]
>;

/** `{ <loader class>: <package providing it> }` — both sides opaque in the types. */
const loaders = {
  GraphQLFileLoader: "@graphql-tools/graphql-file-loader",
} as GraphQLMarkdownOptions["loaders"];

/** The subset of a GraphQL type that `directiveArgument` reads. */
interface DirectiveCarrier {
  astNode?: { directives?: readonly ConstDirectiveNode[] } | null;
}

const logger = useLogger("generate-docs");

const formatter = new URL("./graphql-markdown-formatter.ts", import.meta.url)
  .href;

const OPERATIONS = ["queries", "mutations", "subscriptions"] as const;

const fencedGraphQL = (code: unknown): string =>
  ["```graphql", String(code), "```"].join("\n");

/** Reads `@directive(argument: "…")` off a type's AST node. */
const directiveArgument = (
  type: unknown,
  directiveName: string,
  argumentName: string,
): string => {
  const argument = (type as DirectiveCarrier | undefined)?.astNode?.directives
    ?.find((directive) => directive.name.value === directiveName)
    ?.arguments?.find((argument) => argument.name.value === argumentName);

  return argument && "value" in argument.value
    ? String(argument.value.value)
    : "";
};

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

  // Forces the library to gracefully initialize empty plugin arrays
  customDirective: {
    ["deprecatedType" as DirectiveName]: {
      descriptor: (_directive, type) =>
        directiveArgument(type, "deprecatedType", "reason"),
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
