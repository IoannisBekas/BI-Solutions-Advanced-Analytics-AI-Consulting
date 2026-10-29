import { z } from "zod";

export const restaurantRoleOptions = [
  { value: "owner", label: "Ιδιοκτήτης / συνιδιοκτήτης" },
  { value: "manager", label: "Υπεύθυνος με δικαίωμα απόφασης" },
  { value: "other", label: "Άλλος ρόλος" },
] as const;

export const restaurantPlatformOptions = ["efood", "Wolt", "BOX", "Άλλη", "Καμία"] as const;

export const restaurantGoalOptions = [
  { value: "leave", label: "Θέλω να αποχωρήσω από τις πλατφόρμες" },
  { value: "reduce", label: "Θέλω περισσότερες απευθείας παραγγελίες" },
  { value: "information", label: "Θέλω πρώτα να ενημερωθώ" },
] as const;

export const restaurantFulfilmentOptions = [
  { value: "own", label: "Έχουμε δικούς μας διανομείς" },
  { value: "partner", label: "Συνεργαζόμαστε με υπηρεσία διανομής" },
  { value: "pickup", label: "Μπορούμε να εξυπηρετούμε παραλαβή" },
  { value: "platform", label: "Βασιζόμαστε μόνο στους διανομείς της πλατφόρμας" },
] as const;

export const restaurantTimingOptions = [
  { value: "30-days", label: "Μέσα στις επόμενες 30 ημέρες" },
  { value: "60-days", label: "Μέσα στις επόμενες 60 ημέρες" },
  { value: "later", label: "Αργότερα" },
  { value: "exploring", label: "Δεν έχω αποφασίσει ακόμη" },
] as const;

const phoneSchema = z.string().trim().max(40).refine(
  (value) => /^[+\d\s().-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, "")),
  "Συμπλήρωσε έναν έγκυρο αριθμό τηλεφώνου.",
);

const restaurantLeadSchema = z.object({
  name: z.string().trim().min(1, "Συμπλήρωσε το όνομά σου.").max(100),
  company: z.string().trim().min(1, "Συμπλήρωσε το όνομα του καταστήματος.").max(150),
  area: z.string().trim().min(1, "Συμπλήρωσε την περιοχή του καταστήματος.").max(100),
  phone: phoneSchema,
  email: z.string().trim().email("Συμπλήρωσε ένα έγκυρο email.").max(254),
  role: z.enum(["owner", "manager", "other"]),
  platforms: z.array(z.enum(restaurantPlatformOptions)).min(1, "Επίλεξε τουλάχιστον μία απάντηση για τις πλατφόρμες.").max(5),
  goal: z.enum(["leave", "reduce", "information"]),
  fulfilment: z.enum(["own", "partner", "pickup", "platform"]),
  timing: z.enum(["30-days", "60-days", "later", "exploring"]),
  consent: z.literal(true),
  website: z.string().max(0),
}).refine((values) => !values.platforms.includes("Καμία") || values.platforms.length === 1, {
  message: "Η επιλογή «Καμία» δεν συνδυάζεται με άλλη πλατφόρμα.",
  path: ["platforms"],
});

export type RestaurantLeadValues = {
  name: string;
  company: string;
  area: string;
  phone: string;
  email: string;
  role: string;
  platforms: string[];
  goal: string;
  fulfilment: string;
  timing: string;
  consent: boolean;
  website: string;
};

export type RestaurantLandingPage = "ordering" | "transition";

const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
type CampaignKey = typeof campaignKeys[number];

export type RestaurantAttribution = {
  landingPath: string;
  campaign: Partial<Record<CampaignKey, string>>;
};

function cleanCampaignValue(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 100);
}

/** Kept in component memory only; never stores campaign data in the browser. */
export function readRestaurantAttribution(search: string, pathname: string): RestaurantAttribution {
  const params = new URLSearchParams(search);
  const campaign: RestaurantAttribution["campaign"] = {};
  for (const key of campaignKeys) {
    const value = cleanCampaignValue(params.get(key) || "");
    if (value) campaign[key] = value;
  }
  const landingPath = pathname.startsWith("/") && !pathname.startsWith("//")
    ? pathname.split(/[?#]/, 1)[0].replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200)
    : "/";
  return { landingPath, campaign };
}

/** Only internal links carry allowlisted campaign parameters between these pages. */
export function restaurantCampaignHref(path: string, search = typeof window === "undefined" ? "" : window.location.search) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const destination = new URL(path, "https://restaurant.invalid");
  const { campaign } = readRestaurantAttribution(search, "/");
  for (const key of campaignKeys) {
    if (campaign[key]) destination.searchParams.set(key, campaign[key]);
  }
  return `${destination.pathname}${destination.search}${destination.hash}`;
}

function optionLabel(options: readonly { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label || value;
}

export function validateRestaurantLead(values: RestaurantLeadValues) {
  return restaurantLeadSchema.safeParse(values);
}

export function buildRestaurantLeadPayload(values: RestaurantLeadValues, landingPage: RestaurantLandingPage, attribution: RestaurantAttribution) {
  const lead = restaurantLeadSchema.parse(values);
  const platformList = Array.from(new Set(lead.platforms));
  const message = [
    "Αξιολόγηση συστήματος απευθείας παραγγελιών",
    `Κατάστημα: ${lead.company}`,
    `Περιοχή: ${lead.area}`,
    `Τηλέφωνο: ${lead.phone}`,
    `Ρόλος: ${optionLabel(restaurantRoleOptions, lead.role)}`,
    `Πλατφόρμες: ${platformList.join(", ")}`,
    `Στόχος: ${optionLabel(restaurantGoalOptions, lead.goal)}`,
    `Διανομή / παραλαβή: ${optionLabel(restaurantFulfilmentOptions, lead.fulfilment)}`,
    `Έναρξη: ${optionLabel(restaurantTimingOptions, lead.timing)}`,
    "Άδεια επικοινωνίας για το αίτημα: Ναι",
    "",
    "Προέλευση αιτήματος:",
    `Σελίδα: ${readRestaurantAttribution("", attribution.landingPath).landingPath}`,
    `Τύπος σελίδας: ${landingPage}`,
    ...campaignKeys.flatMap((key) => {
      const value = cleanCampaignValue(attribution.campaign[key] || "");
      return value ? [`${key}: ${value}`] : [];
    }),
  ].join("\n");

  return {
    name: lead.name,
    email: lead.email,
    subject: `Απευθείας παραγγελίες — ${lead.company}`,
    message,
  };
}

/** An HTTP 200 serving an HTML fallback is not a delivered contact enquiry. */
export function isRestaurantLeadAcknowledged(httpOk: boolean, payload: unknown): boolean {
  return httpOk && typeof payload === "object" && payload !== null && "success" in payload && payload.success === true;
}
