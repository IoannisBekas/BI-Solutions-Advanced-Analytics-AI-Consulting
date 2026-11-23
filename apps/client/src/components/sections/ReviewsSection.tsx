import { useEffect, useState, type CSSProperties } from "react";
import { ArrowUpRight, Star } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
  link: string;
  source: "google" | "linkedin";
}

const consultingReviews: Review[] = [
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
    id: 7,
    author: "Michalis Diakantonis",
    rating: 5,
    text: "As General Director of the Hellenic Institute of Cultural Diplomacy, we chose Ioannis Bekas for his outstanding contributions in statistical analysis, data modeling, and survey design. During his tenure back in 2019, he developed robust data workflows and Excel-integrated data collection systems that significantly improved our evaluation processes. He additionally managed relational databases and automated reporting pipelines, ensuring accurate, timely insights for project monitoring.",
    date: "2025-04",
    link: "https://www.linkedin.com/services/page/281b263286b3198352/",
    source: "linkedin"
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
    id: 6,
    author: "Arunav Mallik",
    rating: 5,
    text: "Ioannis was extremely professional, very receptive to my feedback and delivered the project on time. I appreciated his timely feedback and quality of delivery. Highly recommend Ionnis and his services.",
    date: "2025-04",
    link: "https://www.linkedin.com/services/page/281b263286b3198352/",
    source: "linkedin"
  },
];

const mentorshipReviews: Review[] = [
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
    id: 9,
    author: "ATHANASIOS",
    rating: 5,
    text: "I needed Mr. Bekas to guide me through data analysis, the setup of my models, and the development of algorithms (specifically DEA and AHP) to draw conclusions regarding the efficiency of certain hospitals in our country. We have 3 hours of sessions per week; although the cost made me hesitate a bit at first, I soon realized that the quality and pace of the instruction are 100% worth it. He covers a significant portion of the material in a short amount of time, and with great precision. I am completely satisfied.",
    date: "2023-11-25",
    link: "https://share.google/CPYkT1I5n5lTqU1aZ",
    source: "google"
  },
];

interface ReviewCopy {
  title: string;
  mentorship: string;
  open: (source: string) => string;
  position: (index: number, total: number) => string;
  rating: (value: number) => string;
  context: Partial<Record<number, string>>;
}

const reviewCopy: Record<Locale, ReviewCopy> = {
  en: {
    title: "What clients say",
    mentorship: "Mentorship feedback",
    open: (source) => `View on ${source}`,
    position: (index, total) => `Review ${index} of ${total}`,
    rating: (value) => `${value} out of 5 stars`,
    context: {
      4: "Accounting firm · Analytics and automation",
      5: "Finance and logistics reporting",
      7: "General Director, Hellenic Institute of Cultural Diplomacy",
    },
  },
  el: {
    title: "Τι λένε οι πελάτες",
    mentorship: "Σχόλια για την καθοδήγηση",
    open: (source) => `Δείτε στο ${source}`,
    position: (index, total) => `Αξιολόγηση ${index} από ${total}`,
    rating: (value) => `${value} από 5 αστέρια`,
    context: {
      4: "Λογιστική εταιρεία · Ανάλυση και αυτοματοποίηση",
      5: "Οικονομικές αναφορές και αναφορές εφοδιαστικής",
      7: "Γενικός Διευθυντής, Ελληνικό Ινστιτούτο Πολιτιστικής Διπλωματίας",
    },
  },
  de: {
    title: "Was Kunden sagen",
    mentorship: "Stimmen zum Mentoring",
    open: (source) => `Auf ${source} ansehen`,
    position: (index, total) => `Bewertung ${index} von ${total}`,
    rating: (value) => `${value} von 5 Sternen`,
    context: {
      4: "Steuer- und Buchhaltungsbüro · Analyse und Automatisierung",
      5: "Berichte für Finanzen und Logistik",
      7: "Generaldirektor, Hellenisches Institut für Kulturdiplomatie",
    },
  },
};

function ReviewCard({ review }: { review: Review }) {
  const { locale } = useLocale();
  const copy = reviewCopy[locale];
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <Card className="flex flex-col md:h-full">
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex shrink-0 gap-1" role="img" aria-label={copy.rating(review.rating)}>
            {Array.from({ length: review.rating }, (_, index) => (
              <Star key={index} aria-hidden="true" className="size-4 fill-gray-950 text-gray-950" />
            ))}
          </div>
          <time dateTime={review.date} className="whitespace-nowrap text-xs text-muted-foreground" translate="no">
            {dateFormatter.format(new Date(review.date))}
          </time>
        </div>
        <h3 className="card-title text-lg font-bold" translate="no">{review.author}</h3>
        {copy.context[review.id] && (
          <p className="text-sm font-medium text-muted-foreground">{copy.context[review.id]}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-start">
        <blockquote className="text-base leading-relaxed text-muted-foreground" translate="no" lang="en">
          "{review.text}"
        </blockquote>
        <a
          href={review.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
        >
          {copy.open(review.source === "linkedin" ? "LinkedIn" : "Google")}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </a>
      </CardContent>
    </Card>
  );
}

export function ReviewsSection() {
  const { locale } = useLocale();
  const copy = reviewCopy[locale];
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
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

  return (
    <section aria-labelledby="homepage-reviews" className="section-space bg-background">
      <div className="site-container">
        <h2 id="homepage-reviews" className="section-title mb-8">{copy.title}</h2>
        <Carousel opts={{ align: "start", loop: true }} setApi={setCarouselApi} className="w-full">
          <CarouselContent
            className="-ml-6 items-start md:items-stretch"
            viewportClassName="review-carousel__viewport"
            viewportStyle={{ "--review-height": activeReviewHeight ? `${activeReviewHeight}px` : undefined } as CSSProperties}
          >
            {consultingReviews.map((review) => (
              <CarouselItem key={review.id} className="pl-6 md:basis-1/2 xl:basis-1/3">
                <div className="py-2 md:h-full">
                  <ReviewCard review={review} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <CarouselPrevious className="static translate-y-0" />
            <div className="order-last flex basis-full justify-center gap-2 sm:order-none sm:basis-auto" role="group" aria-label={copy.title}>
              {consultingReviews.map((review, index) => (
                <button
                  key={review.id}
                  type="button"
                  aria-label={copy.position(index + 1, consultingReviews.length)}
                  aria-current={index === selectedIndex ? "true" : undefined}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className="flex h-11 w-6 items-center justify-center"
                >
                  <span
                    className={index === selectedIndex
                      ? "block h-2 w-6 rounded-full bg-gray-900 transition-all"
                      : "block h-2 w-2 rounded-full bg-gray-300 transition-all"}
                  />
                </button>
              ))}
            </div>
            <CarouselNext className="static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

export function MentorshipReviews() {
  const { locale } = useLocale();

  return (
    <details className="mt-6 rounded-xl border border-black/10 bg-background px-4 sm:px-5">
      <summary className="cursor-pointer py-3 font-semibold">{reviewCopy[locale].mentorship}</summary>
      <div className="grid gap-4 pb-4 md:grid-cols-2 sm:pb-5">
        {mentorshipReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
      </div>
    </details>
  );
}
