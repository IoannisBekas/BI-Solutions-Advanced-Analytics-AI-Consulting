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
