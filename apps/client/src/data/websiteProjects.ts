import bladeAndCombCover from "@/assets/case-studies/blade-and-comb-cover.webp";
import bladeAndCombCover800 from "@/assets/case-studies/blade-and-comb-cover-800.webp";
import barkNGroomCover from "@/assets/case-studies/bark-n-groom-cover.webp";
import barkNGroomCover800 from "@/assets/case-studies/bark-n-groom-cover-800.webp";
import kidsFromTheBlockCover from "@/assets/case-studies/kids-from-the-block-cover.webp";
import kidsFromTheBlockCover800 from "@/assets/case-studies/kids-from-the-block-cover-800.webp";
import marginApparelCover from "@/assets/case-studies/margin-apparel-cover.webp";
import marginApparelCover800 from "@/assets/case-studies/margin-apparel-cover-800.webp";
import nikiGigourtakiCoachingCover from "@/assets/case-studies/niki-gigourtaki-coaching-cover.webp";
import nikiGigourtakiCoachingCover800 from "@/assets/case-studies/niki-gigourtaki-coaching-cover-800.webp";
import paroliCover from "@/assets/case-studies/paroli-cover.webp";
import paroliCover800 from "@/assets/case-studies/paroli-cover-800.webp";
import studiosKalliopiCover from "@/assets/case-studies/studios-kalliopi-cover.webp";
import studiosKalliopiCover800 from "@/assets/case-studies/studios-kalliopi-cover-800.webp";
import vantaMotorsCover from "@/assets/case-studies/vanta-motors-cover.webp";
import vantaMotorsCover800 from "@/assets/case-studies/vanta-motors-cover-800.webp";

export interface WebsiteProject {
  slug: string;
  title: string;
  category: string;
  relationship: string;
  summary: string;
  value: string;
  image: string;
  mobileImage: string;
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
    mobileImage: studiosKalliopiCover800,
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
    mobileImage: vantaMotorsCover800,
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
    mobileImage: bladeAndCombCover800,
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
    mobileImage: paroliCover800,
    imageAlt:
      "PAROLI direct-ordering website presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/paroli/",
  },
  {
    slug: "kids-from-the-block",
    title: "Kids from the Block",
    category: "Food ordering experience",
    relationship: "Independent web project",
    summary:
      "A high-energy coffee and street-brunch experience that connects menu discovery, product customization, cart interactions, and direct ordering in one distinctive journey.",
    value:
      "Customers can explore, personalize, and move toward an order without leaving the brand experience.",
    image: kidsFromTheBlockCover,
    mobileImage: kidsFromTheBlockCover800,
    imageAlt:
      "Kids from the Block coffee and street-brunch website presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/kids-from-the-block/",
  },
  {
    slug: "bark-n-groom",
    title: "Bark n’ Groom",
    category: "Local service website",
    relationship: "Independent web project",
    summary:
      "A warm, conversion-focused grooming website that brings services, trust signals, contact details, and appointment actions into a clear local customer journey.",
    value:
      "Pet owners can understand the offer and reach the booking step quickly from any device.",
    image: barkNGroomCover,
    mobileImage: barkNGroomCover800,
    imageAlt:
      "Bark n' Groom dog grooming website presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/bark-n-groom/",
  },
  {
    slug: "niki-gigourtaki-coaching",
    title: "Niki Gigourtaki Coaching",
    category: "Personal brand website",
    relationship: "Independent web project",
    summary:
      "A bilingual coaching presence that organizes programs, methodology, proof, and consultation paths around a confident personal brand.",
    value:
      "Visitors can understand the coaching approach and choose the most relevant next step with less friction.",
    image: nikiGigourtakiCoachingCover,
    mobileImage: nikiGigourtakiCoachingCover800,
    imageAlt:
      "Niki Gigourtaki Coaching website presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/niki-gigourtaki-coaching/",
  },
  {
    slug: "margin-apparel",
    title: "MARGIN",
    category: "Interactive ecommerce concept",
    relationship: "Independent web project",
    summary:
      "A typography-led apparel storefront with product discovery, quick view, stock-aware options, cart flows, search, and simulated checkout.",
    value:
      "The concept shows how a distinctive visual system can support a complete and usable shopping journey.",
    image: marginApparelCover,
    mobileImage: marginApparelCover800,
    imageAlt:
      "MARGIN apparel ecommerce concept presented in a high-resolution browser frame",
    href: "https://ioannisbekas.github.io/margin-apparel/",
  },
];
