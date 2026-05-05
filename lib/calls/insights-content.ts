/**
 * Static content for the Call Intelligence dashboard insight + coach sections.
 *
 * Updated manually for now. V2 will replace this with an LLM that reads the
 * underlying call records and emits these blocks dynamically.
 *
 * Last updated: 2026-04-29.
 */

export interface InsightBox {
  tag: string;
  title: string;
  body: string;
}

export interface CoachMetric {
  value: string;
  unit: string;
  insight: string;
}

export interface CoachCard {
  label: string;
  body: string;
}

export interface CoachContent {
  alert?: { title: string; body: string };
  signal?: { title: string; body: string };
  metrics: CoachMetric[];
  cards: CoachCard[];
  recommendation?: { title: string; body: string };
  verdict?: { title: string; body: string };
}

export const insightBoxes: InsightBox[] = [
  {
    tag: 'Eficiencia',
    title: 'El pipeline está creciendo más rápido que la capacidad de cierre',
    body:
      'En las últimas semanas entraron 7+ nuevos discoveries. Casi todos en estado "Discovery" sin segundo touchpoint. El cuello de botella ya no es generar interés — es convertirlo.',
  },
  {
    tag: 'Pipeline',
    title: 'ClickBalance es el deal más grande hoy',
    body:
      'CEO + Director de Marketing comprometidos, 3,000+ clientes ERP, NDA firmándose. Señales 🔥. Es el cliente ancla potencial del año.',
  },
  {
    tag: 'Conversión',
    title: '~1.5 sesiones por prospecto en promedio',
    body:
      'La velocidad de cierre sigue baja. Necesitamos un segundo touchpoint estructurado dentro de los 5 días siguientes al discovery.',
  },
  {
    tag: 'Diego',
    title: 'Diego concentra más tiempo del que debería',
    body:
      'Las llamadas con Diego (Talento/Interna) representan una porción no menor del calendario. Ojo con balance entre construir equipo vs. cerrar pipeline existente.',
  },
  {
    tag: 'Talento',
    title: 'Pipeline de talento activo en LATAM',
    body:
      'Varios candidatos en discovery distribuidos entre México, España y Argentina. Definir el rol y especialidad antes de seguir conversando.',
  },
  {
    tag: 'Geografía',
    title: 'España explotó: 4-5 prospects nuevos en 1 semana',
    body:
      'Jorge funciona como punta de lanza. Pero cada uno es vertical diferente (SaaS, joyería, agencia, contenido). Hay que decidir cuál priorizar antes de dispersarse.',
  },
  {
    tag: 'Ownership',
    title: 'Bloqueador #1: falta de casos de éxito documentados',
    body:
      'Gis Lip, Cristina Stampa y Roberto Sánchez lo pidieron explícitamente. Konfío es el caso vivo — documentarlo con métricas reales es CRÍTICO esta semana.',
  },
];

export const salesCoachContent: CoachContent = {
  alert: {
    title: '⚠️ Alerta: ClickBalance es el deal más grande del pipeline',
    body:
      'ClickBalance (3,000+ clientes ERP, CEO comprometido, NDA en proceso) tiene potencial de ser el cliente ancla. PERO el patrón de "falta de casos de éxito" sigue bloqueando: Gis Lip, Cristina Stampa y Roberto Sánchez lo pidieron explícitamente. Acción inmediata: documentar Konfío como caso de estudio con datos reales.',
  },
  metrics: [
    {
      value: '~1.5',
      unit: 'sesiones / prospecto',
      insight:
        'Velocidad de cierre sigue baja. ClickBalance y HiExperience muestran interés fuerte — priorizar segundo touchpoint rápido.',
    },
    {
      value: '3',
      unit: 'cerrados perdidos',
      insight:
        'TC SEARS, Panel Rey y ahora Centia. Roberto (Centia) dejó feedback técnico valioso sobre outbound que debe internalizarse.',
    },
  ],
  cards: [
    {
      label: '💡 Patrón dominante',
      body:
        '80% de prospectos llegan con el mismo dolor: "no tengo proceso comercial automatizado". ClickBalance quiere automatizar TODO (marketing + ventas + implementaciones) sin contratar más gente.',
    },
    {
      label: '📊 España explotó',
      body:
        'España pasó de 3 a ~8 llamadas. Nuevos prospectos: Factu Pro, Plata de Palo, Storymate, HiExperience. Jorge como punta de lanza funciona. Pero cada uno es un vertical diferente — ¿cuál priorizar?',
    },
    {
      label: '🔥 Bloqueador #1: Casos de éxito',
      body:
        'Gis Lip: "está muy por encima del presupuesto, necesito casos de éxito". Cristina Stampa: mismo bloqueador. Roberto Sánchez: "tu producto no está maduro". Solución: documentar Konfío YA.',
    },
  ],
  recommendation: {
    title: '⭐ Recomendación #1 del Coach',
    body:
      'Esta semana: (1) Enviar NDA a ClickBalance HOY — ellos quieren moverse rápido. (2) Preparar demo personalizado con su diseño de proceso post-NDA. (3) Documentar caso Konfío con métricas reales. (4) Follow-up a los 7+ leads fríos en Discovery.',
  },
};

export const pmfCoachContent: CoachContent = {
  signal: {
    title: '✅ Señal Fuerte de PMF',
    body:
      'Los prospectos siguen llegando describiendo el problema que VeryMuch.Ai resuelve sin que se les explique primero. ClickBalance: "automatizar absolutamente todo sin contratar más gente". Gis Lip: "la parte de inbound es la más floja". Demand pull confirmado.',
  },
  metrics: [
    {
      value: '5+',
      unit: 'verticales naturales',
      insight:
        'Fintech (Konfío), ERP (ClickBalance), Joyería B2C (Plata de Palo), Facturación SaaS (Factu Pro), Agencias (Storymate). El mercado prueba el producto en múltiples ángulos — señal pre-PMF típica.',
    },
    {
      value: '3',
      unit: 'productos emergentes',
      insight:
        '(1) Agentes inbound/contenido (más pedido), (2) Outbound automatizado, (3) Sales Intelligence. El riesgo: intentar los 3 a la vez.',
    },
  ],
  cards: [
    {
      label: '💰 Willingness to Pay',
      body:
        'Konfío activo con piloto real. ClickBalance mostró señales 🔥 con NDA. Gis Lip recibió propuesta de €2,450. Pero Roberto Sánchez rechazó por madurez percibida. WTP existe pero necesita prueba social.',
    },
    {
      label: '🚨 Servicio vs Producto',
      body:
        'Cada deal sigue custom: ClickBalance quiere automatización total, Gis Lip quiere 4 agentes inbound, HiExperience quiere sistema híbrido. Definir el "80% común" y empaquetarlo como producto estándar.',
    },
    {
      label: '🌍 España como mercado de expansión',
      body:
        '4-5 prospects nuevos en España en 1 semana. Jorge funciona como punta de lanza. Pero: ¿hay PMF en México primero? Lograr 3-5 clientes pagando recurrente en México antes de escalar.',
    },
  ],
  verdict: {
    title: '⭐ Veredicto PMF',
    body:
      'VeryMuch.Ai sigue en "PMF emergente" — Stage 2 de 4. Señales reforzadas: demand pull, ClickBalance 🔥, España explotando, Konfío en piloto. Alertas: 3 deals perdidos, falta caso de éxito documentado, cada deal es custom. Meta MRR: €2,500 Q2 / $5,000 Q4. Siguiente milestone: cerrar ClickBalance (deal grande) + documentar Konfío + estandarizar oferta.',
  },
};
