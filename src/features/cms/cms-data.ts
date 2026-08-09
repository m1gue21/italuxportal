import type { CountryRow } from "@/features/countries/types";
import type { FaqRow } from "@/features/faqs/types";
import type { BenefitRow } from "@/features/benefits/types";
import type { SectionTextRow } from "./types";
import {
  DEFAULT_BENEFITS,
  DEFAULT_COUNTRIES,
  DEFAULT_FAQS,
  DEFAULT_SECTION_TEXTS,
} from "./defaults";

/** Lecturas CMS desde seed TypeScript (sin persistencia ni mutaciones). */

export function listCountries(opts?: { activeOnly?: boolean }): CountryRow[] {
  const rows = DEFAULT_COUNTRIES;
  const filtered = opts?.activeOnly ? rows.filter((c) => c.is_active) : rows;
  return [...filtered].sort((a, b) => a.display_order - b.display_order);
}

export function listFaqs(opts?: { activeOnly?: boolean }): FaqRow[] {
  const rows = DEFAULT_FAQS;
  const filtered = opts?.activeOnly ? rows.filter((f) => f.activo) : rows;
  return [...filtered].sort((a, b) => a.orden - b.orden);
}

export function listBenefits(opts?: { activeOnly?: boolean }): BenefitRow[] {
  const rows = DEFAULT_BENEFITS;
  const filtered = opts?.activeOnly ? rows.filter((b) => b.activo) : rows;
  return [...filtered].sort((a, b) => a.orden - b.orden);
}

export function getSectionText(key: string): SectionTextRow | null {
  return DEFAULT_SECTION_TEXTS.find((s) => s.section_key === key) ?? null;
}
