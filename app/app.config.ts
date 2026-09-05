export default defineAppConfig({
  ui: {
    colors: {
      primary: 'violet',
      neutral: 'zinc'
    },
    // Generated headings already contain their own `#anchor` link, so the prose
    // components must not wrap them in a second one — nested <a> elements get
    // reparented by the HTML parser and break hydration.
    prose: {
      h1: { defaultVariants: { anchor: false } },
      h2: { defaultVariants: { anchor: false } },
      h3: { defaultVariants: { anchor: false } },
      h4: { defaultVariants: { anchor: false } }
    }
  }
})
