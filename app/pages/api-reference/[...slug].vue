<template>
  <div v-if="page" class="flex min-h-screen flex-col bg-default font-sans text-default">
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
          container: 'top-(--ui-header-height) h-[calc(100vh-var(--ui-header-height))] border-r border-default bg-muted',
          header: 'px-8',
          body: 'p-8 pt-4'
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
                trailingIcon: 'text-primary transition-transform duration-200 group-data-[state=open]:rotate-180'
              }"
            />

            <template #content>
              <UContentNavigation
                :navigation="section.groups"
                :default-open="true"
                :ui="{ link: 'text-sm', trigger: 'font-normal' }"
              />
            </template>
          </UCollapsible>
        </div>
      </USidebar>

      <main class="grid flex-1 grid-cols-1" :class="{ 'lg:grid-cols-2': !isLandingPage }">

        <section
          class="api-document max-w-none overflow-y-auto p-8 lg:px-16 lg:py-20"
          :class="{ 'border-r border-default': !isLandingPage }"
        >
          <UBreadcrumb
            :items="breadcrumbs"
            class="mb-8 font-mono"
            :ui="{ list: 'flex-wrap', linkLabel: 'truncate-none' }"
          />


          <UAlert
            v-if="deprecatedTypeReason"
            color="error"
            variant="subtle"
            icon="i-lucide-triangle-alert"
            :description="deprecatedTypeReason"
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
                description: 'max-w-2xl leading-8'
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
                  description: 'text-xs leading-tight text-muted'
                }"
              >
                <template #leading>
                  <p class="font-mono text-[0.6875rem] text-primary">{{ group.sectionTitle }}</p>
                </template>
              </UPageCard>
            </UPageGrid>
          </div>
          <template v-else>
            <ContentRenderer
              v-if="documentLead"
              :value="documentLead"
              class="markdown-text-body markdown-lead"
            />

            <UCollapsible
              v-for="section in documentSections"
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
                  trailingIcon: 'size-5 text-dimmed transition-transform duration-200 group-data-[state=open]:rotate-180'
                }"
              />

              <template #content>
                <ContentRenderer :value="section.document" class="markdown-text-body" />
              </template>
            </UCollapsible>
          </template>
        </section>

        <section v-if="!isLandingPage" class="space-y-6 bg-default p-8 lg:sticky lg:top-(--ui-header-height) lg:h-[calc(100vh-var(--ui-header-height))] lg:overflow-y-auto lg:px-12 lg:py-16">
          <SchemaCodeCard
            label="GraphQL"
            :kind="codeKind"
            :html="blueprintHtml"
            :code="blueprintSnippet"
          />

          <SchemaCodeCard
            v-if="exampleHtml && exampleSnippet"
            label="Example"
            :kind="codeKind"
            :html="exampleHtml"
            :code="exampleSnippet"
          />
        </section>
      </main>
    </div>
    <SiteFooter />

    <ClientOnly>
      <UContentSearch :files="searchFiles ?? []" />
    </ClientOnly>
  </div>
  <div v-else class="p-12 text-center text-muted">Loading documentation endpoint...</div>
</template>

<script setup lang="ts">
import { useAsyncData, useRoute } from '#app'
import { codeToHtml } from 'shiki'

const route = useRoute()
const isSidebarOpen = ref(true)
const isLandingPage = computed(() => route.path === '/api-reference' || route.path === '/api-reference/')
const codeKind = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)
  const category = pathSegments.at(-2)
  const labels: Record<string, string> = {
    directives: 'DIRECTIVE',
    mutations: 'MUTATION',
    subscriptions: 'SUBSCRIPTION',
    queries: 'QUERY',
    objects: 'OBJECT',
    scalars: 'SCALAR',
    enums: 'ENUM',
    unions: 'UNION',
    inputs: 'INPUT',
    interfaces: 'INTERFACE'
  }

  return category ? labels[category] ?? category.toUpperCase() : 'GRAPHQL'
})
const { data: page } = await useAsyncData(route.path, () => {
  const contentPath = isLandingPage.value
    ? '/api-reference/generated'
    : route.path

  return queryCollection('content').path(contentPath).first()
})

const formatNavigationLabel = (value: string) => {
  return value.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
}

const breadcrumbs = computed(() => {
  const pathSegments = route.path.split('/').filter(Boolean)

  return pathSegments.map((segment, index) => {
    const isLeaf = index === pathSegments.length - 1
    let label = formatNavigationLabel(segment)
    if (index === 0) label = 'API Reference'
    else if (isLeaf && page.value?.title) label = page.value.title

    return {
      label,
      // Only the root crumb navigates; the category segments have no page.
      to: index === 0 && pathSegments.length > 1 ? '/api-reference' : undefined
    }
  })
})

// Content nodes are `[tag, props, ...children]`; inline markup such as
// `Replaced by \`Project\`` is split across children, so the notice has to be
// read from the flattened text rather than matched against the raw JSON.
const nodeText = (node: any): string => {
  if (typeof node === 'string') return node
  if (!Array.isArray(node)) return ''

  return node.slice(2).map(nodeText).join('')
}

