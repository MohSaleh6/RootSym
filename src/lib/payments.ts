import "server-only";
import { prisma } from "./prisma";

/**
 * Stripe does not onboard merchants based in Jordan, so CliQ and a plain
 * bank transfer are the platform's primary payment rails. The details below
 * are editable from the admin panel and are rendered on the confirmation
 * page, in the confirmation email, and nowhere else.
 */

export const HOLD_HOURS = 48;

export type PaymentDetails = {
  cliqAlias: string;
  cliqName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  notes: string;
  notesAr: string;
};

export const PAYMENT_KEYS: Record<keyof PaymentDetails, string> = {
  cliqAlias: "pay_cliq_alias",
  cliqName: "pay_cliq_name",
  bankName: "pay_bank_name",
  accountName: "pay_account_name",
  accountNumber: "pay_account_number",
  iban: "pay_iban",
  swift: "pay_swift",
  notes: "pay_notes",
  notesAr: "pay_notes_ar",
};

const EMPTY: PaymentDetails = {
  cliqAlias: "",
  cliqName: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  iban: "",
  swift: "",
  notes: "",
  notesAr: "",
};

export async function getPaymentDetails(): Promise<PaymentDetails> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: Object.values(PAYMENT_KEYS) } },
    });
    const byKey = new Map(rows.map((r) => [r.key, r.value]));
    const out = { ...EMPTY };
    for (const [field, key] of Object.entries(PAYMENT_KEYS) as [keyof PaymentDetails, string][]) {
      out[field] = byKey.get(key) ?? "";
    }
    return out;
  } catch (error) {
    console.error("[payments] could not read payment details", error);
    return { ...EMPTY };
  }
}

/** True once there is at least one way for a customer to actually pay. */
export function hasPaymentDetails(details: PaymentDetails): boolean {
  return Boolean(details.cliqAlias || details.iban || details.accountNumber);
}

export type PaymentRow = { label: string; labelAr: string; value: string; copyable: boolean };

/** The details as display rows, skipping anything the admin left blank. */
export function paymentRows(details: PaymentDetails): PaymentRow[] {
  const rows: PaymentRow[] = [
    { label: "CliQ alias", labelAr: "اسم كليك", value: details.cliqAlias, copyable: true },
    { label: "CliQ account name", labelAr: "اسم صاحب حساب كليك", value: details.cliqName, copyable: false },
    { label: "Bank", labelAr: "البنك", value: details.bankName, copyable: false },
    { label: "Account name", labelAr: "اسم الحساب", value: details.accountName, copyable: false },
    { label: "Account number", labelAr: "رقم الحساب", value: details.accountNumber, copyable: true },
    { label: "IBAN", labelAr: "الآيبان", value: details.iban, copyable: true },
    { label: "SWIFT / BIC", labelAr: "سويفت", value: details.swift, copyable: true },
  ];
  return rows.filter((r) => r.value.trim().length > 0);
}

export function holdExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + HOLD_HOURS * 3600_000);
}

/**
 * Whether the site can take a card online.
 *
 * It cannot, today: Stripe does not onboard merchants based in Jordan, and
 * the local gateways all want a merchant-of-record arrangement first. Until
 * one is in place every booking is a CliQ or bank transfer that Rand confirms
 * by hand from the admin panel.
 *
 * When a gateway does arrive, this is the single switch the UI reads — see
 * docs/PAYMENTS.md for the rest of the wiring.
 */
export function cardPaymentsEnabled(): boolean {
  return false;
}
