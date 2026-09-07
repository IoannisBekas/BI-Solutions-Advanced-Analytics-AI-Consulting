import bladeAndCombCover from "@/assets/case-studies/blade-and-comb-cover.webp";
import paroliCover from "@/assets/case-studies/paroli-cover.webp";
import studiosKalliopiCover from "@/assets/case-studies/studios-kalliopi-cover.webp";
import vantaMotorsCover from "@/assets/case-studies/vanta-motors-cover.webp";

export interface WebsiteProject {
  slug: string;
  title: string;
  category: string;
  relationship: string;
  summary: string;
  value: string;
  image: string;
  imageAlt: string;
  href: string;
}

export const websiteProjects: WebsiteProject[] = [
  {
    slug: "studios-kalliopi",
    title: "Studios Kalliopi",
    category: "Hospitality website",
    relationship: "Independent web project",
    summary:
      "A calm, image-led hospitality experience with clear navigation, multilingual access, and a direct path from discovery to enquiry.",
    value:
      "Guests can understand the property and reach the booking step with fewer distractions.",
    image: studiosKalliopiCover,
    imageAlt:
      "Studios Kalliopi hospitality website presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/StudioKalliopiKoufonisia/?lang=en#top",
  },
  {
    slug: "vanta-motors",
    title: "VANTA Motors",
    category: "Automotive website",
    relationship: "Independent web project",
    summary:
      "A premium automotive experience with a clear inventory hierarchy, focused calls to action, and consistent paths to details and contact.",
    value:
      "The buying journey becomes easier to scan, compare, and act on.",
    image: vantaMotorsCover,
    imageAlt:
      "VANTA Motors automotive website presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/Car/?lang=en",
  },
  {
    slug: "blade-and-comb",
    title: "Blade & Comb",
    category: "Service & booking website",
    relationship: "Independent web project",
    summary:
      "A typography-led barbershop experience with clear service tiers, concise navigation, and a prominent appointment path.",
    value:
      "Visitors need fewer steps to move from interest to appointment.",
    image: bladeAndCombCover,
    imageAlt:
      "Blade and Comb barbershop website presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/Barber/",
  },
  {
    slug: "paroli-direct-ordering",
    title: "PAROLI",
    category: "Direct-ordering website",
    relationship: "Independent web project",
    summary:
      "A branded menu, category-browsing, cart, and checkout experience designed around direct online orders.",
    value:
      "The business keeps more control over margin, customer journey, and brand experience.",
    image: paroliCover,
    imageAlt:
      "PAROLI direct-ordering website presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/paroli/",
  },
];
