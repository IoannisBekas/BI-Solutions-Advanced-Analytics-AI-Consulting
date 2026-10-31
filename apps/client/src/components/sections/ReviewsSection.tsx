import { useEffect, useState, type CSSProperties } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Star } from "lucide-react";
import { useLocale } from "@/i18n/LocaleProvider";

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
        id: 9,
        author: "ATHANASIOS",
        rating: 5,
        text: "I needed Mr. Bekas to guide me through data analysis, the setup of my models, and the development of algorithms (specifically DEA and AHP) to draw conclusions regarding the efficiency of certain hospitals in our country. We have 3 hours of sessions per week; although the cost made me hesitate a bit at first, I soon realized that the quality and pace of the instruction are 100% worth it. He covers a significant portion of the material in a short amount of time, and with great precision. I am completely satisfied.",
        date: "2023-11-25",
        link: "https://share.google/CPYkT1I5n5lTqU1aZ",
        source: "google"
    },
    {
        id: 8,
        author: "Michail Karnas",
        rating: 5,
        text: "What you receive from Yannis is top-tier data and AI consultancy services at a fraction of the market cost. He possesses genuine, deep problem-solving skills and can effortlessly navigate complex or unfamiliar challenges. The quality of his delivery, structured project approach, and the sheer value he adds truly make him stand out. Highly recommended!",
        date: "2026-06-26",
        link: "https://share.google/2ASK8pivJZfVdbfXh",
        source: "google"
    },
    {
        id: 1,
        author: "ΒΑΣΙΛΗΣ ΚΑΛΙΤΣΟΥΝΑΚΗΣ",
        rating: 5,
        text: "I've been working with Yannis from BI Solutions for the past three years, and I will always prefer his consultancy services in data and AI because he listens very carefully to our details and then executes extremely fast. He has the mindset of a true professional who always delivers a solution to your problem. He may be slightly more expensive than average, but in terms of value added, he is truly unique.",
        date: "2025-12-28",
        link: "https://maps.app.goo.gl/xxwTZEA9bZATfEmJ7",
        source: "google"
    },
    {
        id: 2,
        author: "Viktoriia Bybyk",
        rating: 5,
        text: "I just want to highlight Ioannis for his knowledge and professionalism. It was very easy to communicate with him, he is very responsible and attentive to the details. He helped me with data analysis, explaining every steps of how to proceed. He definitely has enormous amount of knowledge and skillset to solve any type of data that he wants to share with his students... Was great pleasure to cooperate with him.",
        date: "2024-09-20",
        link: "https://maps.app.goo.gl/571qzc3kzVF6F3Eu8",
        source: "google"
    },
    {
        id: 3,
        author: "theodore anton",
        rating: 5,
        text: "I've been working with Ioannis the last months to get his advice on various data engineering challenges I faced. He's incredibly efficient, respects our company's data privacy, and consistently delivers fast, high-quality results. Even though his rates are premium, the clarity and impact he brings to reporting and decision-making make his support absolutely worth it. Highly recommended.",
        date: "2025-09-30",
        link: "https://maps.app.goo.gl/LJnsgzhmqGjeHQPE7",
        source: "google"
    },
    {
        id: 4,
        author: "Vasilis Antonakakis",
        rating: 5,
        text: "I had the pleasure of working with Yannis on the automation and analytics transformation of our accounting firm. From the very beginning, he demonstrated deep expertise in data engineering, business intelligence, and advanced analytics, combined with a strong understanding of real operational needs. I strongly recommend his services to any business looking to modernize its processes through analytics and AI.",
        date: "2025-12-29",
        link: "https://maps.app.goo.gl/dRfe4tXaRSymdoxz5",
        source: "google"
    },
    {
        id: 5,
        author: "Κώστας Πολυζώνης",
        rating: 5,
        text: "Worked with Yannis on building integrated data management and reporting systems. His expertise in Business Analytics, Database Development, and Information Management helped automate reliable KPIs for Finance and surgical parts Logistics. I appreciated his structured project management approach and focus on scalable, high-quality solutions.",
        date: "2025-06",
        link: "https://www.linkedin.com/services/page/281b263286b3198352/",
        source: "linkedin"
    },
    {
        id: 6,
        author: "Arunav Mallik",
        rating: 5,
        text: "Ioannis was extremely professional, very receptive to my feedback and delivered the project on time. I appreciated his timely feedback and quality of delivery. Highly recommend Ionnis and his services.",
        date: "2025-04",
        link: "https://www.linkedin.com/services/page/281b263286b3198352/",
        source: "linkedin"
    },
    {
        id: 7,
        author: "Michalis Diakantonis",
        rating: 5,
        text: "As General Director of the Hellenic Institute of Cultural Diplomacy, we chose Ioannis Bekas for his outstanding contributions in statistical analysis, data modeling, and survey design. During his tenure back in 2019, he developed robust data workflows and Excel-integrated data collection systems that significantly improved our evaluation processes. He additionally managed relational databases and automated reporting pipelines, ensuring accurate, timely insights for project monitoring.",
        date: "2025-04",
        link: "https://www.linkedin.com/services/page/281b263286b3198352/",
        source: "linkedin"
    }
];

