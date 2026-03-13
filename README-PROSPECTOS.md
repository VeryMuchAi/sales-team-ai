# Sales Intelligence Tool - verymuch.ai

Herramienta interna de inteligencia de ventas con análisis AI mediante 4 agentes especializados.

## 🚀 Stack

- **Next.js 14** (App Router)
- **Supabase** para autenticación y base de datos
- **Tailwind CSS** para estilos
- **Claude API (Anthropic SDK)** para procesamiento AI
- **shadcn/ui** componentes UI

## 🤖 Los 4 Agentes AI

### 1. The Researcher 🔍
Construye perfiles de inteligencia comprensivos:
- Productos y propuesta de valor
- Señales de crecimiento y funding
- Decision makers clave
- Tech stack
- Pain points visibles
- Perfil de la empresa

### 2. The Analyst 📊
Estratega de ventas que puntúa y prioriza:
- ICP Fit Score (1-10)
- Timing Score (1-10)
- Mejor ángulo de outreach
- Objeciones potenciales
- Likelihood de presupuesto
- Prioridad: HOT / WARM / COLD

### 3. The Writer ✉️
Copywriter experto en outreach personalizado:
- Mensaje de LinkedIn (<200 chars)
- Cold email con CTA claro
- Follow-up email (ángulo diferente)
- **Todo en español**

### 4. The Coordinator 📋
Coordinador que sintetiza todo en plan accionable:
- Executive summary
- Secuencia de outreach
- Prioridad de canales
- Timeline sugerido
- Talking points
- Resumen de hallazgos

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` con:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...

# OpenAI (opcional, para features existentes)
OPENAI_API_KEY=sk-...
```

### 2. Base de Datos Supabase

Ejecuta el script SQL en el editor SQL de Supabase:

```bash
cat supabase/schema.sql
```

Esto creará las tablas:
- `profiles` - Perfiles de usuarios
- `whitelisted_emails` - Emails permitidos del equipo
- `prospects` - Prospectos analizados
- `agent_results` - Resultados de los 4 agentes
- `icps` y `leads` - Features existentes

### 3. Whitelist de Emails

Para permitir que tu equipo se registre, añade sus emails a la tabla:

```sql
INSERT INTO public.whitelisted_emails (email) VALUES
  ('tu@verymuch.ai'),
  ('team@verymuch.ai');
```

### 4. Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📱 Uso

### Analizar un Prospecto

1. Login en `/login`
2. Navega a **"Prospectos AI"** en el sidebar
3. Completa el formulario:
   - **Nombre de empresa** (requerido)
   - Sitio web
   - Contacto y cargo
   - LinkedIn URL
   - Notas adicionales
4. Click en **"Analizar Prospecto"**
5. Espera 1-2 minutos mientras los 4 agentes trabajan en secuencia
6. Revisa los resultados en 4 tabs:
   - 🔍 Research
   - 📊 Analysis
   - ✉️ Outreach
   - 📋 Action Plan

### Ver Historial

- Click en **"Ver Historial"** desde la página de resultados
- O navega a `/dashboard/prospectos/historial`
- Búsqueda y filtros disponibles
- Exporta a CSV con todos los prospectos
- Click en "Ver Detalles" para revisar cualquier análisis anterior

## 🎨 Diseño

- **Dark mode** por defecto
- **Color primario**: Púrpura (#7C3AED) - marca verymuch.ai
- Responsive y mobile-friendly
- UI en español

## 🔐 Autenticación

- Solo emails whitelisted pueden registrarse
- Email/password login via Supabase Auth
- Rutas protegidas con middleware
- RLS (Row Level Security) activado en todas las tablas

## 📊 Flujo del Pipeline

```
Usuario ingresa datos
       ↓
1. Fetch website content (cheerio)
       ↓
2. Research Agent → perfil completo
       ↓
3. Analysis Agent → scores y estrategia
       ↓
4. Outreach Agent → 3 mensajes en español
       ↓
5. Coordinator Agent → plan de acción
       ↓
Guardado en Supabase + UI con tabs
```

## 🚨 Notas Importantes

- El modelo usado es **claude-opus-4-20250514** (el más potente)
- Cada análisis completo toma ~1-2 minutos
- Los mensajes de outreach son en español neutro
- La app guarda todo en Supabase para historial
- Copy-to-clipboard en todos los outputs

## 📝 Tipos de TypeScript

Los tipos principales están definidos inline en cada componente/API route.

## 🐛 Debugging

- Check browser console para errores de cliente
- Check terminal/logs para errores de API
- Verifica que ANTHROPIC_API_KEY esté configurada
- Asegúrate que las tablas de Supabase estén creadas
- Verifica que el usuario esté whitelisted

## 📚 Recursos

- [Anthropic API Docs](https://docs.anthropic.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Desarrollado para verymuch.ai** 🚀
