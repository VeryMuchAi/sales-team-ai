# Deploy — Sales Intelligence (Verymuch.ai)

## Opción B: subdominio `salesintelligence.verymuch.ai`

La app **no** usa `basePath`: corre en la raíz del sitio en su propio dominio/subdominio.

### 1. Vercel (org VeryMuchAi)

1. Proyecto conectado al repo `Morenazzo/sales-team-ai`.
2. **Settings → Domains** → Add `salesintelligence.verymuch.ai`.
3. Vercel mostrará el registro DNS esperado (normalmente un **CNAME**).

### 2. GoDaddy (DNS)

Crea un registro **CNAME**:

| Tipo  | Nombre / Host      | Valor / Points to     | TTL  |
| ----- | ------------------- | ----------------------- | ---- |
| CNAME | `salesintelligence` | `cname.vercel-dns.com.` | 600  |

(Exactitud del nombre: solo el subdominio, sin el dominio raíz; en GoDaddy suele ser el campo “Host” = `salesintelligence`.)

### 3. Variables de entorno en Vercel

Incluye al menos:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (si la usas en server)
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SITE_URL` = `https://salesintelligence.verymuch.ai`

Tras guardar, redeploy.

### 4. Supabase (auth)

- URL de redirect / Site URL: `https://salesintelligence.verymuch.ai` (y `http://localhost:3000` para desarrollo).
- Ejecuta en Supabase el SQL de `supabase/schema.sql` sección **Whitelist** + `additional_context` si aún no lo aplicaste.

### Nota sobre `verymuch.ai/salesintelligence` (path)

Si en el futuro quisieras la app bajo **ruta** en el dominio principal (`/salesintelligence`), haría falta `basePath` en Next.js y un proxy/rewrite en el sitio principal de verymuch.ai que apunte al deploy de Vercel. La opción subdominio evita `basePath` y suele ser más simple en Vercel.
