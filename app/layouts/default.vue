<template>
  <main class="min-h-screen overflow-hidden bg-default text-default">
    <SiteHeader container-class="max-w-6xl px-6">
      <template #right>
        <ULink
          to="/api-reference"
          class="mr-2 text-sm text-muted transition hover:text-highlighted"
        >
          Browse reference
        </ULink>
      </template>
    </SiteHeader>

    <slot />

    <SiteFooter />
  </main>
</template>
