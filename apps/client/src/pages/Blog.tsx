import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Calendar,
  Clock,
  Newspaper,
  Search,
  Tag,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ArticleVisual } from "@/components/blog/ArticleVisual";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/data/blogData";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const query = searchQuery.toLowerCase();

    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const isSearching = searchQuery.length > 0;
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title="Blog"
        description="Explore BI Solutions insights on AI, analytics, business intelligence, machine learning, and digital transformation."
        path="/blog"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "BI Solutions Blog",
          url: "https://www.bisolutions.group/blog",
        }}
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={Newspaper}
          eyebrow="Insights and perspectives"
          title="Editorial notes on AI, analytics, and digital transformation."
          description="This section keeps a more editorial rhythm than the main site, but it now follows the same BI Solutions shell: clear hierarchy, tighter spacing, and stronger CTA structure."
          footer={
            <div className="max-w-xl">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Search articles
              </label>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles, topics, and workflows..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-14 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-6 text-base outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          }
        />

        {!isSearching ? (
          <>
            {featuredPost ? (
              <section className="mx-auto max-w-7xl px-6 md:px-12">
                <ScrollReveal className="max-w-3xl" width="100%">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Featured article
                  </p>
                  <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                    A highlighted read from the BI Solutions editorial stream.
                  </h2>
                </ScrollReveal>

                <ScrollReveal className="mt-10" width="100%">
                  <Link href={`/blog/${featuredPost.slug}`} className="group block">
                    <article className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-black/[0.06]">
                      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                          <ArticleVisual
                            post={featuredPost}
                            className="transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>

                        <div className="flex flex-col justify-between px-6 py-8 md:px-8">
                          <div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                                Featured
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {featuredPost.date}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {featuredPost.readTime}
                              </span>
                            </div>
                            <h3 className="mt-5 text-3xl font-bold font-heading tracking-tight text-gray-950 transition-colors group-hover:text-gray-700 md:text-4xl">
                              {featuredPost.title}
                            </h3>
                            <p className="mt-5 text-base leading-relaxed text-gray-600">
                              {featuredPost.excerpt}
                            </p>
                          </div>

                          <div className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-black">
                            Read article
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              </section>
            ) : null}

            {otherPosts.length > 0 ? (
              <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
                <ScrollReveal className="max-w-3xl" width="100%">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                    More articles
                  </p>
                  <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                    Short reads on product, AI, and analytics delivery.
                  </h2>
                </ScrollReveal>

                <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {otherPosts.map((post, index) => (
                    <ScrollReveal key={post.slug} delay={index * 0.06} width="100%">
                      <Link href={`/blog/${post.slug}`} className="group block h-full">
                        <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-black/[0.04]">
                          <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                            <ArticleVisual
                              post={post}
                              className="transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex flex-1 flex-col px-6 py-6">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {post.category}
                              </span>
                              <span>{post.readTime}</span>
                            </div>
                            <h3 className="mt-4 text-2xl font-bold font-heading tracking-tight text-gray-950 transition-colors group-hover:text-gray-700">
                              {post.title}
                            </h3>
                            <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                              {post.excerpt}
                            </p>
                            <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-black">
                              Open article
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </article>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="mx-auto max-w-7xl px-6 md:px-12">
            <ScrollReveal className="max-w-3xl" width="100%">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Search results
              </p>
              <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                {filteredPosts.length} result{filteredPosts.length === 1 ? "" : "s"} for "{searchQuery}"
              </h2>
            </ScrollReveal>

            {filteredPosts.length > 0 ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post, index) => (
                  <ScrollReveal key={post.slug} delay={index * 0.06} width="100%">
                    <Link href={`/blog/${post.slug}`} className="group block h-full">
                      <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-black/[0.04]">
                        <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                          <ArticleVisual
                            post={post}
                            className="transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex flex-1 flex-col px-6 py-6">
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {post.category}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {post.date}
                            </span>
                          </div>
                          <h3 className="mt-4 text-2xl font-bold font-heading tracking-tight text-gray-950 transition-colors group-hover:text-gray-700">
                            {post.title}
                          </h3>
                          <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">
                            {post.excerpt}
                          </p>
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <ScrollReveal className="mt-10" width="100%">
                <div className="rounded-[2rem] border border-gray-200 bg-white px-8 py-12 text-center shadow-xl shadow-black/[0.04]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold font-heading tracking-tight text-gray-950">
                    No articles found
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-gray-600">
                    Try a broader keyword or clear the search to return to the full list.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-6 inline-flex rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Clear search
                  </button>
                </div>
              </ScrollReveal>
            )}
          </section>
        )}

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] bg-gray-950 px-8 py-10 text-white shadow-2xl shadow-black/[0.14] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Want to discuss the practical side?
              </p>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Turn the ideas into a scoped BI, analytics, or AI workflow.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    If a post maps to a real delivery problem in your team, we
                    can move that conversation into concrete architecture,
                    product, or implementation work.
                  </p>
                </div>
                <Button asChild className="rounded-full bg-white px-8 text-black hover:bg-gray-100">
                  <Link href="/contact">
                    Get in touch
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
