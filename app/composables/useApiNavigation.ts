import { findDeprecationNotice, titleCase } from "~/utils/api-document";

/** The landing page renders its own overview instead of a generated document. */
const LANDING_PAGE_PATH = "/api-reference/generated";

export interface ApiNavigationItem {
  path: string;
  title: string;
  isDeprecated: boolean;
}

export interface ApiNavigationGroup {
  title: string;
  items: ApiNavigationItem[];
  children: Array<Record<string, unknown>>;
}

/**
 * The navigation tree, derived from the content paths themselves: every page
 * lives at `/api-reference/<section>/<group>/<name>` (`types/objects/user`), so
 * the two middle segments are the section and the group.
 *
 * The shape is the one `UContentNavigation` and `UContentSearch` both expect —
 * nodes with a `title` and either `children` or a `path` — so the sidebar and
 * the search palette read the same tree.
 */
export const useApiNavigation = async () => {
  const { data: pages } = await useAsyncData("api-reference-navigation", () =>
    queryCollection("content")
      .order("path", "ASC")
      .select("path", "title", "body")
      .all()
      .then((items) =>
        items
          .filter((item) => item.path !== LANDING_PAGE_PATH)
          .map<ApiNavigationItem>((item) => ({
            path: item.path,
            title: item.title,
            isDeprecated: Boolean(findDeprecationNotice(item.body)),
          })),
      ),
  );

  const sections = computed(() => {
    const grouped = new Map<string, Map<string, ApiNavigationItem[]>>();

    for (const item of pages.value ?? []) {
      const [, , sectionName, groupName] = item.path.split("/");
      if (!sectionName || !groupName) continue;

      const groups = grouped.get(sectionName) ?? new Map();
      groups.set(groupName, [...(groups.get(groupName) ?? []), item]);
      grouped.set(sectionName, groups);
    }

    return [...grouped].map(([sectionName, groups]) => ({
      title: titleCase(sectionName),
      // `UContentSearch` keys its result groups by the section path.
      path: `/api-reference/${sectionName}`,
      children: [...groups].map(([groupName, items]) => ({
        title: titleCase(groupName),
        items,
        children: items.map((item) => ({
          title: item.title,
          path: item.path,
          // Page names are schema entities, so they read as code. The `ui` rides
          // on the item rather than the component because `linkTitle` is shared
          // with the group triggers, which stay in the UI font.
          ui: { linkTitle: "font-mono text-[small]" },
          badge: item.isDeprecated
            ? {
                label: "deprecated",
                color: "error" as const,
                variant: "subtle" as const,
              }
            : undefined,
        })),
      })),
    }));
  });

  /** The same groups, flattened into the cards shown on the landing page. */
  const overviewGroups = computed(() =>
    sections.value.flatMap((section) =>
      section.children.map((group) => ({
        ...group,
        sectionTitle: section.title,
      })),
    ),
  );

  return { sections, overviewGroups };
};
