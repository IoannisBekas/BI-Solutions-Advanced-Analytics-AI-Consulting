import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Newspaper,
  Share2,
  Linkedin,
  Twitter,
  Tag,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Seo } from "@/components/seo/Seo";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PublicPageHero } from "@/components/sections/PublicPageHero";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, getRelatedPosts } from "@/data/blogData";

function renderRichText(line: string) {
  return line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function renderContent(content: string) {
  const sections = content.split("\n\n");

  return sections.map((section, index) => {
    if (section.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="mt-10 text-2xl font-bold font-heading tracking-tight text-gray-950"
        >
          {section.replace("## ", "")}
        </h2>
      );
    }

    if (section.startsWith("> ")) {
      return (
        <blockquote
          key={index}
          className="my-8 rounded-[1.5rem] border border-gray-200 bg-gray-50 px-6 py-5"
        >
          <p
            className="text-base leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: renderRichText(section.replace("> ", "")) }}
          />
        </blockquote>
      );
    }

    return (
      <p
        key={index}
        className="mt-5 text-base leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: renderRichText(section) }}
      />
    );
  });
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const post = getBlogPostBySlug(slug);
  const relatedPosts = getRelatedPosts(slug, 2);

  if (!post) {
    return (
      <div className="min-h-screen bg-background font-sans text-foreground">
        <Navbar />
        <main className="pt-32 pb-20">
          <PublicPageHero
            icon={Newspaper}
            eyebrow="Blog"
            title="Article not found."
            description="The article you are looking for is not available at this route."
            actions={
              <Button asChild className="rounded-full bg-black px-8 text-white hover:bg-gray-800">
                <Link href="/blog">Back to blog</Link>
              </Button>
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const shareUrl = window.location.href;
  const shareText = encodeURIComponent(post.title);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.featuredImage}
        type="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: `https://www.bisolutions.group${post.featuredImage}`,
          author: {
            "@type": "Organization",
            name: "BI Solutions",
            url: "https://www.bisolutions.group",
          },
          publisher: {
            "@type": "Organization",
            name: "BI Solutions",
            logo: {
              "@type": "ImageObject",
              url: "https://www.bisolutions.group/bi-solutions-logo.png",
            },
          },
          datePublished: new Date(post.date).toISOString(),
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://www.bisolutions.group/blog/${post.slug}`,
          },
        }}
      />
      <Navbar />

      <main className="pt-32 pb-20">
        <PublicPageHero
          icon={Newspaper}
          eyebrow={post.category}
          title={post.title}
          description={post.excerpt}
          actions={
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
          }
          footer={
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {post.author}
              </span>
            </div>
          }
        />

        <section className="mx-auto max-w-5xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-2xl shadow-black/[0.06]">
              <div className="aspect-[16/9] bg-gray-100">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section className="mx-auto mt-12 max-w-4xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <article className="rounded-[2rem] border border-gray-200 bg-white px-6 py-8 shadow-xl shadow-black/[0.04] md:px-8">
              <div className="prose prose-gray max-w-none">
                {renderContent(post.content)}
              </div>

              <div className="mt-10 border-t border-gray-100 pt-6">
                <div className="flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <Share2 className="h-4 w-4" />
                    Share article
                  </span>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-black hover:text-white"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-black hover:text-white"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>
          </ScrollReveal>
        </section>

        {relatedPosts.length > 0 ? (
          <section className="mx-auto mt-16 max-w-5xl px-6 md:px-12">
            <ScrollReveal className="max-w-3xl" width="100%">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Related articles
              </p>
              <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
                Continue with adjacent reads.
              </h2>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {relatedPosts.map((relatedPost, index) => (
                <ScrollReveal key={relatedPost.slug} delay={index * 0.08} width="100%">
                  <Link href={`/blog/${relatedPost.slug}`} className="group block h-full">
                    <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl shadow-black/[0.04]">
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="px-6 py-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                          {relatedPost.category}
                        </p>
                        <h3 className="mt-3 text-2xl font-bold font-heading tracking-tight text-gray-950 transition-colors group-hover:text-gray-700">
                          {relatedPost.title}
                        </h3>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mx-auto mt-16 max-w-7xl px-6 md:px-12">
          <ScrollReveal width="100%">
            <div className="rounded-[2rem] bg-gray-950 px-8 py-10 text-white shadow-2xl shadow-black/[0.14] md:px-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Need help applying this?
              </p>
              <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                    Move from the article into a scoped analytics or AI engagement.
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-gray-300">
                    We can turn the idea into architecture, a reporting workflow,
                    a product surface, or an implementation plan tailored to
                    your operating environment.
                  </p>
                </div>
                <Button asChild className="rounded-full bg-white px-8 text-black hover:bg-gray-100">
                  <Link href="/contact">Get in touch</Link>
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
