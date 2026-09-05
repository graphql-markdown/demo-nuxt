<template>
  <div
    v-if="page"
    class="flex min-h-screen flex-col bg-default font-sans text-default"
  >
    <SiteHeader>
      <template #leading>
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          class="lg:hidden"
          aria-label="Open navigation"
          @click="isSidebarOpen = true"
        />
      </template>

      <template #right>
        <UContentSearchButton />

        <UButton
          to="https://github.com/graphql-markdown/graphql-markdown"
          target="_blank"
          icon="i-lucide-github"
          color="neutral"
          variant="outline"
          aria-label="GraphQL-Markdown on GitHub"
          title="GraphQL-Markdown on GitHub"
        />
      </template>
    </SiteHeader>

    <div class="relative flex w-full flex-1">
      <USidebar
        v-model:open="isSidebarOpen"
        collapsible="offcanvas"
        mode="slideover"
        title="GraphQL API"
        :ui="{
          container:
            'top-(--ui-header-height) h-[calc(100vh-var(--ui-header-height))] border-r border-default bg-muted',
          header: 'px-8',
          body: 'p-8 pt-4',
        }"
        class="[--sidebar-width:20rem]"
      >
        <template #header>
          <NuxtLink
            to="/api-reference"
            class="block text-sm font-semibold text-dimmed transition hover:text-primary"
          >
            GraphQL API
          </NuxtLink>
        </template>

        <div class="flex flex-col gap-4">
          <UCollapsible
            v-for="section in navigationSections"
            :key="section.title"
            default-open
          >
            <UButton
              :label="section.title"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-chevron-down"
              block
              class="group mb-1 -mx-2.5 w-[calc(100%+1.25rem)] justify-between px-2.5"
              :ui="{
                label: 'text-[0.85rem] font-extrabold uppercase text-primary',
                trailingIcon:
                  'text-primary transition-transform duration-200 group-data-[state=open]:rotate-180',
              }"
            />

            <template #content>
              <UContentNavigation
                :navigation="section.children"
                :default-open="true"
                :ui="{ link: 'text-sm', trigger: 'font-normal' }"
              />
            </template>
          </UCollapsible>
        </div>
      </USidebar>

      <main
        class="grid flex-1 grid-cols-1"
        :class="{ 'lg:grid-cols-2': !isLandingPage }"
      >
        <section
          class="api-document max-w-none overflow-y-auto p-8 lg:px-16 lg:py-20"
          :class="{ 'border-r border-default': !isLandingPage }"
        >
          <UBreadcrumb
            :items="breadcrumbs"
            class="mb-8 -mt-12 font-mono"
            :ui="{ list: 'flex-wrap', linkLabel: 'truncate-none' }"
          />

          <UAlert
            v-if="deprecationReason"
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :description="deprecationReason"
            class="mb-8"
          />

          <div v-if="isLandingPage">
            <UPageHeader
              headline="GRAPHQL SCHEMA REFERENCE"
              title="Schema Documentation"
              description="Browse the workspace API by operation or schema type. Every page includes its definition, related fields, and examples when available."
              :ui="{
                root: 'border-0 pt-0 pb-0',
                headline: 'font-mono font-normal',
                title: 'font-serif text-5xl sm:text-5xl font-semibold',
                description: 'max-w-2xl leading-8',
              }"
            />

            <UPageGrid class="mt-6 gap-2 xl:grid-cols-3">
              <UPageCard
                v-for="group in overviewGroups"
                :key="`${group.sectionTitle}-${group.title}`"
                :to="group.items[0].path"
                :title="group.title"
                :description="`${group.items.length} ${group.items.length === 1 ? 'entry' : 'entries'}`"
                variant="subtle"
                :ui="{
                  container: 'p-3 sm:p-3 gap-y-0',
                  title: 'font-serif text-lg',
                  description: 'text-xs leading-tight text-muted',
                }"
              >
                <template #leading>
                  <p class="font-mono text-[0.6875rem] text-primary">
                    {{ group.sectionTitle }}
                  </p>
                </template>
              </UPageCard>
            </UPageGrid>
          </div>
          <template v-else>
            <ContentRenderer
              v-if="document.lead"
              :value="document.lead"
              class="markdown-text-body markdown-lead"
            />

            <UCollapsible
              v-for="section in document.sections"
              :key="section.id"
              default-open
            >
              <UButton
                :id="section.id"
                :label="section.title"
                :trailing-icon="'i-lucide-chevron-down'"
                color="neutral"
                variant="ghost"
                block
                class="group section-trigger"
                :ui="{
                  label: 'font-serif text-2xl font-semibold text-highlighted',
                  trailingIcon:
                    'size-5 text-dimmed transition-transform duration-200 group-data-[state=open]:rotate-180',
                }"
              />

              <template #content>
                <ContentRenderer
                  :value="section.document"
                  class="markdown-text-body"
                />
              </template>
            </UCollapsible>
          </template>
        </section>

        <section
          v-if="!isLandingPage"
          class="space-y-6 bg-default p-8 lg:sticky lg:top-(--ui-header-height) lg:h-[calc(100vh-var(--ui-header-height))] lg:overflow-y-auto lg:px-12 lg:py-16"
        >
          <SchemaCodeCard v-if="definitionCard" v-bind="definitionCard" />

          <!-- An operation documents a request and its response, so the two
               examples read as tabs; a type page has at most one, and keeps a
               plain card. -->
          <ProseCodeGroup v-if="isOperation && exampleCards.length">
            <SchemaCodeCard
              v-for="card in exampleCards"
              :key="card.label"
              v-bind="card"
            />
          </ProseCodeGroup>
          <template v-else>
            <SchemaCodeCard
              v-for="card in exampleCards"
              :key="card.label"
              v-bind="card"
            />
          </template>
        </section>
      </main>
    </div>
    <SiteFooter />

    <ClientOnly>
      <!-- Nuxt UI reads the dialog's accessible name from `contentSearch.title`
           and `contentSearch.description`, which its bundled locales do not
           define — without these props the modal announces the raw keys. -->
      <UContentSearch
        :navigation="navigationSections"
        :files="searchFiles ?? []"
        title="Search the API reference"
        description="Find an operation, type, field, or example by name."
      />
    </ClientOnly>
  </div>
  <div v-else class="p-12 text-center text-muted">
    Loading documentation endpoint...
  </div>
