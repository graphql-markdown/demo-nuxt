/** ` · ` instead of the default ` ● `, as text rather than a styled span. */
export const formatMDXBullet = (text = '') => `&nbsp;·&nbsp;${text}`

export const formatMDXBadge = ({ text }) => {
	const suffix = text.toLowerCase()
	return `<mark class="gqlmd-mdx-badge gqlmd-mdx-badge-${suffix}">${text}</mark>`
}

export const formatMDXAdmonition = ({ text, title, type }) => {
	if (type.toLowerCase() === 'warning' && title.toLowerCase() === 'deprecated') {
		return `<aside class="api-deprecation-callout not-prose mb-8"><span class="api-deprecated-badge">deprecated</span><span class="api-deprecation-message">${text.trim()}</span></aside>`
	}

	return `<fieldset class="gqlmd-mdx-admonition-fieldset"><legend class="gqlmd-mdx-admonition-legend"><span class="gqlmd-mdx-admonition-legend-type gqlmd-mdx-admonition-legend-type-${type.toLowerCase()}">${title}</span></legend><span>${text}</span></fieldset>`
}
/**
 * Nuxt Content parses `.md` and `.mdx` alike, but its search indexer
 * (`queryCollectionSearchSections`) only reads `extension = "md"` — so the
 * generated pages have to be emitted as plain Markdown to be searchable.
 */
export const mdxExtension = '.md'
