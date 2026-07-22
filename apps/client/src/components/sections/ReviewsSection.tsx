import { ExternalLink, Star } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { trackEvent } from "@/lib/analytics";

const reviews = [
  {
    author: "Vasilis Antonakakis",
    text: "From the very beginning, he demonstrated deep expertise in data engineering, business intelligence, and advanced analytics, combined with a strong understanding of real operational needs.",
    date: "December 2024",
    link: "https://maps.app.goo.gl/dRfe4tXaRSymdoxz5",
    source: "Google Review",
  },
  {
    author: "Kostas Polyzonis",
    text: "Worked with Yannis on building integrated data management and reporting systems. His expertise in Business Analytics, Database Development, and Information Management helped automate reliable KPIs for Finance and surgical parts Logistics.",
    date: "June 2025",
    link: "https://www.linkedin.com/services/page/281b263286b3198352/",
    source: "LinkedIn Services",
  },
  {
    author: "Arunav Mallik",
    text: "Ioannis was extremely professional, very receptive to my feedback and delivered the project on time. I appreciated his timely feedback and quality of delivery.",
    date: "April 2025",
    link: "https://www.linkedin.com/services/page/281b263286b3198352/",
    source: "LinkedIn Services",
  },
];

export function ReviewsSection() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <ScrollReveal className="mb-14 max-w-3xl" width="100%">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
            Client reviews
          </p>
          <h2 className="mt-4 text-4xl font-bold font-heading tracking-tight text-gray-950 md:text-5xl">
            What clients value in the work.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            Selected public reviews covering delivery quality, operational
            understanding, and the ability to turn complex data work into a
            useful result.
          </p>
        </ScrollReveal>

        <div className="grid auto-rows-fr gap-6 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <ScrollReveal
              key={`${review.author}-${review.date}`}
              delay={index * 0.08}
              width="100%"
              className="h-full"
            >
              <a
                href={review.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full"
                aria-label={`Read ${review.author}'s review on ${review.source}`}
                onClick={() =>
                  trackEvent("review_source_click", {
                    author: review.author,
                    source: review.source,
                    target: review.link,
                  })
                }
              >
                <Card className="flex h-full flex-col rounded-[1.75rem] border-gray-200 bg-gray-50/70 p-7 shadow-none transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-black/[0.05]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-1" aria-hidden="true">
                      {Array.from({ length: 5 }, (_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="h-4 w-4 fill-gray-950 text-gray-950"
                        />
                      ))}
                    </div>
                    <span className="sr-only">5 out of 5 stars</span>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>

                  <blockquote className="mt-7 flex-1 text-base leading-relaxed text-gray-700">
                    “{review.text}”
                  </blockquote>

                  <div className="mt-8 border-t border-gray-200 pt-5">
                    <p className="font-bold text-gray-950">{review.author}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                      {review.source}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Card>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
