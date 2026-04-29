import Link from 'next/link';
import {
  ArrowRight,
  Award,
  Users,
  Check,
  X,
  Utensils,
  Stethoscope,
  ShieldCheck,
  Server,
  FileQuestion,
  Hourglass,
  ClipboardCheck,
  AtSign,
  Unlock,
  BookOpen,
} from 'lucide-react';
import { HubNav } from '@/components/hub/HubNav';
import { VerymuchLogo } from '@/components/brand/VerymuchLogo';

/**
 * Landing pública del Verymuch.ai Hub.
 * Night mode · Brand system Verymuch.ai v2:
 *   - Fondo vm-ink #151514 · cards vm-ink-raised #1D1D1C
 *   - Bordes vm-ink-line #2A2A28
 *   - Texto: #F0EEE8 / #D8D2C2 / #9A958A
 *   - Eyebrows: JetBrains Mono, #ACEDEB, uppercase, tracking 0.14em
 *   - Display: Inter 800, tracking -0.045em
 *   - Gradiente firma: max 1 uso por sección (en headline keyword del hero)
 *   - Botones primarios: gradient wash soft + hover gradient completo
 *
 * Copy alineado al Claude Partner Network (CPN):
 *   - Programa: Claude Certified Architect Foundations (CCAF)
 *   - Path: CPN Learning Path = 4 cursos de Anthropic Academy
 *   - Meta: 10 builders certificados = condición CPN
 */