</template>

<script setup lang="ts">
import { codeToHtml } from "shiki";

import {
  CODE_COLUMN_SECTIONS,
  isOperationCategory,
  codeColumnNodeIndexes,
  definitionCode,
  findDeprecationNotice,
  schemaKindLabel,
  sectionCode,
  titleCase,
  toRenderableNode,
  withoutDeprecationNotice,
} from "~/utils/api-document";
import { isElement, nodeText, type MdcNode } from "~/utils/mdc";

const route = useRoute();
const isSidebarOpen = ref(true);

const pathSegments = computed(() => route.path.split("/").filter(Boolean));

/** `/api-reference` itself has no generated document; it lists the schema. */
const isLandingPage = computed(
  () => route.path.replace(/\/$/, "") === "/api-reference",
);

/** `/api-reference/types/objects/user` → `OBJECT`, for the code-column badge. */
const schemaKind = computed(() => schemaKindLabel(pathSegments.value.at(-2)));

const isOperation = computed(() =>
  isOperationCategory(pathSegments.value.at(-2)),
);

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection("content")
    .path(isLandingPage.value ? "/api-reference/generated" : route.path)
    .first(),
);

const { data: searchFiles } = await useAsyncData("api-reference-search", () =>
  queryCollectionSearchSections("content"),
);

const { sections: navigationSections, overviewGroups } =
  await useApiNavigation();

const breadcrumbs = computed(() =>
  pathSegments.value.map((segment, index) => {
    const isLeaf = index === pathSegments.value.length - 1;
    const isRoot = index === 0;

    return {
      label: isRoot
        ? "API Reference"
        : isLeaf && page.value?.title
          ? page.value.title
          : titleCase(segment),
      // Only the root crumb navigates; the category segments have no page.
      to:
        isRoot && pathSegments.value.length > 1 ? "/api-reference" : undefined,
    };
  }),
);

const documentBody = computed<MdcNode[]>(() => page.value?.body?.value ?? []);

const deprecationReason = computed(() =>
  findDeprecationNotice(page.value?.body),
);

/**
 * The prose column: generated markup fixed up for Nuxt UI, minus everything
 * already shown by the code column and the deprecation alert.
 */
const documentNodes = computed(() => {
  const inCodeColumn = codeColumnNodeIndexes(documentBody.value);

  return withoutDeprecationNotice(
    documentBody.value.filter((_, index) => !inCodeColumn.has(index)),
    deprecationReason.value,
  ).map(toRenderableNode);
});

const asDocument = (nodes: MdcNode[]) => ({
  ...page.value,
  body: { ...page.value?.body, value: nodes },
});

/**
 * The document is split at its `h3` boundaries so each schema section
 * ("Arguments", "Fields", …) can collapse behind its own heading. The nodes
 * before the first heading are the type description and stay always visible.
 */
const document = computed(() => {
  const lead: MdcNode[] = [];
  const sections: Array<{ id: string; title: string; nodes: MdcNode[] }> = [];

  for (const node of documentNodes.value) {
    if (isElement(node, "h3")) {
      sections.push({
        id: node[1]?.id ?? `section-${sections.length}`,
        title: nodeText(node).trim(),
        nodes: [],
      });
      continue;
    }

    (sections.at(-1)?.nodes ?? lead).push(node);
  }

  return {
    lead: lead.length ? asDocument(lead) : undefined,
    sections: sections.map(({ nodes, ...section }) => ({
      ...section,
      document: asDocument(nodes),
    })),
  };
});

/**
 * Object and input examples are JSON payloads, operation examples and every
 * definition are GraphQL. Highlighting JSON with the GraphQL grammar drops
 * every key and string into the theme's comment colour, which is barely
 * legible on the dark card.
 */
