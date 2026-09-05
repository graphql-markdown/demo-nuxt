<template>
  <div class="flex min-h-screen flex-col bg-default font-sans text-default">
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

      <slot />
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
</template>

<script setup lang="ts">
const isSidebarOpen = ref(true);

const { sections: navigationSections } = await useApiNavigation();

const { data: searchFiles } = await useAsyncData("api-reference-search", () =>
  queryCollectionSearchSections("content"),
);
</script>
