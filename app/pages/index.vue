<template>
  <div>
    <UPageHero
      orientation="horizontal"
      headline="GRAPHQL SCHEMA REFERENCE"
      title="Your API, mapped with intent."
      description="Explore a generated workspace schema with operations, input types, relationships, and ready-to-run examples in one focused reference."
      :links="heroLinks"
      :ui="{
        container:
          'max-w-6xl px-6 gap-14 pb-24 pt-16 lg:pt-24 lg:grid-cols-[1.05fr_0.95fr]',
        headline: 'mb-6 font-mono text-sm text-primary',
        title:
          'max-w-xl font-serif text-5xl sm:text-5xl md:text-6xl font-semibold leading-tight',
        description: 'mt-7 max-w-lg text-lg sm:text-lg/8 leading-8',
        links: 'mt-10 gap-4',
      }"
    >
      <div
        class="schema-preview overflow-hidden rounded-lg border border-accented shadow-[20px_20px_0_#e4e4e7] dark:shadow-[20px_20px_0_#171717]"
      >
        <div
          class="flex items-center justify-between border-b border-zinc-700/80 px-5 py-4"
        >
          <span class="font-mono text-sm text-zinc-400">workspace.graphql</span>
          <span
            class="rounded bg-violet-300/10 px-2 py-1 font-mono text-xs text-violet-300"
            >SCHEMA</span
          >
        </div>
        <pre
          class="m-0 overflow-x-auto p-6 text-sm leading-7"
        ><code><span class="token-keyword">type</span> <span class="token-type">Project</span> <span class="token-keyword">implements</span> <span class="token-type">Node</span> {
  <span class="token-field">id</span>: <span class="token-type">ID!</span>
  <span class="token-field">name</span>: <span class="token-type">String!</span>
  <span class="token-field">status</span>: <span class="token-type">ProjectStatus!</span>
  <span class="token-field">owner</span>: <span class="token-type">User!</span>
}

<span class="token-keyword">type</span> <span class="token-type">Query</span> {
  <span class="token-field">projects</span>(status: <span class="token-type">ProjectStatus</span>):
    <span class="token-type">ProjectConnection!</span>
}</code></pre>
      </div>
    </UPageHero>

    <section class="border-y border-default bg-muted">
      <UPageGrid class="mx-auto max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <UPageCard
          v-for="highlight in highlights"
          :key="highlight.headline"
          :title="highlight.title"
          variant="naked"
          :ui="{
            container: 'p-0 sm:p-0 gap-y-0',
            title: 'mt-3 text-lg font-normal',
          }"
        >
          <template #leading>
            <p class="font-mono text-xs text-primary">
              {{ highlight.headline }}
            </p>
          </template>
        </UPageCard>
      </UPageGrid>
    </section>
  </div>
</template>

<script setup lang="ts">
const heroLinks = [
  {
    label: "Explore the API",
    to: "/api-reference",
    color: "primary" as const,
    size: "xl" as const,
  },
  {
    label: "View an example",
    to: "/api-reference/operations/queries/projects",
    color: "neutral" as const,
    variant: "outline" as const,
    size: "xl" as const,
  },
];

const highlights = [
  { headline: "OPERATIONS", title: "Queries, mutations, subscriptions" },
  { headline: "MODELS", title: "Objects, inputs, unions, enums" },
  { headline: "EXAMPLES", title: "Schema-defined GraphQL samples" },
];

useSeoMeta({
  title: "GraphQL-Markdown Nuxt Demo",
  description:
    "A generated GraphQL API reference for the workspace demo schema.",
});
</script>

<style scoped>
/* The schema preview stays dark in both modes — it reads as a code surface. */
.schema-preview {
  background: #1f1f1f;
}

.token-keyword {
  color: #d8b4fe;
}

.token-type {
  color: #93c5fd;
}

.token-field {
  color: #f0abfc;
}
</style>
