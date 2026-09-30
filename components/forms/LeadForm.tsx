"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { CircleCheck, LoaderCircle, MessageCircle, Send } from "lucide-react";
import { STATIC_MODE, submitLead } from "@/lib/api";
import {
  B2B_INTERESTS,
  COMPANY_SIZES,
  fieldErrors,
  INTEREST_LABEL,
  INTERESTS,
  leadSchema,
  type Interest,
  type LeadInput,
} from "@/lib/schemas";
import { openWhatsapp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const PLACEHOLDER: Record<Interest, string> = {
  empresa: "Quantos computadores, se há servidor, o que mais incomoda hoje na TI da empresa…",
  servidores: "Servidor atual, quantos usuários, necessidade de firewall, VPN, backup, nuvem…",
  gamer: "Jogos, resolução, orçamento aproximado e se precisa de monitor/periféricos…",
  assistencia: "Equipamento (marca/modelo) e o problema que está acontecendo…",
  outro: "Como podemos ajudar?",
};

type FormState = Omit<LeadInput, "consent"> & { consent: boolean };

function whatsappMessage(data: FormState, protocol?: string) {
  return [
    `Olá, Leonardo! ${protocol ? `Enviei um contato pelo site (protocolo ${protocol}).` : "Vim pelo site da LND."}`,
    `Assunto: ${INTEREST_LABEL[data.interest as Interest]}`,
    `Nome: ${data.name}`,
    data.company ? `Empresa: ${data.company}${data.companySize ? ` (${data.companySize} colaboradores)` : ""}` : "",
    "",
    data.message ?? "",
  ]
    .filter((line, i, all) => line !== "" || (i > 0 && all[i - 1] !== ""))
    .join("\n");
}

function Field({
  label,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
  htmlFor: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (invalid?: boolean) =>
  cn(
    "w-full rounded-xl border bg-night/70 px-3.5 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20",
    invalid ? "border-rose-400/60" : "border-white/10",
  );

export default function LeadForm({
  defaultInterest = "empresa",
  interests = INTERESTS,
  title = "Fale com um especialista",
  description,
  className,
}: {
  defaultInterest?: Interest;
  interests?: readonly Interest[];
  title?: string;
  description?: string;
  className?: string;
}) {
  const uid = useId();
  const [data, setData] = useState<FormState>({
    interest: defaultInterest,
    name: "",
    phone: "",
    email: "",
    company: "",
    companySize: "",
    message: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [protocol, setProtocol] = useState("");
  const [serverError, setServerError] = useState("");

  const isB2B = B2B_INTERESTS.includes(data.interest as Interest);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key as string]) setErrors(({ [key as string]: _, ...rest }) => rest);
  };

  const validate = () => {
    const parsed = leadSchema.safeParse(data);
    const found = parsed.success ? {} : fieldErrors(parsed.error);
    // O refinamento da empresa só roda quando o resto é válido — checamos junto para mostrar tudo de uma vez.
    if (isB2B && (data.company ?? "").trim().length < 2) found.company ??= "Informe o nome da empresa";
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    if (STATIC_MODE) {
      openWhatsapp(whatsappMessage(data));
      setState("sent");
      return;
    }

    setState("sending");
    setServerError("");
    const result = await submitLead(data);
    if (result.ok) {
      setProtocol(result.protocol);
      setState("sent");
    } else {
      if (result.fields) setErrors(result.fields);
      setServerError(result.error);
      setState("failed");
    }
  };

  const id = (name: string) => `${uid}-${name}`;
  const described = (name: string) => (errors[name] ? { "aria-invalid": true, "aria-describedby": `${id(name)}-error` } : {});

  if (state === "sent") {
    return (
      <div className={cn("rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-8 text-center", className)} role="status">
        <CircleCheck className="mx-auto h-12 w-12 text-emerald-300" />
        <h3 className="mt-4 font-display text-2xl font-bold text-white">
          {STATIC_MODE ? "Continue pelo WhatsApp" : "Recebemos seu contato!"}
        </h3>
        {protocol && (
          <p className="mt-2 text-slate-300">
            Protocolo <strong className="font-mono text-brand">{protocol}</strong>
          </p>
        )}
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
          {STATIC_MODE
            ? "Abrimos a conversa com a sua mensagem pronta. É só tocar em enviar."
            : "Retornamos em horário comercial pelo telefone ou WhatsApp informado. Se for urgente, chame agora:"}
        </p>
        <button
          type="button"
          onClick={() => openWhatsapp(whatsappMessage(data, protocol || undefined))}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-whatsapp px-5 py-3 text-sm font-bold text-night hover:bg-whatsapp-strong"
        >
          <MessageCircle className="h-4 w-4" /> Falar agora no WhatsApp
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("relative rounded-3xl border border-white/8 bg-panel/80 p-6 shadow-2xl shadow-black/30 sm:p-8", className)}
      aria-labelledby={id("title")}
    >
      <h3 id={id("title")} className="font-display text-2xl font-bold text-white">
        {title}
      </h3>
      {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}

      {interests.length > 1 && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-medium text-slate-300">Assunto</legend>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <label
                key={interest}
                className={cn(
                  "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
                  data.interest === interest
                    ? "border-brand bg-brand/15 text-white"
                    : "border-white/10 text-slate-400 hover:border-white/25 hover:text-white",
                )}
              >
                <input
                  type="radio"
                  name="interest"
                  value={interest}
                  checked={data.interest === interest}
                  onChange={() => set("interest", interest)}
                  className="sr-only"
                />
                {INTEREST_LABEL[interest]}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor={id("name")} error={errors.name}>
          <input
            id={id("name")}
            autoComplete="name"
            value={data.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass(!!errors.name)}
            {...described("name")}
          />
        </Field>
        <Field label="WhatsApp / telefone" htmlFor={id("phone")} error={errors.phone}>
          <input
            id={id("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(48) 99999-9999"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass(!!errors.phone)}
            {...described("phone")}
          />
        </Field>

        {isB2B && (
          <>
            <Field label="Empresa" htmlFor={id("company")} error={errors.company}>
              <input
                id={id("company")}
                autoComplete="organization"
                value={data.company}
                onChange={(e) => set("company", e.target.value)}
                className={inputClass(!!errors.company)}
                {...described("company")}
              />
            </Field>
            <Field label="Colaboradores" htmlFor={id("size")}>
              <select
                id={id("size")}
                value={data.companySize}
                onChange={(e) => set("companySize", e.target.value as LeadInput["companySize"])}
                className={inputClass()}
              >
                <option value="">Selecione</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} pessoas
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        <Field label="E-mail (opcional)" htmlFor={id("email")} error={errors.email} className="sm:col-span-2">
          <input
            id={id("email")}
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass(!!errors.email)}
            {...described("email")}
          />
        </Field>

        <Field label="Mensagem" htmlFor={id("message")} error={errors.message} className="sm:col-span-2">
          <textarea
            id={id("message")}
            rows={4}
            placeholder={PLACEHOLDER[data.interest as Interest]}
            value={data.message}
            onChange={(e) => set("message", e.target.value)}
            className={cn(inputClass(!!errors.message), "resize-y")}
            {...described("message")}
          />
        </Field>
      </div>

      {/* Honeypot anti-spam: invisível para pessoas */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={id("website")}>Site</label>
        <input id={id("website")} tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm text-slate-400">
        <input
          type="checkbox"
          checked={data.consent}
          onChange={(e) => set("consent", e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[#ffaa01]"
          {...described("consent")}
        />
        <span>
          Autorizo a LND a entrar em contato pelos dados informados sobre esta solicitação (LGPD).
          {errors.consent && (
            <span id={`${id("consent")}-error`} className="mt-1 block text-xs text-rose-300">
              {errors.consent}
            </span>
          )}
        </span>
      </label>

      {state === "failed" && serverError && (
        <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-400/10 p-3 text-sm text-rose-200" role="alert">
          {serverError}{" "}
          <button type="button" onClick={() => openWhatsapp(whatsappMessage(data))} className="font-semibold text-white underline">
            Enviar pelo WhatsApp
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 font-semibold text-night shadow-lg shadow-brand/20 transition hover:bg-brand-light disabled:opacity-60"
      >
        {state === "sending" ? <LoaderCircle className="h-5 w-5 animate-spin" /> : STATIC_MODE ? <MessageCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
        {STATIC_MODE ? "Enviar pelo WhatsApp" : "Enviar solicitação"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">Resposta em horário comercial · seus dados não são compartilhados.</p>
    </form>
  );
}
