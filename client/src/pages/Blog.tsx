import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { blogPosts } from "@/data/blogData";
import { ArrowRight, Calendar, Clock, Tag, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function Blog() {
    // Update document title for SEO
    useEffect(() => {
        document.title = "Blog | BI Solutions - Advanced Analytics & AI Insights";
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Explore insights on AI, machine learning, data analytics, and business intelligence from BI Solutions experts.");
        }
    }, []);

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
            <Navbar />
            <main>
                {/* Hero Section */}
                <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-gray-50 to-white">
                    <div className="max-w-7xl mx-auto px-6 md:px-12">
                        <ScrollReveal>
                            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
                                Insights & <span className="text-gray-400">Perspectives</span>
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12">
                                Expert insights on AI, analytics, and digital transformation. Stay ahead with the latest trends and strategies.
                            </p>

                            {/* Search Bar - Added padding container to prevent border clipping */}
                            <div className="relative max-w-lg p-1">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400">
                                    <Search className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search articles, topics, trends..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-14 pl-12 pr-6 rounded-full border border-gray-200 bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-sm text-lg outline-none"
                                />
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                {/* Default View: Featured + Recent */}
                {!isSearching && (
                    <>
                        {/* Featured Post */}
                        {featuredPost && (
                            <section className="py-16 bg-white">
                                <div className="max-w-7xl mx-auto px-6 md:px-12">
                                    <ScrollReveal>
                                        <div className="mb-8">
                                            <h2 className="text-xl font-bold font-heading tracking-tight">Featured Article</h2>
                                        </div>
                                        <Link
                                            href={`/blog/${featuredPost.slug}`}
                                            className="group block"
                                        >
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                                                <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                                                    <img
                                                        src={featuredPost.featuredImage}
                                                        alt={featuredPost.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span className="px-3 py-1 bg-black text-white rounded-full text-xs font-medium">
                                                            Featured
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {featuredPost.date}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {featuredPost.readTime}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-2xl md:text-4xl font-bold font-heading group-hover:text-gray-600 transition-colors">
                                                        {featuredPost.title}
                                                    </h2>
                                                    <p className="text-gray-600 text-lg leading-relaxed">
                                                        {featuredPost.excerpt}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-black font-medium group-hover:gap-4 transition-all">
                                                        Read Article <ArrowRight className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </ScrollReveal>
                                </div>
                            </section>
                        )}

                        {/* Recent Posts Grid */}
                        {otherPosts.length > 0 && (
                            <section className="py-16 bg-gray-50">
                                <div className="max-w-7xl mx-auto px-6 md:px-12">
                                    <ScrollReveal className="mb-12">
                                        <h2 className="text-3xl font-bold font-heading">More Articles</h2>
                                    </ScrollReveal>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {otherPosts.map((post, index) => (
                                            <ScrollReveal key={post.slug} delay={index * 0.1}>
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
                                                >
                                                    <div className="aspect-[16/10] overflow-hidden">
                                                        <img
                                                            src={post.featuredImage}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                    </div>
                                                    <div className="p-6 space-y-4 flex flex-col flex-1">
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Tag className="w-3 h-3" />
                                                                {post.category}
                                                            </span>
                                                            <span>{post.readTime}</span>
                                                        </div>
                                                        <h3 className="text-xl font-bold font-heading group-hover:text-gray-600 transition-colors line-clamp-2">
                                                            {post.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                                                            {post.excerpt}
                                                        </p>
                                                    </div>
                                                </Link>
                                            </ScrollReveal>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* Search Results View */}
                {isSearching && (
                    <section className="py-16 bg-gray-50 min-h-[50vh]">
                        <div className="max-w-7xl mx-auto px-6 md:px-12">
                            <ScrollReveal className="mb-12">
                                <h2 className="text-2xl font-bold font-heading">
                                    Search Results <span className="text-gray-400 font-normal">({filteredPosts.length})</span>
                                </h2>
                            </ScrollReveal>

                            {filteredPosts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredPosts.map((post, index) => (
                                        <ScrollReveal key={post.slug} delay={index * 0.1}>
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 h-full flex flex-col"
                                            >
                                                <div className="aspect-[16/10] overflow-hidden">
                                                    <img
                                                        src={post.featuredImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="p-6 space-y-4 flex flex-col flex-1">
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Tag className="w-3 h-3" />
                                                            {post.category}
                                                            <span className="ml-2 text-gray-300">|</span>
                                                            <Calendar className="w-3 h-3 ml-2" />
                                                            {post.date}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold font-heading group-hover:text-gray-600 transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                                                        {post.excerpt}
                                                    </p>
                                                </div>
                                            </Link>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-6">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No articles found</h3>
                                    <p className="text-gray-500">
                                        We couldn't find any articles matching "{searchQuery}".<br />
                                        Try checking for typos or using different keywords.
                                    </p>
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="mt-6 text-black font-semibold hover:underline"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Newsletter CTA */}
                <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-24 bg-black text-white">
                    <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
                        <ScrollReveal>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                                Stay Ahead of the Curve
                            </h2>
                            <p className="text-gray-400 max-w-xl mx-auto mb-8">
                                Get the latest insights on AI, analytics, and business intelligence delivered to your inbox.
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors"
                            >
                                Get in Touch <ArrowRight className="w-5 h-5" />
                            </Link>
                        </ScrollReveal>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
