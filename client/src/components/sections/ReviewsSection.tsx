import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Star } from "lucide-react";

interface Review {
    id: number;
    author: string;
    rating: number;
    text: string;
    date: string;
    link: string;
}

const reviews: Review[] = [
    {
        id: 1,
        author: "ΒΑΣΙΛΗΣ ΚΑΛΙΤΣΟΥΝΑΚΗΣ",
        rating: 5,
        text: "I’ve been working with Yannis from BI Solutions for the past three years, and I will always prefer his consultancy services in data and AI because he listens very carefully to our details and then executes extremely fast. He has the mindset of a true professional who always delivers a solution to your problem. He may be slightly more expensive than average, but in terms of value added, he is truly unique.",
        date: "Dec 2024",
        link: "https://maps.app.goo.gl/xxwTZEA9bZATfEmJ7"
    },
    {
        id: 2,
        author: "Viktoriia Bybyk",
        rating: 5,
        text: "I just want to highlight Ioannis for his knowledge and professionalism. It was very easy to communicate with him, he is very responsible and attentive to the details. He helped me with data analysis, explaining every steps of how to proceed. He definitely has enormous amount of knowledge and skillset to solve any type of data that he wants to share with his students... Was great pleasure to cooperate with him.",
        date: "1 year ago",
        link: "https://maps.app.goo.gl/571qzc3kzVF6F3Eu8"
    },
    {
        id: 3,
        author: "theodore anton",
        rating: 5,
        text: "I’ve been working with Ioannis the last months to get his advice on various data engineering challenges I faced. He’s incredibly efficient, respects our company’s data privacy, and consistently delivers fast, high-quality results. Even though his rates are premium, the clarity and impact he brings to reporting and decision-making make his support absolutely worth it. Highly recommended.",
        date: "2 months ago",
        link: "https://maps.app.goo.gl/LJnsgzhmqGjeHQPE7"
    }
];

export function ReviewsSection() {
    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <ScrollReveal className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
                        Client Reviews
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        See what our clients say about our data and AI consultancy services.
                    </p>
                </ScrollReveal>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <ScrollReveal key={review.id} delay={index * 0.1}>
                            <a
                                href={review.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block h-full"
                            >
                                <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:bg-card/80 transition-colors duration-300">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex space-x-1">
                                                {[...Array(review.rating)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                ))}
                                            </div>
                                            <span className="text-xs text-muted-foreground">{review.date}</span>
                                        </div>
                                        <CardTitle className="text-lg font-bold">{review.author}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            "{review.text}"
                                        </p>
                                    </CardContent>
                                </Card>
                            </a>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
