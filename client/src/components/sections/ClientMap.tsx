import { useState } from "react";
import clientMap from "@/assets/client_map.png";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

interface Location {
    id: string;
    name: string;
    top: string;
    left: string;
}

const locations: Location[] = [
    { id: "vienna", name: "Vienna, Austria", top: "27%", left: "51.5%" },
    { id: "athens", name: "Athens, Greece", top: "33%", left: "53.5%" },
    { id: "chania", name: "Chania, Greece", top: "34.5%", left: "53.8%" },
    { id: "copenhagen", name: "Copenhagen, Denmark", top: "22%", left: "50.5%" },
    { id: "toronto", name: "Toronto, Canada", top: "28%", left: "27%" },
    { id: "new-york", name: "New York, USA", top: "30%", left: "28%" },
];

export function ClientMap() {
    const [activeLocation, setActiveLocation] = useState<string | null>(null);

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="mb-16">
                    <ScrollReveal width="100%">
                        <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight mb-6">
                            Global Client Presence
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl">
                            Partnering with organizations across the globe to deliver data-driven solutions.
                        </p>
                    </ScrollReveal>
                </div>

                <ScrollReveal delay={0.2} className="relative w-full rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                    <div className="relative w-full">
                        {/* Map Image */}
                        <img
                            src={clientMap}
                            alt="World Map with Client Locations"
                            className="w-full h-auto block"
                        />

                        {/* Location Dots */}
                        {locations.map((loc) => (
                            <div
                                key={loc.id}
                                className="absolute w-6 h-6 -ml-3 -mt-3 group cursor-pointer"
                                style={{ top: loc.top, left: loc.left }}
                                onMouseEnter={() => setActiveLocation(loc.id)}
                                onMouseLeave={() => setActiveLocation(null)}
                            >
                                {/* Pulse Effect - Subtle indication of interactivity */}
                                <div className="absolute inset-0 bg-black rounded-full animate-ping opacity-0 group-hover:opacity-20 transition-opacity" />

                                {/* Invisible Hit Target (Visual dot is baked into image) */}
                                <div className="absolute inset-0 rounded-full bg-transparent" />

                                {/* Tooltip */}
                                <div
                                    className={cn(
                                        "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-black text-white text-sm font-medium rounded-lg whitespace-nowrap shadow-xl transition-all duration-300 transform z-10",
                                        activeLocation === loc.id
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 translate-y-2 pointer-events-none"
                                    )}
                                >
                                    {loc.name}
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
