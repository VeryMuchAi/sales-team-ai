import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Users,
  Check,
  X,
  Sparkles,
  Utensils,
  Stethoscope,
  ShieldCheck,
  Server,
  FileQuestion,
  Hourglass,
  ClipboardCheck,
  AtSign,
  Unlock,
} from 'lucide-react';
import { HubNav } from '@/components/hub/HubNav';
import { VerymuchLogo } from '@/components/brand/VerymuchLogo';

/**
 * Landing pública del Verymuch.ai Hub.
 * Server component, dark mode, alineado visualmente con www.verymuch.ai:
 *  - Fondo #0f0f0f (match con main site)
 *  - Botones rounded-lg (no pill)
 *  - Cards rounded-xl (moderado)
 *  - Titulares white sólido, sin text-gradient
 *  - Glows decorativos sutiles
 *
 * Reenfoque (commit: realign copy to real talent pains):
 *  El Hub NO es un canal de adquisición de clientes. Es un programa de
 *  certificación + comunidad + contexto técnico para talento que ya
 *  construye. El pipeline de proyectos es una consecuencia, no el producto.
 */
export default function HubLandingPage() {
  return (
    <>
      <HubNav />

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        {/* Glows sutiles (alineados al look minimalist de verymuch.ai) */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#AAD4AE]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#F5A05E]/[0.06] blur-3xl" />

        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#AAD4AE]/30 bg-[#AAD4AE]/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#AAD4AE]">
              <Sparkles className="h-3.5 w-3.5" />
              Claude Certified Architect Program
            </div>

            <h1 className="font-[family-name:var(--font-jakarta)] text-5xl font-extrabold leading-[1.05] tracking-tight text-white md:text-7xl">
              Construir solo
              <br />
              <span className="text-[#AAD4AE]">tiene techo.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#DDEAEE]/70 md:text-xl">
              Si ya pones sistemas con Claude en producción y el siguiente
              nivel técnico no llega leyendo docs de noche — este es tu grupo.
              Certificación oficial Anthropic, code reviews con otros CCAs, y
              proyectos con scope cerrado cuando haya match de stack.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/hub/apply"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#AAD4AE] px-7 py-3.5 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#96C49C]"
              >
                Aplicar al programa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
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
                Equipo técnico detrás
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================== MANIFIESTO + 3 DOLORES ======================== */}
      <section className="border-y border-white/5 bg-[#141414]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-[family-name:var(--font-jakarta)] text-3xl font-extrabold leading-[1.15] tracking-tight text-white md:text-5xl">
              Emprendedores que construyen,
              <br />
              <span className="text-[#AAD4AE]">
                no vendedores que prometen.
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#DDEAEE]/60 md:text-xl">
              Pero construir solo tiene límites. Estos son los que conocemos.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Server,
                title: 'Construyes solo.',
                body: 'Tu VPS, tus deploys, tus code reviews contigo mismo. El siguiente nivel técnico no llega leyendo docs en la noche.',
              },
              {
                icon: FileQuestion,
                title: 'Clientes con scope irreal.',
                body: '“Quiero un ChatGPT pero para mi empresa.” Traducir eso te toma más que construirlo. Y nadie te paga por traducir.',
              },
              {
                icon: Hourglass,
                title: 'Ventana de certificación abierta.',
                body: 'El examen CCA existe hace un mes. Los primeros 200 certificados en hispano van a marcar el mercado. La ventana se está cerrando.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-white/5 bg-[#1a1a1a] p-6 transition hover:border-white/10"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#F5A05E]/20 bg-[#F5A05E]/5 text-[#F5A05E]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#DDEAEE]/60">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="font-[family-name:var(--font-jakarta)] text-xl font-semibold leading-snug text-white md:text-2xl">
              Verymuch.ai no te quita la independencia.
              <br />
              <span className="text-[#AAD4AE]">
                Te da el contexto que te falta.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ============================ BENEFICIOS ============================ */}
      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Qué obtienes como Talento Certificado
          </h2>
          <p className="mt-4 text-lg text-[#DDEAEE]/60">
            Construido para gente que ya construye.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Comunidad técnica seria',
              body: 'Slack interno con los demás CCAs. Code reviews reales, no Stack Overflow. Edwin y Jorge participan. Llevas cada decisión de arquitectura a gente que ya resolvió lo mismo.',
              accent: 'mint',
            },
            {
              icon: Award,
              title: 'Certificación oficial Anthropic',
              body: 'Examen Claude Certified Architect pagado por nosotros (USD $200). Los 13 cursos de Anthropic Academy incluidos. El badge va a tu nombre, no al nuestro.',
              accent: 'mint',
            },
            {
              icon: ClipboardCheck,
              title: 'Proyectos con scope cerrado',
              body: 'Cuando llega proyecto, llega definido: scope acordado, hitos claros, presupuesto pre-cerrado. No traduces expectativas. No persigues pagos. Construyes lo que vale.',
              accent: 'amber',
            },
            {
              icon: ShieldCheck,
              title: 'Pago por hitos con garante',
              body: 'Cobramos al cliente por adelantado. Te pagamos por hito entregado. Sin “te pago cuando me pague el cliente”. Pagos por Stripe Connect.',
              accent: 'mint',
            },
            {
              icon: AtSign,
              title: 'Identidad @hub.verymuch.ai',
              body: 'Email corporativo y listing en el directorio oficial de arquitectos certificados. Apareces como quien eres.',
              accent: 'ice',
            },
            {
              icon: Unlock,
              title: 'Sin exclusividad',
              body: 'Sigues con tus clientes, tu producto propio, tus otros freelances. Solo pedimos derecho de preferencia cuando haya match de stack y disponibilidad.',
              accent: 'amber',
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
                className="group rounded-xl border border-white/5 bg-[#1a1a1a] p-6 transition hover:border-white/10"
              >
                <div
                  className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border ${accentClasses}`}
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
        className="border-y border-white/5 bg-[#141414]"
      >
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Cómo funciona
            </h2>
            <p className="mt-4 text-lg text-[#DDEAEE]/60">
              De aplicar a estar construyendo con el grupo en ~10 semanas.
            </p>
          </div>

          <ol className="mt-16 space-y-4">
            {[
              {
                num: '01',
                title: 'Aplicas',
                time: '5 minutos',
                body: 'Llenas el formulario. Nos cuentas tu stack, qué has construido con Claude, y qué te frena hoy.',
              },
              {
                num: '02',
                title: 'Evaluamos',
                time: '5 días hábiles',
                body: 'Revisamos con rubric técnico. Si hay fit claro, avanzas directo. Si no hay fit ahora, te decimos qué te falta para el siguiente ciclo.',
              },
              {
                num: '03',
                title: 'Entrevista 1:1',
                time: '30 minutos',
                body: 'Call con Edwin o Jorge. Conversamos sobre cómo construyes hoy, qué te frena, y si este entorno encaja contigo.',
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
                body: 'Completas los 13 cursos y pasas el examen CCA. Nosotros cubrimos el costo. Te acompañamos en la preparación — no es examen de librería abierta.',
              },
              {
                num: '06',
                title: 'Empiezas a construir',
                time: 'Desde día 60',
                body: 'Activo en la comunidad, code reviews, canales con founders. Cuando hay proyecto con tu stack, llega con scope cerrado. El valor no espera al primer cliente.',
              },
            ].map(({ num, title, time, body }) => (
              <li
                key={num}
                className="flex gap-6 rounded-xl border border-white/5 bg-[#1a1a1a] p-6 transition hover:border-white/10"
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
          <div className="rounded-xl border border-[#AAD4AE]/20 bg-[#AAD4AE]/5 p-8">
            <h3 className="mb-6 font-[family-name:var(--font-jakarta)] text-2xl font-bold text-white">
              Sí, si…
            </h3>
            <ul className="space-y-4">
              {[
                'Ya construyes con Claude API o MCP en producción, no solo tutoriales',
                'Tienes clientes o producto propio, pero te falta un equipo técnico detrás',
                'Quieres certificarte oficialmente antes de que la ventana de ser temprano se cierre',
                'Valoras comunidad técnica seria por encima de más leads',
                'Hablas ES y EN con fluidez técnica',
                'Operas desde ES, MX, CO, LATAM o US Hispanic',
                'Disponible 10-20 h/semana cuando hay proyecto que encaje',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-[#DDEAEE]/80">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#AAD4AE]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#F5A05E]/20 bg-[#F5A05E]/5 p-8">
            <h3 className="mb-6 font-[family-name:var(--font-jakarta)] text-2xl font-bold text-white">
              No, si…
            </h3>
            <ul className="space-y-4">
              {[
                'No has tocado Claude API ni construido un agente en producción real',
                'Buscas una plataforma tipo marketplace que te consiga leads',
                'Esperas proyectos constantes sin que haya match de stack o disponibilidad',
                'No tienes ancho de banda para code reviews, war stories, o aprender en público',
                'Solo quieres el badge de CCA para tu LinkedIn, sin construir con nosotros',
                'Prefieres trabajar aislado sin compartir arquitectura ni decisiones',
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

      {/* ============================ POR QUÉ VERYMUCH.AI ============================ */}
      <section className="border-t border-white/5 bg-[#141414]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Por qué Verymuch.ai
            </h2>
            <p className="mt-6 text-lg text-[#DDEAEE]/60">
              Si vas a poner tu certificación bajo nuestra marca,
              es razonable que sepas quiénes somos.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Utensils,
                title: 'Comemos nuestra propia comida',
                body: 'Todo lo que vendemos lo usamos primero internamente. No recomendamos lo que no hemos construido.',
              },
              {
                icon: Stethoscope,
                title: 'Consultoría + implementación',
                body: 'Primero diagnosticamos dónde hay dolor real. Luego implementamos donde más importa. Nada de propuestas genéricas.',
              },
              {
                icon: ShieldCheck,
                title: 'Garante del cliente',
                body: 'Pago por hitos, supervisión de entregas. El cliente nunca está solo. Y tú tampoco.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-white/5 bg-[#1a1a1a] p-6 transition hover:border-white/10"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#AAD4AE]/20 bg-[#AAD4AE]/5 text-[#AAD4AE]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-white">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#DDEAEE]/60">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-16 max-w-2xl text-center text-base italic leading-relaxed text-[#DDEAEE]/50 md:text-lg">
            “Instalamos agentes de IA y sistemas de automatización para que
            las empresas{' '}
            <span className="text-[#AAD4AE] not-italic">
              vendan más con menos fricción.
            </span>
            ”
          </p>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="border-t border-white/5 bg-[#141414]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="mt-16 space-y-3">
            {[
              {
                q: '¿Por qué no es un marketplace?',
                a: 'Porque el producto es la certificación y la comunidad técnica — no un board de proyectos. No te vamos a enviar 3 leads a la semana. Cuando hay proyecto que encaja con tu stack, lo ofrecemos al CCA con mejor fit. Si buscas un flujo constante de trabajo garantizado, hay plataformas como Toptal para eso — esto no lo es.',
              },
              {
                q: '¿Qué nivel técnico esperan para pasar el filtro?',
                a: 'Experiencia real con Claude API o MCP. Puede ser vía N8N llamando a la API, no requerimos ser Python/TypeScript senior. Lo que sí requerimos: que hayas puesto algo en producción — con usuarios reales, no un demo en tu máquina. Si has construido aunque sea un agente funcional que alguien usa, hay base para conversar.',
              },
              {
                q: '¿Cuánta dedicación mensual esperan?',
                a: 'Mínimo: participación activa en la comunidad (Slack, reviews ocasionales), aún sin proyecto asignado. Los proyectos son opcionales — algunos CCAs están en el grupo por la comunidad y certificación, sin tomar proyectos propios. Si no entras al Slack por 4 semanas seguidas, asumimos que perdiste interés.',
              },
              {
                q: '¿Puedo tener otros clientes o mi propio producto?',
                a: 'Sí, y de hecho lo preferimos. El Acuerdo es no-exclusivo. Varios del equipo tienen producto propio en paralelo o cartera de clientes fuera de Verymuch.ai. Solo pedimos derecho de preferencia: cuando tenemos un proyecto activo contigo y hay conflicto de horas, prioridad al nuestro mientras dure el compromiso firmado.',
              },
              {
                q: '¿Qué stack trabajamos y desde dónde?',
                a: 'Claude API, MCP, Claude Code, Anthropic SDK, N8N, Supabase, Next.js, Python. Proyectos de IA aplicada a sales, marketing, operaciones y soporte en empresas de mercado medio. Priorizamos ES, MX, CO y países de habla hispana. Lo que realmente importa: horarios compatibles con clientes de LATAM/ES y comunicación fluida en ES + EN.',
              },
              {
                q: '¿Y si no llega proyecto rápido?',
                a: 'El valor del programa no depende del pipeline. Entras a la comunidad, completas la certificación, haces reviews con otros CCAs, accedes a canales con founders. Si en 4-8 semanas post-certificación no ha aparecido un match, quedas en la lista de preferencia del siguiente cliente que cierre. Mientras, construyes y aprendes.',
              },
              {
                q: '¿Cuánto se paga por proyecto?',
                a: 'Depende del scope y el stack. La tarifa se define por hito y se firma antes de arrancar. Rangos típicos: USD $40-$120/hora efectiva, según el rol (builder vs. arquitecto solution). Pago en USD vía Mercury o transferencia local. Verymuch.ai cobra al cliente por adelantado y libera por hito entregado.',
              },
              {
                q: '¿Qué pasa si no paso el examen CCA?',
                a: 'Segunda oportunidad sin costo. Si en el segundo intento tampoco pasa, sales del programa sin penalización ni deuda. El examen es desafiante, pero con los 13 cursos completos y preparación guiada por el equipo, la tasa de aprobación es alta.',
              },
              {
                q: '¿Qué tan serio es esto?',
                a: 'La meta es tener 10+ CCAs bajo verymuch.ai para mediados de 2026, como condición para ser Claude Partner oficial de Anthropic. No es un side-project. Es infraestructura core del negocio. Los founders leen cada aplicación. Los founders entrevistan. Los founders están en el Slack.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-xl border border-white/5 bg-[#1a1a1a] transition hover:border-white/10 open:border-[#AAD4AE]/20"
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
        <div className="relative overflow-hidden rounded-2xl border border-[#AAD4AE]/20 bg-gradient-to-br from-[#1a1a1a] to-[#202020] p-12 text-center md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#AAD4AE]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#F5A05E]/[0.06] blur-3xl" />

          <div className="relative">
            <h2 className="font-[family-name:var(--font-jakarta)] text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Deja de construir{' '}
              <span className="text-[#AAD4AE]">solo</span>.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[#DDEAEE]/70">
              Certifícate con Anthropic. Entra a la comunidad. Trabaja con
              proyectos de scope cerrado cuando haya match. 5 minutos para
              aplicar. Respuesta en 5 días hábiles.
            </p>
            <div className="mt-10">
              <Link
                href="/hub/apply"
                className="group inline-flex items-center gap-2 rounded-lg bg-[#AAD4AE] px-8 py-4 text-base font-semibold text-[#0A0A0A] transition hover:bg-[#96C49C]"
              >
                Aplicar al programa
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t border-white/5 bg-[#0f0f0f]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-[1fr_auto]">
            <div className="max-w-md">
              <VerymuchLogo variant="dark" size="md" />
              <p className="mt-5 text-sm leading-relaxed text-[#DDEAEE]/60">
                Instalamos agentes de IA y sistemas de automatización
                para que las empresas{' '}
                <span className="text-[#DDEAEE]/90">
                  vendan más con menos fricción.
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm md:items-end">
              <a
                href="mailto:talento@verymuch.ai"
                className="text-[#DDEAEE]/70 transition hover:text-white"
              >
                talento@verymuch.ai
              </a>
              <a
                href="https://verymuch.ai"
                className="text-[#DDEAEE]/70 transition hover:text-white"
              >
                verymuch.ai
              </a>
            </div>
          </div>

          <div className="mt-12 border-t border-white/5 pt-6">
            <p className="text-xs text-[#DDEAEE]/40">
              © 2026 Verymuch.ai · Construido en Madrid + CDMX
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
