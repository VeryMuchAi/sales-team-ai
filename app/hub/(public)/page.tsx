import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Briefcase,
  Coins,
  Globe,
  BookOpen,
  Users,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { HubNav } from '@/components/hub/HubNav';

/**
 * Landing pública del Verymuch.ai Hub.
 * Server component, dark mode, brand: mint + amber sobre #0A0A0A.
 * Secciones: hero · manifiesto · beneficios · cómo funciona ·
 *            para quién es/no es · FAQ · CTA final · footer.
 */
export default function HubLandingPage() {
  return (
    <>
      <HubNav />

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        {/* Mint glow top-left */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#AAD4AE]/20 blur-3xl" />
        {/* Amber glow bottom-right */}
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#F5A05E]/10 blur-3xl" />

        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#AAD4AE]/30 bg-[#AAD4AE]/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#AAD4AE]">
              <Sparkles className="h-3.5 w-3.5" />
              Claude Certified Architect Program
            </div>

            <h1 className="font-[family-name:var(--font-jakarta)] text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-7xl">
              Deja de perseguir clientes.
              <br />
              <span className="bg-gradient-to-r from-[#AAD4AE] to-[#DDEAEE] bg-clip-text text-transparent">
                Constrúyelos.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#DDEAEE]/70 md:text-xl">
              El programa Claude Certified Architect bajo Verymuch.ai.
              Certifícate en 60 días. Trabaja con clientes gestionados.
              Cobra por hitos. Tú construyes, nosotros vendemos.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/hub/apply"
                className="group inline-flex items-center gap-2 rounded-full bg-[#AAD4AE] px-7 py-3.5 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#96C49C]"
              >
                Aplicar al programa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Cómo funciona
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium uppercase tracking-wider text-[#DDEAEE]/50">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#AAD4AE]" />
                60 días hasta CCA
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#AAD4AE]" />
                Examen pagado por nosotros
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#AAD4AE]" />
                Pago por hitos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ MANIFESTO ============================ */}
      <section className="border-y border-white/5 bg-[#0D0D0D]">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold leading-snug text-white md:text-3xl">
            Hay una brecha.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[#DDEAEE]/70 md:text-xl">
            Empresas que necesitan construir con Claude.
            <br />
            Freelancers que saben hacerlo pero no quieren vender.
          </p>
          <div className="my-10 flex items-center justify-center">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#AAD4AE]/50 to-transparent" />
          </div>
          <p className="font-[family-name:var(--font-jakarta)] text-2xl font-semibold leading-snug text-white md:text-3xl">
            Nosotros la cerramos.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[#DDEAEE]/70 md:text-xl">
            Verymuch.ai vende a los clientes.
            <br />
            Tú construyes las soluciones.
            <br />
            <span className="text-[#AAD4AE]">Ambos ganamos.</span>
          </p>
        </div>
      </section>

      {/* ============================ BENEFICIOS ============================ */}
      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Qué obtienes como Talento Certificado
          </h2>
          <p className="mt-4 text-lg text-[#DDEAEE]/60">
            Todo lo que necesitas para construir sin distracciones.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Award,
              title: 'Certificación oficial',
              body: 'Examen Claude Certified Architect (USD $200) pagado por nosotros. Badge oficial de Anthropic a tu nombre.',
              accent: 'mint',
            },
            {
              icon: Briefcase,
              title: 'Clientes gestionados',
              body: 'No vendes. Nosotros traemos el cliente cerrado, con scope definido y alcance acordado.',
              accent: 'amber',
            },
            {
              icon: Coins,
              title: 'Pago por hitos',
              body: 'Cobras en cada entrega. Sin "te pago cuando cobre". Verymuch.ai es garante del pago.',
              accent: 'mint',
            },
            {
              icon: Globe,
              title: 'Listing @verymuch.ai',
              body: 'Apareces en nuestro directorio oficial como arquitecto certificado. Email corporativo @hub.verymuch.ai.',
              accent: 'ice',
            },
            {
              icon: BookOpen,
              title: 'Anthropic Academy',
              body: 'Acceso a los 13 cursos del programa CCA. Ruta clara: de cero a certificación en 60 días.',
              accent: 'amber',
            },
            {
              icon: Users,
              title: 'Comunidad interna',
              body: 'Slack con el resto del equipo y con los founders. Code reviews, war stories, mentoría directa.',
              accent: 'mint',
            },
          ].map(({ icon: Icon, title, body, accent }) => {
            const accentClasses =
              accent === 'mint'
                ? 'border-[#AAD4AE]/20 bg-[#AAD4AE]/5 text-[#AAD4AE]'
                : accent === 'amber'
                  ? 'border-[#F5A05E]/20 bg-[#F5A05E]/5 text-[#F5A05E]'
                  : 'border-[#DDEAEE]/10 bg-[#DDEAEE]/5 text-[#DDEAEE]';
            return (
              <div
                key={title}
                className="group rounded-2xl border border-white/5 bg-[#141414] p-6 transition hover:border-white/10 hover:bg-[#171717]"
              >
                <div
                  className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${accentClasses}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#DDEAEE]/60">
                  {body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================ CÓMO FUNCIONA ============================ */}
      <section
        id="como-funciona"
        className="border-y border-white/5 bg-[#0D0D0D]"
      >
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Cómo funciona
            </h2>
            <p className="mt-4 text-lg text-[#DDEAEE]/60">
              De aplicar a tu primer proyecto en ~10 semanas.
            </p>
          </div>

          <ol className="mt-16 space-y-4">
            {[
              {
                num: '01',
                title: 'Aplicas',
                time: '5 minutos',
                body: 'Llenas el formulario. Nos cuentas tu stack, experiencia con Claude y pretensiones.',
              },
              {
                num: '02',
                title: 'Evaluamos',
                time: '5 días hábiles',
                body: 'Revisamos con un rubric técnico. Si hay fit claro, avanzas directo. Si no, te decimos por qué.',
              },
              {
                num: '03',
                title: 'Entrevista 1:1',
                time: '30 minutos',
                body: 'Call con Edwin o Jorge. Alineamos expectativas, timing y tipo de proyectos ideales para ti.',
              },
              {
                num: '04',
                title: 'Onboarding',
                time: '1 semana',
                body: 'Firmas Acuerdo de Talento + NDA. Recibes tu email @hub.verymuch.ai y acceso a Academy.',
              },
              {
                num: '05',
                title: 'Certificación',
                time: '≤60 días',
                body: 'Completas los 13 cursos y pasas el examen CCA. Nosotros cubrimos el costo del examen.',
              },
              {
                num: '06',
                title: 'Primer proyecto',
                time: 'Según pipeline',
                body: 'Te asignamos a un cliente según tu stack. Scope claro, hitos claros, pago claro.',
              },
            ].map(({ num, title, time, body }) => (
              <li
                key={num}
                className="flex gap-6 rounded-2xl border border-white/5 bg-[#141414] p-6 transition hover:border-white/10"
              >
                <div className="flex-shrink-0">
                  <div className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold text-[#AAD4AE]/30">
                    {num}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white">
                      {title}
                    </h3>
                    <span className="text-xs font-medium uppercase tracking-wider text-[#AAD4AE]">
                      {time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#DDEAEE]/60">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================ PARA QUIÉN ============================ */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            ¿Es para ti?
          </h2>
          <p className="mt-4 text-lg text-[#DDEAEE]/60">
            Honestidad brutal. Si cualquiera de la columna derecha te describe,
            esto no va a funcionar.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[#AAD4AE]/20 bg-[#AAD4AE]/5 p-8">
            <h3 className="mb-6 font-[family-name:var(--font-jakarta)] text-2xl font-bold text-white">
              Sí, si…
            </h3>
            <ul className="space-y-4">
              {[
                'Eres freelance maduro con experiencia real en Claude API o MCP',
                'Prefieres construir a vender',
                'Hablas ES y EN con clientes sin fricción',
                'Tienes 10-20h/semana cuando hay proyecto',
                'Operas desde ES, MX, CO, LATAM o US Hispanic',
                'Valoras pago confiable sobre "la oportunidad"',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-[#DDEAEE]/80">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#AAD4AE]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#F5A05E]/20 bg-[#F5A05E]/5 p-8">
            <h3 className="mb-6 font-[family-name:var(--font-jakarta)] text-2xl font-bold text-white">
              No, si…
            </h3>
            <ul className="space-y-4">
              {[
                'Eres junior sin experiencia real en LLMs',
                'Buscas empleo fijo (esto es freelance)',
                'Solo quieres el badge sin construir',
                'Esperas leads exclusivos o sin compartir pipeline',
                'Nunca has tocado Claude API ni un agente',
                'Tu lenguaje es de promesas, no de entregas',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-[#DDEAEE]/80">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#F5A05E]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="border-t border-white/5 bg-[#0D0D0D]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="mt-16 space-y-3">
            {[
              {
                q: '¿Cuánto se paga por proyecto?',
                a: 'Depende del scope y el stack. La tarifa se define por hito y se firma antes de arrancar. Rangos típicos: USD $40-$120/hora efectiva, dependiendo del rol (builder puro vs arquitecto solution). Siempre pago en USD vía Mercury o transferencia local.',
              },
              {
                q: '¿Puedo seguir con mis otros clientes?',
                a: 'Sí. El Acuerdo es no-exclusivo. Lo único que pedimos es derecho de preferencia: si Verymuch.ai tiene un proyecto activo para ti y hay conflicto de horas, prioridad al nuestro mientras dure el compromiso firmado.',
              },
              {
                q: '¿Qué pasa si no paso el examen CCA?',
                a: 'Tienes una segunda oportunidad sin costo para ti. Si en el segundo intento tampoco pasas, salimos del programa sin penalización ni deuda. El examen es desafiante pero con los 13 cursos completos, la tasa de aprobación es alta.',
              },
              {
                q: '¿Qué tecnologías trabajamos?',
                a: 'Claude API, MCP (Model Context Protocol), Claude Code, Anthropic SDK, N8N, Supabase, Next.js, Python. Todos nuestros proyectos tocan IA aplicada a sales, marketing, operaciones y soporte para empresas de mercado medio.',
              },
              {
                q: '¿Desde qué país puedo aplicar?',
                a: 'Priorizamos España, México, Colombia y países de habla hispana. También aceptamos talento bilingüe en US. El criterio real no es geográfico — es que puedas trabajar en horarios compatibles con clientes de LATAM/ES y comunicar en español e inglés.',
              },
              {
                q: '¿Cuándo llega el primer proyecto?',
                a: 'Depende del pipeline activo y tu stack. Nuestra meta es que cada Talento Certificado entre a un proyecto en las 4-8 semanas post-certificación. Si el match no llega en ese plazo, te incluimos en la lista de preferencia del siguiente cliente que cierre.',
              },
              {
                q: '¿Qué tan serio es esto?',
                a: 'La meta de Verymuch.ai es tener 10+ arquitectos certificados bajo nuestro dominio para mediados de 2026, como condición para ser Claude Partner oficial de Anthropic. Esto no es un side-project nuestro — es infraestructura core del negocio.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-white/5 bg-[#141414] transition hover:border-white/10 open:border-[#AAD4AE]/20 open:bg-[#141414]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="font-[family-name:var(--font-jakarta)] text-base font-semibold text-white md:text-lg">
                    {q}
                  </span>
                  <span className="flex-shrink-0 text-[#AAD4AE] transition group-open:rotate-45">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8 3V13M3 8H13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-sm leading-relaxed text-[#DDEAEE]/70">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CTA FINAL ============================ */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-[#AAD4AE]/20 bg-gradient-to-br from-[#141414] to-[#1a1a1a] p-12 text-center md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#AAD4AE]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#F5A05E]/10 blur-3xl" />

          <div className="relative">
            <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold leading-tight text-white md:text-5xl">
              ¿Listo para dejar de vender
              <br />
              y empezar a{' '}
              <span className="text-[#AAD4AE]">construir</span>?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[#DDEAEE]/70">
              5 minutos para aplicar. Respuesta en 5 días hábiles.
              Si hay fit, arrancamos.
            </p>
            <div className="mt-10">
              <Link
                href="/hub/apply"
                className="group inline-flex items-center gap-2 rounded-full bg-[#AAD4AE] px-8 py-4 text-base font-semibold text-[#0A0A0A] transition hover:bg-[#96C49C]"
              >
                Aplicar al programa
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-[#DDEAEE]/40 md:flex-row">
            <p>© 2026 Verymuch.ai · Construido en Madrid + CDMX</p>
            <div className="flex items-center gap-6">
              <a
                href="mailto:talento@verymuch.ai"
                className="transition hover:text-[#DDEAEE]"
              >
                talento@verymuch.ai
              </a>
              <a
                href="https://verymuch.ai"
                className="transition hover:text-[#DDEAEE]"
              >
                verymuch.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
