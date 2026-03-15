// Blog post data types and content for BI Solutions blog

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    tags: string[];
    featuredImage: string;
}

// Import blog images
import geminiImage from "@/assets/blog/gemini-import-feature.png";
import powerBISolutionsImage from "@/assets/blog/power-bi-solutions-semantic-model-review.svg";

export const blogPosts: BlogPost[] = [
    {
        slug: "google-gemini-import-ai-chats",
        title: "Google Gemini is Making it Easy to Quit ChatGPT, Claude and other LLMs",
        excerpt: "Google is testing a breakthrough 'Import AI chats' feature that allows users to migrate their entire conversation histories from rival platforms directly into Gemini.",
        content: `For over a year, many power users have felt "stuck." Whether you're a ChatGPT Plus subscriber, a Claude enthusiast, or a Copilot advocate, your AI assistant isn't just a tool anymore—it's a repository. It holds your workflows, your creative history, and months of personalized context.

Switching meant starting from zero. Until now.

Google is currently testing a breakthrough feature: "Import AI chats." This tool, spotted in early beta builds, allows users to migrate their entire conversation histories from rival platforms directly into Gemini. It's a bold move that directly attacks the "ecosystem lock-in" that has defined the AI wars so far.

## How It Works

According to early reports from PCMag and TestingCatalog, the process is surprisingly straightforward:

**The Entry Point:** A new option in Gemini's attachment menu (the + icon).

**The Process:** You download your data export from a rival service (like ChatGPT's .zip or .json files) and upload it to Gemini.

**The Result:** Your past threads are ingested, potentially allowing Gemini to maintain the context of your previous work without a "cold start."

## Nano Banana Pro Model

Google is also supercharging its creative capabilities with the Nano Banana Pro model:

**Print-Ready Quality:** Users have spotted new 2K and 4K resolution download options.

**Professional Focus:** The 4K setting is specifically labeled "Best for print," signaling that Gemini is moving from "casual AI sketches" to professional asset production.

## The Likeness Feature

With great data comes great responsibility. Google is simultaneously testing a "Likeness" feature. While details are still emerging, it appears linked to video verification tools—likely a proactive step to help users identify and report unauthorized AI-generated content using their face or voice.

## How We See Google's Move

In the early days of the web, we fought for email portability. Then it was phone numbers. Now, it's Context Portability. By removing the "tedium barrier," Google isn't just offering a better model; they are offering a better on-ramp.

If users can take their "AI brain" with them, the platform with the best integrations (Google Workspace, Android, etc.) wins. (Check <a href="https://www.linkedin.com/posts/george-soloupis_develop-an-on-device-rag-system-powered-by-activity-7386649277466415104-zyjk?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAABUEkeIBHVtmjVCuKFACyiq532vpscSqTdI" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Georgios Soloupis work in on-device RAG systems here</a>).

> **Privacy Note:** If you do test this, remember that imported data is recorded in your Gemini Activity. Always scrub sensitive API keys or personal identifiers before migrating large datasets!`,
        author: "BI Solutions",
        date: "February 3, 2026",
        readTime: "4 min read",
        category: "AI & Technology",
        tags: ["Google Gemini", "ChatGPT", "Claude", "AI", "LLM", "Machine Learning"],
        featuredImage: geminiImage,
    },
    {
        slug: "power-bi-solutions-semantic-model-analysis-workspace",
        title: "Why Power BI Solutions Deserves a Dedicated Semantic Model Workspace",
        excerpt: "Power BI Solutions brings TMDL review, semantic model diagnostics, AI guidance, and product-specific authentication into a focused workspace hosted directly on the BI Solutions domain.",
        content: `Most Power BI model reviews still happen in fragments. A consultant opens a file in one tool, documents issues in another, sends optimization notes over email, and then jumps into a separate chat window to explain what should change. The result is usually slower feedback, inconsistent recommendations, and too much context switching for teams that just want a reliable path from model definition to production readiness.

Power BI Solutions was built to close that gap. Instead of treating semantic model analysis as an add-on service bolted onto a marketing site, the product creates a dedicated workspace where TMDL review, model diagnostics, AI-assisted guidance, and product-specific authentication all live under the BI Solutions domain.

## A better starting point for semantic model analysis

TMDL is becoming a practical way to inspect Power BI semantic models as structured artifacts rather than opaque files. That matters because serious review work depends on seeing the tables, measures, relationships, and metadata in a form that can be parsed, checked, and discussed clearly.

Inside Power BI Solutions, teams can upload tabular model definitions and move directly into review mode. That creates a much cleaner workflow for spotting naming issues, structural inconsistencies, documentation gaps, and performance-sensitive modeling choices before they spread downstream into dashboards and business logic.

## Diagnostics without losing the model context

One of the biggest problems with conventional review workflows is that the context gets lost after the first pass. Someone flags a weak measure name, another person questions a relationship, and a third teammate asks how a recommendation affects report behavior. Soon the analysis is no longer attached to the model itself.

Power BI Solutions keeps the diagnostic flow anchored to the uploaded semantic model. Review output, recommendations, and follow-up questions all stay in the same workspace, which makes it easier to move from issue discovery to decision-making without recreating context at every step.

> **The product goal is simple:** turn semantic model review into a repeatable product workflow, not an improvised chain of disconnected tools.

## AI guidance that is actually grounded in the model

Generic AI assistants are useful for brainstorming, but model optimization requires much tighter context. Teams do not want to re-explain their schema every time they ask about DAX patterns, naming conventions, or maintainability tradeoffs.

Power BI Solutions adds AI-assisted guidance inside the analysis workflow itself. That means users can ask targeted follow-up questions after a TMDL upload, use recommendations as a starting point, and keep the conversation centered on the actual model under review. The value is not just that AI is present, but that it operates within the product context instead of outside it.

## Product-specific authentication matters

Another important design decision is the authentication boundary. Power BI Solutions lives under the BI Solutions brand and domain, but it keeps its own product-specific access flow. That separation matters for roadmap flexibility, user management, and product state.

In practice, it means BI Solutions can present the product through the main site while still routing users into a dedicated workspace at <a href="/power-bi-solutions/" class="text-blue-600 hover:underline">/power-bi-solutions/</a>. Discovery stays unified at the brand level, while sessions, uploads, and analysis workflows remain isolated inside the product experience where they belong.

## From review service to scalable product workflow

This is the real shift behind Power BI Solutions. The product is not just describing semantic model best practices; it is operationalizing them. A structured upload flow, integrated diagnostics, AI guidance, and dedicated authentication make the experience more consistent for teams that need repeatable review rather than one-off commentary.

For BI leaders, that means faster feedback loops. For analysts and developers, it means fewer handoffs and less ambiguity. And for organizations trying to raise the quality of their Power BI estate, it creates a clear home for semantic model analysis inside the broader BI Solutions ecosystem.

Power BI models do not fail because teams lack opinions. They fail because review, optimization, and decision-making are scattered. Power BI Solutions brings those steps together into one workspace and gives semantic model analysis the dedicated product surface it has been missing.`,
        author: "BI Solutions",
        date: "March 15, 2026",
        readTime: "5 min read",
        category: "Power BI & Analytics",
        tags: ["Power BI", "Semantic Models", "TMDL", "Analytics Engineering", "AI", "Business Intelligence"],
        featuredImage: powerBISolutionsImage,
    },
];

// Helper function to get a blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
    return blogPosts.find((post) => post.slug === slug);
}

// Helper function to get related posts (same category, excluding current)
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
    const currentPost = getBlogPostBySlug(currentSlug);
    if (!currentPost) return [];

    return blogPosts
        .filter((post) => post.slug !== currentSlug && post.category === currentPost.category)
        .slice(0, limit);
}