const nodeClasses = (node: any) => {
  const className = node?.[1]?.className ?? node?.[1]?.class ?? ''

  return Array.isArray(className) ? className : String(className).split(' ')
}

const findByClass = (node: any, className: string): any => {
  if (!Array.isArray(node)) return undefined
  if (nodeClasses(node).includes(className)) return node

  return node.slice(2).map((child: any) => findByClass(child, className)).find(Boolean)
}

const findDeprecationNotice = (body: any) => {
  const nodes = body?.value ?? []
  const definitionIndex = nodes.findIndex((node: any) => Array.isArray(node) && node[0] === 'pre')
  const metadataNodes = definitionIndex >= 0 ? nodes.slice(0, definitionIndex) : []

  return metadataNodes.map(nodeText).find((text: string) => text.includes('Replaced by'))
}

const isDeprecatedTypePage = (body: any) => Boolean(findDeprecationNotice(body))

const { data: searchFiles } = await useAsyncData('api-reference-search', () => {
  return queryCollectionSearchSections('content')
})

const { data: navigation } = await useAsyncData('api-reference-navigation', () => {
  return queryCollection('content')
    .order('path', 'ASC')
    .select('path', 'title', 'body')
    .all()
    .then(items => items
      .filter(item => item.path !== '/api-reference/generated')
      .map(item => ({
        path: item.path,
        title: item.title,
        isDeprecated: isDeprecatedTypePage(item.body)
      }))
    )
})

const navigationSections = computed(() => {
  const sections = new Map<string, Map<string, Array<{ path: string, title: string, isDeprecated: boolean }>>>()

  for (const item of navigation.value ?? []) {
    const [, , sectionName, groupName] = item.path.split('/')
    if (!sectionName || !groupName) continue

    const groups = sections.get(sectionName) ?? new Map()
    const items = groups.get(groupName) ?? []
    items.push(item)
    groups.set(groupName, items)
    sections.set(sectionName, groups)
  }

  return [...sections].map(([sectionName, groups]) => ({
    title: formatNavigationLabel(sectionName),
    groups: [...groups].map(([groupName, items]) => ({
      title: formatNavigationLabel(groupName),
      items,
      children: items.map(item => ({
        title: item.title,
        path: item.path,
        // Page names are schema entities, so they read as code. The `ui` rides
        // on the item rather than the component because `linkTitle` is shared
        // with the group triggers, which stay in the UI font.
        ui: { linkTitle: 'font-mono text-[small]' },
        badge: item.isDeprecated
          ? { label: 'deprecated', color: 'error' as const, variant: 'subtle' as const }
          : undefined
      }))
    }))
  }))
})

const deprecatedTypeReason = computed(() => findDeprecationNotice(page.value?.body))

const overviewGroups = computed(() => {
  return navigationSections.value.flatMap(section => {
    return section.groups.map(group => ({
      ...group,
      sectionTitle: section.title
    }))
  })
})

const getCodeBlock = (pageData: any, startIndex = 0) => {
  return pageData?.body?.value?.slice(startIndex).find((node: any) => {
    return Array.isArray(node) && node[0] === 'pre' && node[1]?.language === 'graphql'
  })
}

const exampleSectionIndex = computed(() => {
  return page.value?.body?.value?.findIndex((node: any) => {
    return Array.isArray(node) && node[0] === 'h3' && node[2] === 'Example'
  }) ?? -1
})

// Field-level deprecations are emitted as a raw `<aside>` in the generated
// content. Swap them for the same UAlert the type-level notice uses so both
// render identically.
const promoteDeprecationCallout = (node: any) => {
  if (!Array.isArray(node) || !nodeClasses(node).includes('api-deprecation-callout')) return node

  const message = findByClass(node, 'api-deprecation-message')

  return ['UAlert', {
    color: 'error',
    variant: 'subtle',
    icon: 'i-lucide-triangle-alert',
    description: nodeText(message ?? node),
    class: 'my-4'
  }]
}

// Generated content marks type metadata with `<mark class="gqlmd-mdx-badge-*">`.
// Render those as UBadge so they match the badges used in the sidebar.
const badgeStyles: Record<string, { color: string, variant: string }> = {
  'gqlmd-mdx-badge-deprecated': { color: 'error', variant: 'subtle' },
  'gqlmd-mdx-badge-non-null': { color: 'neutral', variant: 'solid' }
}

const promoteBadges = (node: any): any => {
  if (!Array.isArray(node)) return node

  const classes = nodeClasses(node)
  if (node[0] === 'mark' && classes.includes('gqlmd-mdx-badge')) {
    const style = classes.map(className => badgeStyles[className]).find(Boolean)
      ?? { color: 'neutral', variant: 'subtle' }

    return ['UBadge', { ...style, size: 'sm', class: 'font-mono align-middle' }, ...node.slice(2)]
  }

  return [node[0], node[1], ...node.slice(2).map(promoteBadges)]
}

