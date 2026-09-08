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
    slug: "website-web-app-development-greece-business-needs",
    title:
      "Website & Web App Development in Greece: What Businesses Actually Need",
    excerpt:
      "What Greek businesses should expect from modern website and web app development: positioning, speed, conversion paths, and maintainable delivery.",
    date: "April 22, 2026",
    readTime: "8 min read",
    category: "Web Development",
    featuredImage:
      "/blog/article-covers-v4/06-website-web-app-development-greece-business-needs.png",
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
    slug: "ai-consulting-greek-businesses-practical-use-cases",
    title:
      "AI Consulting for Greek Businesses: Practical Use Cases Beyond Hype",
    excerpt:
      "AI consulting should help businesses choose useful workflows, not chase generic trends. Here are practical AI use cases for Greek companies.",
    date: "April 18, 2026",
    readTime: "8 min read",
    category: "AI & Technology",
    featuredImage:
      "/blog/article-covers-v4/05-ai-consulting-greek-businesses-practical-use-cases.png",
  },
];