export default function HubLandingPage() {
  return (
    <>
      <HubNav />

      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden">
        {/* Glows radiales difuminados (brand: solo radiales, opacity 0.08–0.28) */}
        <div
          className="pointer-events-none absolute -left-60 top-0 h-[500px] w-[500px] rounded-full blur-[140px]"
          style={{
            background:
              'radial-gradient(circle, rgba(172,237,235,0.16) 0%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(218,184,130,0.10) 0%, transparent 70%)',
          }}
        />

        <div className="mx-auto max-w-6xl px-6 py-24 md:py-36">
          <div className="mx-auto max-w-4xl text-center">
            {/* Eyebrow — JetBrains Mono */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[#ACEDEB]/20 bg-[#ACEDEB]/5 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ACEDEB]" />
              <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#ACEDEB]">
                Claude Partner Network · CCAF · 10 plazas
              </span>
            </div>

            {/* Headline — Inter 800 · 1 palabra en gradient firma */}
            <h1 className="font-[family-name:var(--font-inter)] text-5xl font-extrabold leading-[1.05] tracking-[-0.045em] text-[#F0EEE8] md:text-7xl">
              Construir solo
              <br />
              tiene{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #ACEDEB 0%, #BCDAC7 35%, #D7CCA0 65%, #DAB882 100%)',
                }}
              >
                techo.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#D8D2C2] md:text-xl">
              Verymuch.ai fue aprobado para iniciar el camino al Claude Partner
              Network. Necesitamos 10 builders certificados CCAF. Si ya pones
              sistemas con Claude en producción, este es tu grupo.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/hub/apply"
                className="group inline-flex items-center gap-2 rounded-[10px] border border-white/[0.14] bg-[linear-gradient(90deg,rgba(172,237,235,0.12)_0%,rgba(188,218,199,0.12)_35%,rgba(215,204,160,0.12)_65%,rgba(218,184,130,0.12)_100%)] px-7 py-3.5 text-sm font-semibold text-[#F0EEE8] transition-all duration-200 hover:bg-[linear-gradient(90deg,#ACEDEB_0%,#BCDAC7_35%,#D7CCA0_65%,#DAB882_100%)] hover:text-[#151514]"
              >
                Aplicar al programa
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-[10px] border border-[#2A2A28] px-7 py-3.5 text-sm font-semibold text-[#D8D2C2] transition hover:border-[#ACEDEB]/25 hover:bg-[#ACEDEB]/5 hover:text-[#F0EEE8]"
              >
                Cómo funciona
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {[
                '4 cursos · CPN Learning Path',
                '10 plazas en el programa',
                'Camino a Claude Partner',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.10em] text-[#9A958A]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#ACEDEB]/50" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MANIFIESTO + 3 DOLORES ==================== */}
      <section className="border-y border-[#2A2A28] bg-[#1D1D1C]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#ACEDEB]">
              Por qué existe esto
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-inter)] text-3xl font-extrabold leading-[1.15] tracking-[-0.025em] text-[#F0EEE8] md:text-5xl">
              Emprendedores que construyen,
              <br />
              no vendedores que prometen.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[#9A958A] md:text-xl">
              Pero construir solo tiene límites. Estos son los que conocemos.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Server,
                title: 'Construyes solo.',
                body: 'Tu VPS, tus deploys, tus code reviews contigo mismo. El siguiente nivel técnico no llega leyendo docs de noche.',
              },
              {
                icon: FileQuestion,
                title: 'Clientes con scope irreal.',
                body: '"Quiero un ChatGPT pero para mi empresa." Traducir eso te toma más que construirlo. Y nadie te paga por traducir.',
              },
              {
                icon: Hourglass,
                title: 'Ventana de certificación abierta.',
                body: 'El CPN Learning Path existe. Los primeros CCAF certificados en hispano van a marcar el mercado. La ventana se está cerrando.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-[14px] border border-[#2A2A28] bg-[#151514] p-6 transition hover:border-[#ACEDEB]/15"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#DAB882]/20 bg-[#DAB882]/5 text-[#DAB882]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-[#F0EEE8]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9A958A]">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="font-[family-name:var(--font-inter)] text-xl font-semibold leading-snug text-[#F0EEE8] md:text-2xl">
              Verymuch.ai no te quita la independencia.
              <br />
              <span className="text-[#ACEDEB]">
                Te da el contexto que te falta.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* ======================= BENEFICIOS ======================= */}
      <section id="beneficios" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#ACEDEB]">
            Qué obtienes
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-inter)] text-4xl font-extrabold tracking-[-0.025em] text-[#F0EEE8] md:text-5xl">
            Talento Certificado CCAF
          </h2>
          <p className="mt-4 text-lg text-[#9A958A]">
            Construido para gente que ya construye.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Comunidad técnica seria',
              body: 'Slack interno con los demás CCAF. Code reviews reales. Edwin y Jorge participan. Llevas cada decisión de arquitectura a gente que ya resolvió lo mismo.',
              teal: true,
            },
            {
              icon: BookOpen,
              title: 'CCAF oficial Anthropic',
              body: 'Los 4 cursos del CPN Learning Path y el examen CCAF cubiertos por Verymuch.ai. El badge va a tu nombre, no al nuestro.',
              teal: true,
            },
            {
              icon: ClipboardCheck,
              title: 'Proyectos con scope cerrado',
              body: 'Scope acordado, hitos claros, presupuesto pre-cerrado. No traduces expectativas. No persigues pagos. Construyes lo que vale.',
              teal: false,
            },
            {
              icon: ShieldCheck,
              title: 'Pago por hitos con garante',
              body: 'Cobramos al cliente por adelantado. Te pagamos por hito entregado. Sin "te pago cuando me pague el cliente". Pagos vía Stripe Connect.',
              teal: true,
            },
            {
              icon: AtSign,
              title: 'Identidad @hub.verymuch.ai',
              body: 'Email corporativo y listing en el directorio oficial de arquitectos certificados. Apareces como quien eres.',
              teal: false,
            },
            {
              icon: Unlock,
              title: 'Sin exclusividad',
              body: 'Sigues con tus clientes, tu producto propio, tus otros freelances. Solo pedimos derecho de preferencia cuando haya match de stack y disponibilidad.',
              teal: false,
            },
          ].map(({ icon: Icon, title, body, teal }) => (
            <div
              key={title}
              className="group rounded-[14px] border border-[#2A2A28] bg-[#1D1D1C] p-6 transition hover:border-[#ACEDEB]/20"
            >
              <div
                className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[10px] border ${
                  teal
                    ? 'border-[#ACEDEB]/20 bg-[#ACEDEB]/5 text-[#ACEDEB]'
                    : 'border-[#DAB882]/20 bg-[#DAB882]/5 text-[#DAB882]'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-[#F0EEE8]">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9A958A]">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ====================== CÓMO FUNCIONA ====================== */}
      <section
        id="como-funciona"
        className="border-y border-[#2A2A28] bg-[#1D1D1C]"
      >
        <div className="mx-auto max-w-4xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#ACEDEB]">
              El proceso
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-inter)] text-4xl font-extrabold tracking-[-0.025em] text-[#F0EEE8] md:text-5xl">
              Cómo funciona
            </h2>
            <p className="mt-4 text-lg text-[#9A958A]">
              De aplicar a construir con el grupo en ~10 semanas.
            </p>
          </div>

          <ol className="mt-16 space-y-3">
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
                body: 'Revisamos con rúbrica técnica. Si hay fit claro, avanzas. Si no, te decimos qué te falta para el siguiente ciclo.',
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
                body: 'Firmas Acuerdo de Talento y NDA. Recibes acceso al CPN Learning Path (4 cursos Anthropic Academy) y tu email @hub.verymuch.ai.',
              },
              {
                num: '05',
                title: 'Certificación CCAF',
                time: '≤8 semanas',
                body: 'Completas los 4 cursos del CPN Learning Path y pasas el examen CCAF. Verymuch.ai cubre el costo. Te acompañamos en la preparación.',
              },
              {
                num: '06',
                title: 'Empiezas a construir',
                time: 'Desde día 60',
                body: 'Activo en la comunidad, code reviews, canales con founders. Cuando hay proyecto con tu stack, llega con scope cerrado y pago definido.',
              },
            ].map(({ num, title, time, body }) => (
              <li
                key={num}
                className="flex gap-6 rounded-[14px] border border-[#2A2A28] bg-[#151514] p-6 transition hover:border-[#ACEDEB]/15"
              >
                <div className="flex-shrink-0">
                  <div className="font-[family-name:var(--font-inter)] text-4xl font-extrabold text-[#ACEDEB]/20">
                    {num}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-[#F0EEE8]">
                      {title}
                    </h3>
                    <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.10em] text-[#ACEDEB]">
                      {time}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#9A958A]">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ========================= PARA QUIÉN ========================= */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#ACEDEB]">
            Honestidad brutal
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-inter)] text-4xl font-extrabold tracking-[-0.025em] text-[#F0EEE8] md:text-5xl">
            ¿Es para ti?
          </h2>
          <p className="mt-4 text-lg text-[#9A958A]">
            Si cualquiera de la columna derecha te describe, esto no va a
            funcionar.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Sí */}
          <div className="rounded-[16px] border border-[#ACEDEB]/20 bg-[#ACEDEB]/5 p-8">
            <h3 className="mb-6 font-[family-name:var(--font-inter)] text-2xl font-bold text-[#F0EEE8]">
              Sí, si...
            </h3>
            <ul className="space-y-4">
              {[
                'Ya construyes con Claude API o MCP en producción, no solo tutoriales',
                'Tienes clientes o producto propio, pero te falta un equipo técnico detrás',
                'Quieres certificarte CCAF antes de que la ventana de ser temprano se cierre',
                'Valoras comunidad técnica seria por encima de más leads',
                'Hablas ES y EN con fluidez técnica',
                'Operas desde ES, MX, CO, LATAM o US Hispanic',
                'Disponible 10-20 h/semana cuando hay proyecto que encaje',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-[#D8D2C2]">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#ACEDEB]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* No */}
          <div className="rounded-[16px] border border-[#DAB882]/20 bg-[#DAB882]/5 p-8">
            <h3 className="mb-6 font-[family-name:var(--font-inter)] text-2xl font-bold text-[#F0EEE8]">
              No, si...
            </h3>
            <ul className="space-y-4">
              {[
                'No has tocado Claude API ni construido un agente en producción real',
                'Buscas una plataforma tipo marketplace que te consiga leads',
                'Esperas proyectos constantes sin que haya match de stack o disponibilidad',
                'No tienes ancho de banda para code reviews, war stories, o aprender en público',
                'Solo quieres el badge CCAF para tu LinkedIn, sin construir con nosotros',
                'Prefieres trabajar aislado sin compartir arquitectura ni decisiones',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-[#D8D2C2]">
                  <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#DAB882]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* =================== POR QUÉ VERYMUCH.AI =================== */}
      <section className="border-t border-[#2A2A28] bg-[#1D1D1C]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#ACEDEB]">
              Quiénes somos
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-inter)] text-4xl font-extrabold tracking-[-0.025em] text-[#F0EEE8] md:text-5xl">
              Por qué Verymuch.ai
            </h2>
            <p className="mt-6 text-lg text-[#9A958A]">
              Si vas a poner tu certificación bajo nuestra marca, es razonable
              que sepas quiénes somos.
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
                className="rounded-[14px] border border-[#2A2A28] bg-[#151514] p-6 transition hover:border-[#ACEDEB]/15"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#ACEDEB]/20 bg-[#ACEDEB]/5 text-[#ACEDEB]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-[family-name:var(--font-inter)] text-xl font-bold text-[#F0EEE8]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#9A958A]">
                  {body}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-16 max-w-xl text-center text-base leading-relaxed text-[#9A958A] md:text-lg">
            "Instalamos agentes de IA y sistemas de automatización para que las
            empresas{' '}
            <span className="text-[#D8D2C2]">
              vendan más con menos fricción.
            </span>
            "
          </p>
        </div>
      </section>

      {/* ========================= FAQ ========================= */}
      <section id="faq" className="border-t border-[#2A2A28]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#ACEDEB]">
              Preguntas frecuentes
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-inter)] text-4xl font-extrabold tracking-[-0.025em] text-[#F0EEE8] md:text-5xl">
              Resolvemos las dudas
            </h2>
          </div>

          <div className="mt-16 space-y-2">
            {[
              {
                q: '¿Qué es el CCAF y por qué importa?',
                a: 'CCAF es Claude Certified Architect Foundations, la certificación oficial de Anthropic para builders que trabajan con Claude en producción. Se obtiene completando el CPN Learning Path (4 cursos de Anthropic Academy) y pasando el examen. Verymuch.ai cubre el costo íntegro. El badge va a tu nombre y te posiciona como uno de los primeros CCAF certificados en habla hispana.',
              },
              {
                q: '¿Por qué no es un marketplace?',
                a: 'Porque el producto es la certificación y la comunidad técnica, no un board de proyectos. No te vamos a enviar 3 leads a la semana. Cuando hay proyecto que encaja con tu stack, lo ofrecemos al CCAF con mejor fit. Si buscas un flujo constante de trabajo garantizado, hay plataformas como Toptal para eso. Esto no lo es.',
              },
              {
                q: '¿Qué nivel técnico esperan para pasar el filtro?',
                a: 'Experiencia real con Claude API o MCP en producción. Puede ser vía N8N llamando a la API, no requerimos ser Python/TypeScript senior. Lo que sí: que hayas puesto algo que alguien usa. Un agente funcional con usuarios reales es suficiente para conversar.',
              },
              {
                q: '¿Cuánto duran los 4 cursos del CPN Learning Path?',
                a: 'A ritmo propio, entre 3 y 8 semanas. Anthropic Academy tiene los 4 cursos en formato asíncrono. Te acompañamos con sesiones de preparación para el examen final. Si llevas más de 8 semanas sin avanzar, hablamos.',
              },
              {
                q: '¿Cuánta dedicación mensual esperan?',
                a: 'Mínimo: participación activa en la comunidad (Slack, reviews ocasionales), incluso sin proyecto asignado. Los proyectos son opcionales: algunos CCAF están en el grupo por la comunidad y certificación, sin tomar proyectos propios. Si no entras al Slack por 4 semanas seguidas, asumimos que perdiste interés.',
              },
              {
                q: '¿Puedo tener otros clientes o mi propio producto?',
                a: 'Sí, y de hecho lo preferimos. El acuerdo es no-exclusivo. Varios del equipo tienen producto propio en paralelo o cartera de clientes fuera de Verymuch.ai. Solo pedimos derecho de preferencia: cuando hay proyecto activo contigo, prioridad al nuestro mientras dure el compromiso firmado.',
              },
              {
                q: '¿Qué pasa si no paso el examen CCAF?',
                a: 'Segunda oportunidad sin costo. Si en el segundo intento tampoco pasa, sales del programa sin penalización ni deuda. Con los 4 cursos completos y preparación guiada, la tasa de aprobación es alta.',
              },
              {
                q: '¿Cuánto se paga por proyecto?',
                a: 'Depende del scope y el stack. La tarifa se define por hito y se firma antes de arrancar. Rangos típicos: USD $40-$120/hora efectiva, según el rol. Pago en USD vía Mercury o transferencia local. Verymuch.ai cobra al cliente por adelantado y libera por hito entregado.',
              },
              {
                q: '¿Qué tan serio es esto?',
                a: 'La meta es tener 10 CCAF certificados bajo Verymuch.ai como condición para acceder al Claude Partner Network. Anthropic nos aprobó el inicio del camino. No es un side-project. Es infraestructura core del negocio. Los founders leen cada aplicación, entrevistan, y están en el Slack.',
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-[14px] border border-[#2A2A28] bg-[#1D1D1C] transition open:border-[#ACEDEB]/20"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left">
                  <span className="font-[family-name:var(--font-inter)] text-base font-semibold text-[#F0EEE8] md:text-lg">
                    {q}
                  </span>
                  <span className="flex-shrink-0 text-[#ACEDEB] transition group-open:rotate-45">
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
                <div className="px-6 pb-6 text-sm leading-relaxed text-[#9A958A]">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= CTA FINAL ======================= */}
      <section className="mx-auto max-w-4xl px-6 py-24">
        <div
          className="relative overflow-hidden rounded-[16px] border border-[#ACEDEB]/20 p-12 text-center md:p-16"
          style={{
            background:
              'linear-gradient(135deg, rgba(172,237,235,0.06) 0%, rgba(188,218,199,0.04) 35%, rgba(215,204,160,0.04) 65%, rgba(218,184,130,0.06) 100%)',
          }}
        >
          {/* Glow radial decorativo */}
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[80px]"
            style={{
              background:
                'radial-gradient(circle, rgba(172,237,235,0.12) 0%, transparent 70%)',
            }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-[80px]"
            style={{
              background:
                'radial-gradient(circle, rgba(218,184,130,0.08) 0%, transparent 70%)',
            }}
          />

          <div className="relative">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#ACEDEB]">
              10 plazas · Claude Partner Network
            </span>
            <h2 className="mt-4 font-[family-name:var(--font-inter)] text-4xl font-extrabold leading-tight tracking-[-0.025em] text-[#F0EEE8] md:text-5xl">
              Sé uno de los 10 que certifican
              <br />a Verymuch.ai como Claude Partner.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[#9A958A]">
              Certifícate CCAF. Entra a la comunidad. Proyectos con scope
              cerrado cuando haya match. 5 minutos para aplicar. Respuesta en 5
              días hábiles.
            </p>
            <div className="mt-10">
              <Link
                href="/hub/apply"
                className="group inline-flex items-center gap-2 rounded-[10px] border border-white/[0.14] bg-[linear-gradient(90deg,rgba(172,237,235,0.12)_0%,rgba(188,218,199,0.12)_35%,rgba(215,204,160,0.12)_65%,rgba(218,184,130,0.12)_100%)] px-8 py-4 text-base font-semibold text-[#F0EEE8] transition-all duration-200 hover:bg-[linear-gradient(90deg,#ACEDEB_0%,#BCDAC7_35%,#D7CCA0_65%,#DAB882_100%)] hover:text-[#151514]"
              >
                Aplicar al programa
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= FOOTER ========================= */}
      <footer className="border-t border-[#2A2A28] bg-[#151514]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-[1fr_auto]">
            <div className="max-w-md">
              <VerymuchLogo variant="dark" size="md" />
              <p className="mt-5 text-sm leading-relaxed text-[#9A958A]">
                Instalamos agentes de IA y sistemas de automatización para que
                las empresas{' '}
                <span className="text-[#D8D2C2]">
                  vendan más con menos fricción.
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-2 text-sm md:items-end">
              <a
                href="mailto:info@verymuch.ai"
                className="text-[#9A958A] transition hover:text-[#F0EEE8]"
              >
                info@verymuch.ai
              </a>
              <a
                href="https://verymuch.ai"
                className="text-[#9A958A] transition hover:text-[#F0EEE8]"
              >
                verymuch.ai
              </a>
            </div>
          </div>

          <div className="mt-12 border-t border-[#2A2A28] pt-6">
            <p className="font-[family-name:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.10em] text-[#9A958A]/60">
              © 2026 Verymuch.ai · Madrid + CDMX
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