const normalizeAnchorId = (node: any) => {
  if (!Array.isArray(node) || !/^h[1-6]$/.test(node[0])) return node

  const lastChild = node.at(-1)
  const anchorMatch = typeof lastChild === 'string' && lastChild.match(/\s*\{#([^}]+)\}\s*$/)
  if (!anchorMatch) return node

  const children = node.slice(2, -1)
  const remainingText = lastChild.replace(anchorMatch[0], '')
  if (remainingText) children.push(remainingText)

  return [node[0], { ...node[1], id: anchorMatch[1] }, ...children]
}

const documentPage = computed(() => {
  if (!page.value?.body?.value) return page.value

  let isInDeprecatedDirectiveSection = false

  return {
    ...page.value,
    body: {
      ...page.value.body,
      value: page.value.body.value
        .filter((node: any, index: number) => {
          if (index === exampleSectionIndex.value || index === exampleSectionIndex.value + 1) return false
          if (!deprecatedTypeReason.value) return true

          if (Array.isArray(node) && node[0] === 'h3' && node[2] === 'Directives') {
            isInDeprecatedDirectiveSection = true
            return false
          }

          if (isInDeprecatedDirectiveSection && Array.isArray(node) && node[0] === 'h3') {
            isInDeprecatedDirectiveSection = false
          }

          if (isInDeprecatedDirectiveSection) return false
          // The notice is promoted into the callout above the document.
          return !nodeText(node).includes(deprecatedTypeReason.value)
        })
        .map(normalizeAnchorId)
        .map(promoteDeprecationCallout)
        .map(promoteBadges)
    }
  }
})

// The document is split at its `h3` boundaries so each schema section
// ("Arguments", "Fields", …) can collapse behind its own heading. The nodes
// before the first heading are the type description and stay always visible.
const asDocument = (nodes: any[]) => ({
  ...page.value,
  body: { ...page.value?.body, value: nodes }
})

const documentNodes = computed<any[]>(() => documentPage.value?.body?.value ?? [])

const documentLead = computed(() => {
  const firstHeading = documentNodes.value.findIndex((node: any) => Array.isArray(node) && node[0] === 'h3')
  const lead = firstHeading >= 0 ? documentNodes.value.slice(0, firstHeading) : documentNodes.value

  return lead.length ? asDocument(lead) : undefined
})

const documentSections = computed(() => {
  const sections: Array<{ id: string, title: string, document: any }> = []

  for (const node of documentNodes.value) {
    if (Array.isArray(node) && node[0] === 'h3') {
      sections.push({
        id: node[1]?.id ?? `section-${sections.length}`,
        title: nodeText(node).trim(),
        document: asDocument([])
      })
      continue
    }

    sections.at(-1)?.document.body.value.push(node)
  }

  return sections
})

if (page.value) {
  useSeoMeta({
    title: isLandingPage.value ? page.value.title : `API Reference | ${page.value.title}`,
    description: page.value.description
  })
}

const extractCodeSnippet = (pageData: any) => {
  const codeBlock = getCodeBlock(pageData)
  if (codeBlock?.[1]?.code) return codeBlock[1].code

  return 'query {\n  folders {\n    id\n    name\n  }\n}'
}

const extractExampleSnippet = (pageData: any) => {
  const exampleIndex = pageData?.body?.value?.findIndex((node: any) => {
    return Array.isArray(node) && node[0] === 'h3' && node[2] === 'Example'
  })
  const codeBlock = exampleIndex >= 0 ? getCodeBlock(pageData, exampleIndex + 1) : undefined
  const snippet = codeBlock?.[1]?.code?.trim()

  // Types without a schema-defined example still emit an empty `{}` block.
  return snippet && snippet !== '{}' ? snippet : undefined
}

const blueprintSnippet = extractCodeSnippet(page.value)
const blueprintHtml = await codeToHtml(blueprintSnippet, {
  lang: 'graphql',
  theme: 'github-dark'
})

// Object and input examples are JSON payloads, operation examples are GraphQL.
// Highlighting JSON with the GraphQL grammar drops every key and string into
// the theme's comment colour, which is barely legible on the dark card.
const detectExampleLanguage = (snippet: string) => {
  const trimmed = snippet.trim()
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return 'graphql'

  try {
    JSON.parse(trimmed)
    return 'json'
  } catch {
    return 'graphql'
  }
}

const exampleSnippet = extractExampleSnippet(page.value)
const exampleHtml = exampleSnippet
  ? await codeToHtml(exampleSnippet, {
    lang: detectExampleLanguage(exampleSnippet),
    theme: 'github-dark'
  })
  : ''
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
  transition: color 0.15s, border-color 0.15s;
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

section nav {
  margin-top: calc(var(--spacing) * -12); /* hack to be improved */
}
</style>
