<!--
  Demo-only override of the theme's SiteFooter (an app component takes
  precedence over the layer's): same footer, plus a link to star the project.
-->
<template>
  <UFooter :ui="footerUi">
    <div class="flex items-center gap-2 text-sm text-dimmed">
      <ULink
        to="https://graphql-markdown.dev/"
        target="_blank"
        class="transition hover:text-primary"
      >
        Built with GraphQL-Markdown
      </ULink>
      <span aria-hidden="true">·</span>
      <ULink
        to="https://github.com/graphql-markdown/graphql-markdown"
        target="_blank"
        class="transition hover:text-primary"
      >
        ⭐ Star on GitHub
      </ULink>
    </div>
  </UFooter>
</template>

<script setup lang="ts">
// buildFooterUi is auto-imported from the theme layer's app/utils.
const props = withDefaults(
  defineProps<{ containerClass?: string; sticky?: boolean }>(),
  { containerClass: undefined, sticky: false },
);

const footerUi = computed(() =>
  buildFooterUi({
    containerClass: props.containerClass,
    sticky: props.sticky,
  }),
);
</script>
