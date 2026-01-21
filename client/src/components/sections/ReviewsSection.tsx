import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Star } from "lucide-react";

interface Review {
    id: number;
    author: string;
    rating: number;
    text: string;
    date: string;
    link: string;
    source: "google" | "linkedin";
}

const reviews: Review[] = [
    {
        id: 1,
        author: "ΒΑΣΙΛΗΣ ΚΑΛΙΤΣΟΥΝΑΚΗΣ",
        rating: 5,
        text: "I've been working with Yannis from BI Solutions for the past three years, and I will always prefer his consultancy services in data and AI because he listens very carefully to our details and then executes extremely fast. He has the mindset of a true professional who always delivers a solution to your problem. He may be slightly more expensive than average, but in terms of value added, he is truly unique.",
        date: "Dec 2024",
        link: "https://maps.app.goo.gl/xxwTZEA9bZATfEmJ7",
        source: "google"
    },
    {
        id: 2,
        author: "Viktoriia Bybyk",
        rating: 5,
        text: "I just want to highlight Ioannis for his knowledge and professionalism. It was very easy to communicate with him, he is very responsible and attentive to the details. He helped me with data analysis, explaining every steps of how to proceed. He definitely has enormous amount of knowledge and skillset to solve any type of data that he wants to share with his students... Was great pleasure to cooperate with him.",
        date: "1 year ago",
        link: "https://maps.app.goo.gl/571qzc3kzVF6F3Eu8",
        source: "google"
    },
    {
        id: 3,
        author: "theodore anton",
        rating: 5,
        text: "I've been working with Ioannis the last months to get his advice on various data engineering challenges I faced. He's incredibly efficient, respects our company's data privacy, and consistently delivers fast, high-quality results. Even though his rates are premium, the clarity and impact he brings to reporting and decision-making make his support absolutely worth it. Highly recommended.",
        date: "2 months ago",
        link: "https://maps.app.goo.gl/LJnsgzhmqGjeHQPE7",
        source: "google"
    },
    {
        id: 4,
        author: "Vasilis Antonakakis",
        rating: 5,
        text: "I had the pleasure of working with Yannis on the automation and analytics transformation of our accounting firm. From the very beginning, he demonstrated deep expertise in data engineering, business intelligence, and advanced analytics, combined with a strong understanding of real operational needs. I strongly recommend his services to any business looking to modernize its processes through analytics and AI.",
        date: "Dec 2024",
        link: "https://maps.app.goo.gl/dRfe4tXaRSymdoxz5",
        source: "google"
    },
    {
        id: 5,
        author: "Κώστας Πολυζώνης",
        rating: 5,
        text: "Worked with Yannis on building integrated data management and reporting systems. His expertise in Business Analytics, Database Development, and Information Management helped automate reliable KPIs for Finance and surgical parts Logistics. I appreciated his structured project management approach and focus on scalable, high-quality solutions.",
        date: "June 2025",
        link: "https://www.linkedin.com/services/page/281b263286b3198352/",
        source: "linkedin"
    },
    {
        id: 6,
        author: "Arunav Mallik",
        rating: 5,
        text: "Ioannis was extremely professional, very receptive to my feedback and delivered the project on time. I appreciated his timely feedback and quality of delivery. Highly recommend Ionnis and his services.",
        date: "April 2025",
        link: "https://www.linkedin.com/services/page/281b263286b3198352/",
        source: "linkedin"
    },
    {
        id: 7,
        author: "Michalis Diakantonis",
        rating: 5,
        text: "As General Director of the Hellenic Institute of Cultural Diplomacy, we chose Ioannis Bekas for his outstanding contributions in statistical analysis, data modeling, and survey design. During his tenure back in 2019, he developed robust data workflows and Excel-integrated data collection systems that significantly improved our evaluation processes. He additionally managed relational databases and automated reporting pipelines, ensuring accurate, timely insights for project monitoring.",
        date: "April 2025",
        link: "https://www.linkedin.com/services/page/281b263286b3198352/",
        source: "linkedin"
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

                <div className="relative px-8 md:px-12">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent>
                            {reviews.map((review, index) => (
                                <CarouselItem key={review.id} className="md:basis-1/3 lg:basis-1/4 pl-6">
                                    <div className="h-full py-2">
                                        <div
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to open the ${review.source === "linkedin" ? "LinkedIn" : "Google"} Review?`)) {
                                                    window.open(review.link, "_blank", "noopener,noreferrer");
                                                }
                                            }}
                                            className="block h-full cursor-pointer"
                                        >
                                            <Card className="h-full bg-card/50 backdrop-blur border-border/50 hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                                <CardHeader>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex space-x-1">
                                                            {[...Array(review.rating)].map((_, i) => (
                                                                <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">{review.date}</span>
                                                    </div>
                                                    <CardTitle className="text-lg font-bold uppercase">{review.author}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                                        "{review.text}"
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="-left-4 md:-left-12" />
                        <CarouselNext className="-right-4 md:-right-12" />
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
