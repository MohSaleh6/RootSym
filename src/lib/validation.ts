import { z } from "zod";

export const checkoutSchema = z.object({
  slug: z.string().min(1),
  type: z.enum(["INDIVIDUAL", "COMPANY"]),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  attendees: z.coerce.number().int().min(1).max(50),
  sessionId: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  paymentMethod: z.enum(["STRIPE", "BANK_TRANSFER"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/**
 * Eight characters is the floor, not the goal. A length rule is the only one
 * that reliably helps; composition rules mostly push people towards
 * "Password1!" and a sticky note.
 */
const password = z.string().min(8, "Use at least 8 characters.").max(200);

export const signUpSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
  password,
});

export const signInSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  jobTitle: z.string().trim().max(120).optional().or(z.literal("")),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  organisation: z.string().trim().max(160).optional().or(z.literal("")),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(10).max(4000),
});

const jsonModule = z.object({
  clock: z.string().optional(),
  title: z.string(),
  titleAr: z.string().optional(),
  points: z.array(z.string()).default([]),
  pointsAr: z.array(z.string()).default([]),
});

const jsonFaq = z.object({
  q: z.string(),
  a: z.string(),
  qAr: z.string().optional(),
  aAr: z.string().optional(),
});

export const courseSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  title: z.string().trim().min(3).max(200),
  titleAr: z.string().trim().max(200).optional().or(z.literal("")),
  tagline: z.string().trim().min(3).max(200),
  taglineAr: z.string().trim().max(200).optional().or(z.literal("")),
  summary: z.string().trim().min(10).max(1200),
  summaryAr: z.string().trim().max(1200).optional().or(z.literal("")),
  description: z.string().trim().min(10).max(12000),
  descriptionAr: z.string().trim().max(12000).optional().or(z.literal("")),
  imageUrl: z.string().trim().max(3_000_000).optional().or(z.literal("")),
  durationHours: z.coerce.number().int().min(1).max(200),
  deliveryMode: z.string().trim().min(2).max(120),
  level: z.string().trim().min(2).max(120),
  languageOfDelivery: z.string().trim().min(2).max(120),
  priceIndividual: z.coerce.number().int().min(0),
  priceCompany: z.coerce.number().int().min(0),
  maxAttendees: z.coerce.number().int().min(1).max(500),
  outcomes: z.array(z.string()).default([]),
  outcomesAr: z.array(z.string()).default([]),
  audience: z.array(z.string()).default([]),
  audienceAr: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  modules: z.array(jsonModule).default([]),
  faqs: z.array(jsonFaq).default([]),
  teamsLink: z.string().trim().max(2000).optional().or(z.literal("")),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#2e86ab"),
  icon: z.string().trim().min(1).max(40).default("target"),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const sessionSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().trim().max(160).optional().or(z.literal("")),
  startsAt: z.string().min(4),
  timezone: z.string().trim().min(2).max(60).default("Asia/Amman"),
  teamsLink: z.string().trim().max(2000).optional().or(z.literal("")),
  seatsTotal: z.coerce.number().int().min(1).max(500),
  status: z.enum(["SCHEDULED", "OPEN", "FULL", "COMPLETED", "CANCELLED"]).default("OPEN"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});
