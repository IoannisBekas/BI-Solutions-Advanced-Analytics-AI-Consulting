import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const posts = [
  {
    title: "The Future of Digital Design in 2025",
    date: "Oct 24, 2025",
    excerpt: "Exploring the intersection of AI, spatial computing, and minimalist aesthetics in the next generation of web interfaces.",
    category: "Design"
  },
  {
    title: "Why Performance Matters More Than Ever",
    date: "Nov 02, 2025",
    excerpt: "Core Web Vitals are changing. Here's what you need to know about optimizing your React applications for the modern web.",
    category: "Development"
  },
  {
    title: "Building Trust Through Typography",
    date: "Nov 15, 2025",
    excerpt: "How type choices influence user perception and brand credibility in professional service sectors.",
    category: "Branding"
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <ScrollReveal>
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-8">Insights</h1>
            <p className="text-xl text-gray-600 max-w-2xl mb-20">
              Thoughts on design, technology, and the future of digital business.
            </p>
          </ScrollReveal>

          <div className="space-y-12">
            {posts.map((post, index) => (
              <ScrollReveal key={index} delay={index * 0.1}>
                <article className="group border-b border-gray-100 pb-12">
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="font-semibold text-black uppercase tracking-wider">{post.category}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{post.date}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 group-hover:text-gray-600 transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6 max-w-2xl">
                    {post.excerpt}
                  </p>
                  <Button variant="link" className="p-0 h-auto text-black font-semibold text-base hover:no-underline group-hover:translate-x-2 transition-transform">
                    Read Article →
                  </Button>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
