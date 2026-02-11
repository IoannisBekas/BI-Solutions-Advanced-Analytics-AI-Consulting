import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollRevealTitle } from "@/components/ui/ScrollRevealTitle";

const reviews = [
    {
        id: 1,
        author: "Client Name",
        rating: 5,
        text: "Ioannis and the BI Solutions team transformed our data infrastructure. Their expertise in cloud migration and advanced analytics helped us unlock valuable insights we didn't know we had.",
        date: "2 months ago",
    },
    {
        id: 2,
        author: "Client Name",
        rating: 5,
        text: "Exceptional service! The machine learning models they built have significantly improved our forecasting accuracy. Highly recommend for any data-driven project.",
        date: "5 months ago",
    },
    {
        id: 3,
        author: "Client Name",
        rating: 5,
        text: "Professional, knowledgeable, and easy to work with. They delivered a comprehensive BI dashboard that gives us real-time visibility into our KPIs.",
        date: "1 year ago",
    },
    {
        id: 4,
        author: "Client Name",
        rating: 5,
        text: "BI Solutions Group provided excellent guidance on our data governance strategy. We now have a solid foundation for scaling our data operations.",
        date: "1 year ago",
    },
];

export function Reviews() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <ScrollRevealTitle
                        text="WHAT OUR CLIENTS SAY"
                        className="text-3xl md:text-5xl font-bold font-heading justify-center mb-6"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="flex justify-center items-center gap-2 mb-4"
                    >
                        <span className="text-2xl font-bold">5.0</span>
                        <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} fill="currentColor" className="w-5 h-5" />
                            ))}
                        </div>
                        <span className="text-gray-500 ml-2">(Google Reviews)</span>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                        {review.author.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{review.author}</h3>
                                        <p className="text-xs text-gray-500">{review.date}</p>
                                    </div>
                                </div>
                                <div className="flex text-yellow-500">
                                    {[...Array(review.rating)].map((_, i) => (
                                        <Star key={i} fill="currentColor" className="w-4 h-4" />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed italic">"{review.text}"</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-center"
                >
                    <a
                        href="https://www.google.com/maps/place/BI+Solutions+%7C+BEKAS+IOANNIS+-+%CE%9C%CE%A0%CE%95%CE%9A%CE%91%CE%A3+%CE%99%CE%A9%CE%91%CE%9D%CE%9D%CE%97%CE%A3/@51.2072,-79.19775,3z/data=!3m1!4b1!4m6!3m5!1s0x8b72b1c0bdff5865:0xc7a521d46d96ec7f!8m2!3d51.2072!4d-79.19775!16s%2Fg%2F11p5znwz2w?entry=ttu&g_ep=EgoyMDI1MDIyNS4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-colors"
                    >
                        Read more reviews on Google
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
