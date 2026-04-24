'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  applicationSchema,
  emptyApplication,
  LANGUAGES,
  STACK_OPTIONS,
  REFERRAL_SOURCES,
  COUNTRIES,
  type ApplicationInput,
} from '@/lib/hub/application-schema';

type FieldErrors = Partial<Record<keyof ApplicationInput, string>>;

export function ApplicationForm() {
  const router = useRouter();
  const [values, setValues] = useState<ApplicationInput>(emptyApplication);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof ApplicationInput>(
    key: K,
    value: ApplicationInput[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleInArray(key: 'languages' | 'stack', item: string) {
    const current = values[key];
    const next = current.includes(item)
      ? current.filter((x) => x !== item)
      : [...current, item];
    set(key, next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = applicationSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ApplicationInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error('Revisa los campos marcados');
      // Scroll al primer error
      const firstKey = Object.keys(fieldErrors)[0];
      if (firstKey) {
        document
          .querySelector(`[data-field="${firstKey}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/hub/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message ?? 'Error al enviar la aplicación');
      }

      router.push(`/hub/apply/success?id=${data.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(msg);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10" noValidate>
      {/* ========== 1. SOBRE TI ========== */}
      <FormSection
        number="01"
        title="Sobre ti"
        description="Lo básico. Tarda un minuto."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Nombre completo"
            name="full_name"
            error={errors.full_name}
            required
          >
            <input
              type="text"
              value={values.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              className={inputClass(errors.full_name)}
              placeholder="María González"
              autoComplete="name"
            />
          </Field>

          <Field
            label="Email"
            name="email"
            error={errors.email}
            required
          >
            <input
              type="email"
              value={values.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputClass(errors.email)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </Field>

          <Field
            label="LinkedIn"
            name="linkedin_url"
            error={errors.linkedin_url}
            required
            className="sm:col-span-2"
          >
            <input
              type="url"
              value={values.linkedin_url}
              onChange={(e) => set('linkedin_url', e.target.value)}
              className={inputClass(errors.linkedin_url)}
              placeholder="https://linkedin.com/in/tuperfil"
              autoComplete="url"
            />
          </Field>

          <Field label="País" name="country" error={errors.country} required>
            <select
              value={values.country}
              onChange={(e) => set('country', e.target.value)}
              className={inputClass(errors.country)}
            >
              <option value="">Selecciona…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Ciudad" name="city" error={errors.city} required>
            <input
              type="text"
              value={values.city}
              onChange={(e) => set('city', e.target.value)}
              className={inputClass(errors.city)}
              placeholder="Madrid"
            />
          </Field>
        </div>
      </FormSection>

      {/* ========== 2. SKILLS ========== */}
      <FormSection
        number="02"
        title="Stack y experiencia"
        description="Sé específico. Lo que no marques, lo asumimos que no lo conoces."
      >
        <div className="space-y-6">
          <Field
            label="Idiomas que hablas con fluidez profesional"
            name="languages"
            error={errors.languages}
            required
          >
            <ChipGroup
              options={LANGUAGES.map((l) => ({ value: l, label: l }))}
              selected={values.languages}
              onToggle={(v) => toggleInArray('languages', v)}
            />
          </Field>

          <Field
            label="Tecnologías que dominas"
            name="stack"
            error={errors.stack}
            required
            hint="Solo las que podrías usar hoy en un proyecto."
          >
            <ChipGroup
              options={STACK_OPTIONS.map((s) => ({ value: s, label: s }))}
              selected={values.stack}
              onToggle={(v) => toggleInArray('stack', v)}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Años trabajando con LLMs"
              name="years_with_llms"
              error={errors.years_with_llms}
            >
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={values.years_with_llms ?? ''}
                onChange={(e) =>
                  set(
                    'years_with_llms',
                    e.target.value === '' ? null : Number(e.target.value)
                  )
                }
                className={inputClass(errors.years_with_llms)}
                placeholder="2"
              />
            </Field>

            <Field
              label="¿Construyes con Claude?"
              name="claude_experience"
              error={errors.claude_experience}
              required
            >
              <select
                value={values.claude_experience}
                onChange={(e) =>
                  set(
                    'claude_experience',
                    e.target.value as ApplicationInput['claude_experience']
                  )
                }
                className={inputClass(errors.claude_experience)}
              >
                <option value="yes">Sí, ya construyo con Claude</option>
                <option value="learning">Aprendiendo activamente</option>
                <option value="no">Todavía no</option>
              </select>
            </Field>
          </div>

          <Field
            label="Portfolio / Repo (opcional pero recomendado)"
            name="portfolio_url"
            error={errors.portfolio_url}
            hint="Link a un proyecto del que estés orgulloso — GitHub, web, deployed app."
          >
            <input
              type="url"
              value={values.portfolio_url ?? ''}
              onChange={(e) => set('portfolio_url', e.target.value)}
              className={inputClass(errors.portfolio_url)}
              placeholder="https://github.com/tuusuario/proyecto"
            />
          </Field>
        </div>
      </FormSection>

      {/* ========== 3. DISPONIBILIDAD ========== */}
      <FormSection
        number="03"
        title="Disponibilidad y tarifas"
        description="Rangos — nos ayudan a hacer match con proyectos reales."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Horas semanales — mínimo"
            name="weekly_hours_min"
            hint="Cuando hay proyecto activo"
          >
            <input
              type="number"
              min={0}
              max={80}
              value={values.weekly_hours_min ?? ''}
              onChange={(e) =>
                set(
                  'weekly_hours_min',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className={inputClass(errors.weekly_hours_min)}
              placeholder="10"
            />
          </Field>
          <Field
            label="Horas semanales — máximo"
            name="weekly_hours_max"
            hint="Capacidad real sostenible"
          >
            <input
              type="number"
              min={0}
              max={80}
              value={values.weekly_hours_max ?? ''}
              onChange={(e) =>
                set(
                  'weekly_hours_max',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className={inputClass(errors.weekly_hours_max)}
              placeholder="25"
            />
          </Field>

          <Field
            label="Tarifa USD/hora — desde"
            name="hourly_rate_min_usd"
          >
            <input
              type="number"
              min={0}
              value={values.hourly_rate_min_usd ?? ''}
              onChange={(e) =>
                set(
                  'hourly_rate_min_usd',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className={inputClass(errors.hourly_rate_min_usd)}
              placeholder="50"
            />
          </Field>
          <Field
            label="Tarifa USD/hora — hasta"
            name="hourly_rate_max_usd"
          >
            <input
              type="number"
              min={0}
              value={values.hourly_rate_max_usd ?? ''}
              onChange={(e) =>
                set(
                  'hourly_rate_max_usd',
                  e.target.value === '' ? null : Number(e.target.value)
                )
              }
              className={inputClass(errors.hourly_rate_max_usd)}
              placeholder="90"
            />
          </Field>
        </div>
      </FormSection>

      {/* ========== 4. CONTEXTO LIBRE ========== */}
      <FormSection
        number="04"
        title="Cuéntanos algo real"
        description="Esto lo leemos con atención. Sin plantillas, por favor."
      >
        <div className="space-y-5">
          <Field
            label="Cuéntanos un proyecto del que estés orgulloso"
            name="summary"
            error={errors.summary}
            hint={`${values.summary.length}/500 caracteres`}
            required
          >
            <textarea
              value={values.summary}
              onChange={(e) => set('summary', e.target.value)}
              maxLength={500}
              rows={5}
              className={inputClass(errors.summary) + ' resize-y'}
              placeholder="Construí X para Y cliente. El reto fue Z. Usé Claude para... El resultado fue..."
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="¿Cómo nos conociste?"
              name="referral_source"
              error={errors.referral_source}
              required
            >
              <select
                value={values.referral_source}
                onChange={(e) => set('referral_source', e.target.value)}
                className={inputClass(errors.referral_source)}
              >
                <option value="">Selecciona…</option>
                {REFERRAL_SOURCES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Detalle (si aplica)"
              name="referral_details"
              hint="Nombre del referidor, post específico, etc."
            >
              <input
                type="text"
                value={values.referral_details ?? ''}
                onChange={(e) => set('referral_details', e.target.value)}
                className={inputClass(errors.referral_details)}
                placeholder="Opcional"
              />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* ========== SUBMIT ========== */}
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
        <p className="mb-5 text-sm leading-relaxed text-[#DDEAEE]/60">
          Al enviar, confirmas que la información es veraz. Te responderemos
          en máximo 5 días hábiles al email que diste arriba.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#AAD4AE] px-8 py-4 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#96C49C] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando aplicación…
            </>
          ) : (
            <>Enviar aplicación</>
          )}
        </button>
      </div>
    </form>
  );
}

/* ============================================================
 * Subcomponentes de presentación (mismo archivo por simplicidad)
 * ============================================================ */

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#141414] p-6 md:p-8">
      <div className="mb-6 flex items-start gap-4 border-b border-white/5 pb-5">
        <div className="font-[family-name:var(--font-jakarta)] text-2xl font-extrabold text-[#AAD4AE]/40">
          {number}
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#DDEAEE]/50">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field={name} className={className}>
      <label
        htmlFor={name}
        className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#DDEAEE]/70"
      >
        {label}
        {required && <span className="text-[#F5A05E]">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-[#F5A05E]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-[#DDEAEE]/40">{hint}</p>
      ) : null}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: ReadonlyArray<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={
              'rounded-full border px-3.5 py-1.5 text-xs font-medium transition ' +
              (active
                ? 'border-[#AAD4AE] bg-[#AAD4AE]/15 text-[#AAD4AE]'
                : 'border-white/10 bg-transparent text-[#DDEAEE]/60 hover:border-white/20 hover:text-[#DDEAEE]')
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Base class para inputs — consistente en todo el form. */
function inputClass(error?: string) {
  return (
    'w-full rounded-lg border bg-[#0A0A0A] px-4 py-2.5 text-sm text-white placeholder:text-[#DDEAEE]/30 focus:outline-none focus:ring-2 ' +
    (error
      ? 'border-[#F5A05E]/50 focus:ring-[#F5A05E]/30'
      : 'border-white/10 focus:border-[#AAD4AE]/50 focus:ring-[#AAD4AE]/20')
  );
}
