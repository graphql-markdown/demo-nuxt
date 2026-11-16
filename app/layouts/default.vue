<template>
  <main class="flex min-h-screen flex-col overflow-hidden bg-default text-default">
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

    <div class="flex-1">
      <slot />
    </div>

    <SiteFooter />
  </main>
</template>