reviews.sort((a, b) => b.date.localeCompare(a.date));

const REVIEW_ROTATION_INTERVAL_MS = 4500;

export function ReviewsSection() {
    const { locale } = useLocale();
    const dateFormatter = new Intl.DateTimeFormat(locale, {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [isPaused, setIsPaused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeReviewHeight, setActiveReviewHeight] = useState<number>();

    useEffect(() => {
        if (!carouselApi) return;
        const sync = () => setSelectedIndex(carouselApi.selectedScrollSnap());
        sync();
        carouselApi.on("select", sync);
        return () => {
            carouselApi.off("select", sync);
        };
    }, [carouselApi]);

    useEffect(() => {
        const slide = carouselApi?.slideNodes()[selectedIndex];
        if (!slide) return;
        const syncHeight = () => setActiveReviewHeight(Math.ceil(slide.getBoundingClientRect().height));
        const observer = new ResizeObserver(syncHeight);
        observer.observe(slide);
        syncHeight();
        return () => observer.disconnect();
    }, [carouselApi, selectedIndex]);

    useEffect(() => {
        if (!carouselApi || isPaused) {
            return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) {
            return;
        }

        const rotationTimer = window.setInterval(() => {
            carouselApi.scrollNext();
        }, REVIEW_ROTATION_INTERVAL_MS);

        return () => window.clearInterval(rotationTimer);
    }, [carouselApi, isPaused]);

    return (
        <section className="section-space bg-background">
            <div className="site-container">
                <ScrollReveal width="100%" className="mb-10">
                    <h2 className="section-title text-foreground mb-4 break-words">
                        Client Reviews
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        See what our clients say about our data and AI consultancy services.
                    </p>
                </ScrollReveal>

                <div
                    className="relative"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                >
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        setApi={setCarouselApi}
                        className="w-full"
                    >
                        <CarouselContent
                            className="-ml-6 items-start md:items-stretch"
                            viewportClassName="review-carousel__viewport"
                            viewportStyle={{ "--review-height": activeReviewHeight ? `${activeReviewHeight}px` : undefined } as CSSProperties}
                        >
                            {reviews.map((review) => (
                                <CarouselItem key={review.id} className="pl-6 md:basis-1/2 xl:basis-1/3">
                                    <div className="py-2 md:h-full">
                                        <div
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to open the ${review.source === "linkedin" ? "LinkedIn" : "Google"} Review?`)) {
                                                    window.open(review.link, "_blank", "noopener,noreferrer");
                                                }
                                            }}
                                            className="block h-full cursor-pointer"
                                        >
                                            <Card className="surface-card--interactive md:h-full">
                                                <CardHeader>
                                                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mb-2">
                                                        <div className="flex shrink-0 space-x-1">
                                                            {[...Array(review.rating)].map((_, i) => (
                                                                <Star key={i} className="w-4 h-4 text-gray-950 fill-gray-950" />
                                                            ))}
                                                        </div>
                                                        <time dateTime={review.date} className="whitespace-nowrap text-xs text-muted-foreground" translate="no">
                                                            {dateFormatter.format(new Date(review.date))}
                                                        </time>
                                                    </div>
                                                    <CardTitle className="text-lg font-bold uppercase" translate="no">{review.author}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-muted-foreground text-base leading-relaxed" translate="no">
                                                        "{review.text}"
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                            <CarouselPrevious className="static translate-y-0" />
                            <div className="order-last flex basis-full justify-center gap-2 sm:order-none sm:basis-auto" role="tablist" aria-label="Reviews">
                                {reviews.map((review, index) => (
                                    <button
                                        key={review.id}
                                        type="button"
                                        role="tab"
                                        aria-label={`Review ${index + 1} of ${reviews.length}`}
                                        aria-selected={index === selectedIndex}
                                        onClick={() => carouselApi?.scrollTo(index)}
                                        className="flex h-11 w-6 items-center justify-center"
                                    >
                                        <span
                                            className={
                                                index === selectedIndex
                                                    ? "block h-2 w-6 rounded-full bg-gray-900 transition-all"
                                                    : "block h-2 w-2 rounded-full bg-gray-300 transition-all"
                                            }
                                        />
                                    </button>
                                ))}
                            </div>
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
