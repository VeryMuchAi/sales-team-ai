/**
 * Verymuch.ai — knowledge base snippets for agent system prompts.
 * Import only what each agent needs.
 */

export const VERYMUCH_IDENTITY = `
## Quiénes somos
Verymuch.ai instala agentes de IA y sistemas de automatización en los departamentos de marketing y ventas de empresas que quieren vender más con menos fricción. Todo lo que vendemos lo usamos primero internamente. Ofrecemos dos modalidades: Instalación (pago único, el cliente es dueño) y AaaS (suscripción mensual, nosotros operamos).

## Identidad adicional
- Empresa B2B de agentes de IA y automatización para marketing y ventas
- Cofundadores: Jorge Herrera (CEO, Madrid) y Edwin Moreno (COO, México)
- Diferenciadores: Todo lo que vendemos lo usamos primero / Pago por hitos verificados / IA en producción, no pilotos / Talento LATAM verificado / Precios competitivos
- Mercados: cualquier país hispanohablante o angloparlante (venta 100% en línea)
`.trim();

export const VERYMUCH_ICP = `
## Nuestro ICP (Ideal Customer Profile)
- Tamaño: 10–500 empleados
- Facturación: $500K – $50M (óptimo: $1M – $20M)
- Sector: Agnóstico, prioridad B2B y B2B2C con ciclos de venta medios (SaaS, servicios profesionales, tecnología, educación, e-commerce, salud, finanzas, inmobiliario)
- Tiene equipo comercial (mínimo 2–3 personas) pero sin especialistas en IA ni automatización
- Usa CRM (HubSpot, Pipedrive, Salesforce), email marketing y redes sociales pero no tiene agentes de IA ni automatizaciones avanzadas
- Capacidad de inversión: $2K–$15K setup + $500–$2K/mes (hispano) o $3K–$25K setup + $1K–$5K/mes (US/Anglo)

## Perfil geográfico (sin descalificación por país)
| Geografía primaria | Cualquier país hispanohablante (España, México, Colombia, Argentina, Chile, Perú, Uruguay, etc.) |
| Geografía expansión | Estados Unidos, UK, Canadá y cualquier mercado angloparlante |
| Nota | Vendemos 100% en línea. La geografía NO es factor de descalificación mientras el prospecto hable español o inglés y pueda realizar pagos internacionales |

## Anti-ICP (a quién NO vendemos)
- Microempresa sin presupuesto tech
- Empresa que busca consultoría teórica sin implementación
- Corporativo enterprise (>1.000 empleados) con ciclos de 6-12 meses
- Empresa sin CRM ni herramientas básicas
- Cazadores de precio / bargain hunters
- Solo quiere un chatbot básico sin integración

## Señales de compra que debes buscar
- Alta intención: solicita demo, pregunta por precios, menciona presupuesto aprobado, experiencia negativa con proveedor anterior
- Interés medio: publica sobre querer IA, empresa publicando ofertas para roles de IA/growth, funding reciente
- Contexto: cambio de liderazgo en marketing/ventas, expansión a nuevos mercados, sector en transformación digital

## Buyer personas principales
1. El Decisor (CEO, Founder, Director General): Le importa ROI claro, bajo riesgo, crecimiento de ingresos
2. El Influenciador (Head of Marketing, VP Sales, CMO): Le importa más leads cualificados, automatizar sin ampliar equipo, integración con su stack
3. El Emprendedor Tech-First (Fundador seed-Serie A): Early adopter, mentalidad tech-first, busca infraestructura comercial con IA desde el día uno
`.trim();

export const VERYMUCH_CATALOG = `
## Catálogo de agentes (por función)

**Captación/Inbound:**
- Radar: Monitorea señales de mercado y oportunidades. Setup €1.500-€3.000, AaaS €600-€1.000/mes
- Productor: Genera contenido (artículos, posts, emails). Setup €1.000-€3.000, AaaS €500-€800/mes
- Distribuidor: Adapta y publica contenido multicanal. Setup €1.000-€2.000, AaaS €400-€600/mes
- Clasificador: Scoring y enrutamiento de leads. Setup €1.000-€2.500, AaaS €400-€700/mes

**Outbound:**
- SDR: Prospección automatizada 24/7. Setup €2.500-€5.000, AaaS €800-€1.500/mes

**Conversión:**
- Nurturing: Secuencias de seguimiento automatizadas. Setup €1.500-€3.500, AaaS €500-€900/mes
- Conversor: Optimización de conversión con IA. Setup €2.000-€4.000, AaaS €700-€1.200/mes
- Chatbot/Asistente: Atención 24/7 web y WhatsApp. Setup €1.000-€3.000, AaaS €400-€800/mes

**Packs:**
- Starter (2-3 agentes): Setup €2.500-€8.000, AaaS €900-€2.000/mes
- Growth (4-5 agentes): Setup €5.000-€14.000, AaaS €1.600-€3.500/mes
- Scale (6+ agentes): Setup €8.000-€22.000, AaaS €2.500-€5.500/mes

## Referencia USD (orientativa)
- Conversión aproximada: 1 EUR ≈ 1,05 USD (ajusta en propuesta según fecha si es necesario)
- Packs USD orientativos: Starter setup ~$2.6K-$8.4K; Growth ~$5.2K-$14.7K; Scale ~$8.4K-$23K; mensualidades proporcionales

## Mapeo Dolor → Agente
- "No tenemos tiempo de monitorizar el mercado" → Radar
- "No damos abasto con el contenido" → Productor + Distribuidor
- "Nuestra prospección es manual" → SDR + Clasificador
- "Los leads se nos enfrían" → Clasificador + Nurturing
- "Necesitamos atención 24/7" → Chatbot
- "Queremos automatizar todo el proceso comercial" → Sistema completo (Growth o Scale)
`.trim();

export const VERYMUCH_POSITIONING = `
## Posicionamiento y garantías
- No vendemos pilotos; vendemos sistemas en producción
- Pago por hitos en modalidad Instalación
- Garantía post-entrega: 2 semanas de soporte incluido
- NDA incluido
- APIs: el cliente proporciona acceso; nosotros asesoramos qué se necesita
- Costes de APIs externas (OpenAI, Apollo, etc.) son por cuenta del cliente
`.trim();

export const VERYMUCH_MARKET = `
## Datos de mercado (usar cuando refuercen la propuesta)
- Muchas pymes priorizan marketing y ventas como áreas para adoptar IA
- Un SDR humano puede costar $60K+/año en mercados anglosajones vs. costes recurrentes menores con agentes IA bien operados
- La automatización reduce fricción operativa y acelera tiempo de respuesta a leads
`.trim();

/** Bundles for convenience */
export const KB_PROSPECT_INTEL = [VERYMUCH_IDENTITY, VERYMUCH_ICP].join('\n\n');
export const KB_PRE_CALL_BRIEF = [VERYMUCH_IDENTITY, VERYMUCH_ICP, VERYMUCH_CATALOG].join('\n\n');
export const KB_CALL_ANALYZER = [VERYMUCH_IDENTITY, VERYMUCH_ICP, VERYMUCH_CATALOG].join('\n\n');
export const KB_PROPOSAL = [
  VERYMUCH_IDENTITY,
  VERYMUCH_ICP,
  VERYMUCH_CATALOG,
  VERYMUCH_POSITIONING,
  VERYMUCH_MARKET,
].join('\n\n');
