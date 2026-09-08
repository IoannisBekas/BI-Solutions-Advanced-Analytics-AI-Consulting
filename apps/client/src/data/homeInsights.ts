export interface HomeInsight {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  featuredImage: string;
}

/** Curated homepage cards; full article bodies stay in the blog route chunk. */
export const homeInsights: HomeInsight[] = [
  {
    slug: "dashboard-requirements-before-power-bi-build",
    title:
      "Dashboard Requirements: What to Define Before a Power BI Build",
    excerpt:
      "Strong dashboards start before design. Define decisions, users, KPIs, sources, refresh needs, and ownership before building visuals.",
    date: "April 22, 2026",
    readTime: "6 min read",
    category: "BI & Analytics",
    featuredImage:
      "/blog/article-covers-v4/03-dashboard-requirements-before-power-bi-build.png",
  },
  {
    slug: "power-bi-consulting-dashboards-business-infrastructure",
    title: "BI Consulting: When Dashboards Become Business Infrastructure",
    excerpt:
      "Business intelligence work becomes strategic when dashboards stop being isolated reports and start operating as trusted business infrastructure.",
    date: "April 21, 2026",
    readTime: "8 min read",
    category: "BI & Analytics",
    featuredImage:
      "/blog/article-covers-v4/01-power-bi-consulting-dashboards-business-infrastructure.png",
  },
  {
    slug: "semantic-modeling-power-bi-clean-models",
    title:
      "Semantic Modeling in Power BI: Why Clean Models Matter More Than Pretty Reports",
    excerpt:
      "Pretty dashboards can hide weak models. Clean semantic modeling is what makes Power BI reports faster, clearer, and easier to govern.",
    date: "April 20, 2026",
    readTime: "7 min read",
    category: "BI & Analytics",
    featuredImage:
      "/blog/article-covers-v4/02-semantic-modeling-power-bi-clean-models.png",
  },
  {
    slug: "ai-document-workflows-professional-services",
    title:
      "AI Document Workflows for Professional Services",
    excerpt:
      "Professional-service teams can use AI to summarize, classify, draft, and review documents when the workflow includes human control and privacy rules.",
    date: "July 11, 2026",
    readTime: "5 min read",
    category: "AI & Technology",
    featuredImage:
      "/blog/article-covers-v4/13-ai-document-workflows-professional-services.png",
  },
];