const detectLanguage = (code: string) => {
  try {
    JSON.parse(code);
    return "json";
  } catch {
    return "graphql";
  }
};

/**
 * Highlights the code column's cards, dropping any the page carries no snippet
 * for: the landing page has no definition, and most types define no example.
 */
const toCards = (
  cards: Array<{ label: string; kind: string; code?: string }>,
) =>
  Promise.all(
    cards
      .filter((card): card is typeof card & { code: string } =>
        Boolean(card.code),
      )
      .map(async (card) => ({
        ...card,
        html: await codeToHtml(card.code, {
          lang: detectLanguage(card.code),
          theme: "github-dark",
        }),
      })),
  );

const [definitionCard] = await toCards([
  {
    label: "Schema",
    kind: schemaKind.value,
    code: definitionCode(documentBody.value),
  },
]);

const exampleCards = await toCards(
  CODE_COLUMN_SECTIONS.map(({ title, kind }) => ({
    label: title,
    kind: kind ?? schemaKind.value,
    code: sectionCode(documentBody.value, title),
  })),
);

if (page.value) {
  useSeoMeta({
    title: isLandingPage.value
      ? page.value.title
      : `API Reference | ${page.value.title}`,
    description: page.value.description,
  });
}
</script>

<style>
/* Everything below styles rendered content only. Scoping to
   `.markdown-text-body` — the ContentRenderer wrapper — keeps it away from the
   hand-written landing markup that shares the `.api-document` column. */
.markdown-text-body :is(h1, h2, h3) {
  color: var(--ui-text-highlighted);
  font-family: var(--font-serif);
  font-weight: 600;
  letter-spacing: 0;
}

.markdown-text-body h2 {
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: 2.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--ui-border-accented);
}

.markdown-text-body h3 {
  font-size: 1.5rem;
  margin-top: 2.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ui-border-muted);
}

/* The section heading carries the separator, so the first entry beneath it
   must not draw a second one. */
.markdown-text-body h3 + h4 {
  border-top: 0;
  padding-top: 0.5rem;
}

.markdown-text-body h4 {
  color: var(--ui-primary);
  font-family: var(--font-mono);
  font-size: 1rem;
  margin-top: 0;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ui-border-muted);
}

.markdown-text-body p {
  color: var(--ui-text);
  font-size: 1rem;
  line-height: 1.5rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

/* The type/operation description renders in its own block above the collapsible
   sections and reads as a lead paragraph; everything inside a section is body
   copy, which `.markdown-text-body p` already sizes. */
.markdown-lead > p {
  font-size: 1.2rem;
  line-height: 1.75rem;
}

/* The section heading is now a collapsible trigger, so it carries the rule and
   spacing the `h3` used to draw. */
.section-trigger {
  justify-content: space-between;
  margin-top: 2.75rem;
  padding: 0 0 0.75rem;
  border-bottom: 1px solid var(--ui-border-muted);
  border-radius: 0;
}

.section-trigger:hover {
  background: transparent;
}

/* The trigger carries the separator, so the first entry beneath it must not
   draw a second one. */
.markdown-text-body > h4:first-child {
  border-top: 0;
  padding-top: 1rem;
}

.markdown-text-body a {
  color: var(--ui-primary);
  text-decoration: none;
}

.markdown-text-body a[href^="/api-reference/"] {
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--ui-primary);
  text-decoration-style: dotted;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.markdown-text-body a[href^="/api-reference/"]:hover {
  background: color-mix(in oklch, var(--ui-primary) 20%, transparent);
  border-radius: 3px;
}

/* Nuxt UI hovers code-in-link via `&>code`, but generated entity links wrap the
   chip in a `.gqlmd-mdx-entity` span — the chip is a grandchild, so that never
   matches and the opaque chip also hides the anchor's own hover. Re-apply it
   for that shape, on links that actually navigate somewhere. */
.markdown-text-body a:not([href^="#"]) > .gqlmd-mdx-entity > code {
  border-style: dashed;
  transition:
    color 0.15s,
    border-color 0.15s;
}

.markdown-text-body a:not([href^="#"]):hover > .gqlmd-mdx-entity > code {
  border-color: var(--ui-primary);
  color: var(--ui-primary);
}

/* Self-anchors (`Folder.id`) only mark the field they head — nothing to follow,
   so they stay inert, including Nuxt UI's own underline-on-hover. */
.markdown-text-body a[href^="#"]:hover {
  background: none;
  border-bottom-color: transparent;
}

/* The GraphQL definition is rendered separately in the code column. Hiding the
   `<pre>` alone leaves the ProsePre wrapper behind, whose absolutely-positioned
   copy button then floats over the prose — so the whole block goes. */
.markdown-text-body div:has(> pre),
.markdown-text-body pre,
.markdown-text-body .code-block,
.markdown-text-body code::before,
.markdown-text-body code::after {
  display: none !important;
}
</style>
