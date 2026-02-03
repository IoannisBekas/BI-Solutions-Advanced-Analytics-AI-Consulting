import { useRoute, Link, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getBlogPostBySlug, getRelatedPosts, blogPosts } from "@/data/blogData";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Linkedin, Twitter } from "lucide-react";
import { useEffect } from "react";

export default function BlogPost() {
    const [, params] = useRoute("/blog/:slug");
    const [, setLocation] = useLocation();
    const slug = params?.slug || "";
    const post = getBlogPostBySlug(slug);
    const relatedPosts = getRelatedPosts(slug, 2);

    // Update document title and meta for SEO
    useEffect(() => {
        if (post) {
            document.title = `${post.title} | BI Solutions Blog`;
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute("content", post.excerpt);
            }
        }
    }, [post]);

    // Handle 404
    if (!post) {
        return (
            <div className="min-h-screen bg-background font-sans text-foreground">
                <Navbar />
                <main className="pt-32 pb-24">
                    <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
                        <h1 className="text-4xl font-bold font-heading mb-4">Article Not Found</h1>
                        <p className="text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Blog
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Parse content into paragraphs and headings
    const renderContent = (content: string) => {
        const lines = content.split("\n\n");
        return lines.map((line, index) => {
            // Check for headings
            if (line.startsWith("## ")) {
                return (
                    <h2 key={index} className="text-2xl font-bold font-heading mt-10 mb-4">
                        {line.replace("## ", "")}
                    </h2>
                );
            }
            // Check for blockquotes
            if (line.startsWith("> ")) {
                return (
                    <blockquote
                        key={index}
                        className="border-l-4 border-black pl-6 py-2 my-6 bg-gray-50 rounded-r-lg"
                    >
                        <p className="text-gray-700 italic" dangerouslySetInnerHTML={{ __html: line.replace("> ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                    </blockquote>
                );
            }
            // Regular paragraphs with bold support
            return (
                <p
                    key={index}
                    className="text-gray-700 leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong class='text-black'>$1</strong>") }}
                />
            );
        });
    };

    const shareUrl = window.location.href;
    const shareText = encodeURIComponent(post.title);

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <Navbar />
            <main>
                {/* Hero */}
                <section className="pt-32 pb-12 md:pt-40 md:pb-16 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-4xl mx-auto px-6 md:px-12">
                        <ScrollReveal>
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Blog
                            </Link>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                                <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-medium">
                                    {post.category}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {post.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {post.readTime}
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <p className="text-xl text-gray-600 leading-relaxed">
                                {post.excerpt}
                            </p>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Featured Image */}
                <section className="pb-12">
                    <div className="max-w-5xl mx-auto px-6 md:px-12">
                        <ScrollReveal>
                            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Content */}
                <section className="pb-16">
                    <div className="max-w-3xl mx-auto px-6 md:px-12">
                        <ScrollReveal>
                            <article className="prose prose-lg max-w-none">
                                {renderContent(post.content)}
                            </article>

                            {/* Tags */}
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-12 pt-8 border-t border-gray-200">
                                <Tag className="w-4 h-4 text-gray-400" />
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Share */}
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <span className="text-gray-500 text-sm flex items-center gap-2">
                                    <Share2 className="w-4 h-4" /> Share:
                                </span>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"
                                >
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>


                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="py-16 bg-gray-50">
                        <div className="max-w-5xl mx-auto px-6 md:px-12">
                            <ScrollReveal className="mb-8">
                                <h2 className="text-2xl font-bold font-heading">Related Articles</h2>
                            </ScrollReveal>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {relatedPosts.map((relatedPost, index) => (
                                    <ScrollReveal key={relatedPost.slug} delay={index * 0.1}>
                                        <Link
                                            href={`/blog/${relatedPost.slug}`}
                                            className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                                        >
                                            <div className="aspect-[16/10] overflow-hidden">
                                                <img
                                                    src={relatedPost.featuredImage}
                                                    alt={relatedPost.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold font-heading group-hover:text-gray-600 transition-colors">
                                                    {relatedPost.title}
                                                </h3>
                                            </div>
                                        </Link>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-24 bg-black text-white">
                    <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
                        <ScrollReveal>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                                Need Help With Your AI Strategy?
                            </h2>
                            <p className="text-gray-400 max-w-xl mx-auto mb-8">
                                Let's discuss how we can help you leverage AI and analytics to drive business growth.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors"
                            >
                                Get in Touch
                            </Link>
                        </ScrollReveal>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
