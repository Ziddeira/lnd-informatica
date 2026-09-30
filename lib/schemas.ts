// Esquemas de validação compartilhados entre os formulários (cliente) e a API (servidor).
import { z } from "zod";
import type { PartCategory } from "@/data/hardwareCatalog";

export const INTERESTS = ["empresa", "servidores", "gamer", "assistencia", "outro"] as const;
export type Interest = (typeof INTERESTS)[number];

export const INTEREST_LABEL: Record<Interest, string> = {
  empresa: "Suporte de TI para empresa",
  servidores: "Servidores, redes e firewall",
  gamer: "PC Gamer / Workstation",
  assistencia: "Assistência técnica",
  outro: "Outro assunto",
};

/** Interesses corporativos exigem o nome da empresa. */
export const B2B_INTERESTS: readonly Interest[] = ["empresa", "servidores"];

export const COMPANY_SIZES = ["1-5", "6-20", "21-50", "51-200", "200+"] as const;

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

export const leadSchema = z
  .object({
    interest: z.enum(INTERESTS, "Escolha o assunto"),
    name: z.string().trim().min(2, "Informe seu nome").max(120, "Nome muito longo"),
    phone: z
      .string()
      .trim()
      .regex(/^[\d\s()+.-]{8,20}$/, "Informe um telefone/WhatsApp válido"),
    email: z.union([z.literal(""), z.email("E-mail inválido").max(160)]).optional().default(""),
    company: optionalText(160),
    companySize: z.union([z.literal(""), z.enum(COMPANY_SIZES)]).optional().default(""),
    message: z.string().trim().min(10, "Conte um pouco mais (mínimo de 10 caracteres)").max(3000, "Mensagem muito longa"),
    consent: z.literal(true, "É preciso autorizar o contato"),
    /** Honeypot anti-spam: campo invisível que pessoas não preenchem (a API finge sucesso e descarta). */
    website: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (B2B_INTERESTS.includes(data.interest) && data.company.length < 2) {
      ctx.addIssue({ code: "custom", path: ["company"], message: "Informe o nome da empresa" });
    }
  });

export type LeadInput = z.input<typeof leadSchema>;
export type LeadData = z.output<typeof leadSchema>;

const CATEGORIES = ["cpu", "motherboard", "ram", "gpu", "storage", "psu", "case", "cooler"] as const satisfies readonly PartCategory[];

export const quoteSchema = z.object({
  selections: z.partialRecord(z.enum(CATEGORIES), z.string().trim().max(80)),
  rgbColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  rainbow: z.boolean().optional(),
});

export type QuoteInput = z.input<typeof quoteSchema>;

export const LEAD_STATUSES = ["novo", "em_atendimento", "concluido", "descartado"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
  descartado: "Descartado",
};

export const leadStatusSchema = z.object({ status: z.enum(LEAD_STATUSES), note: optionalText(1000) });

/** Converte os erros do Zod em { campo: mensagem } para exibir no formulário. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
