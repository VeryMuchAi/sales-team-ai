# ⚡ Quick Start - Empieza en 5 Minutos

## 📋 Checklist Rápido

### ☐ Paso 1: Variables de Entorno (2 min)

Edita `.env.local` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXX
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**¿Dónde conseguir las keys?**
- Supabase: [app.supabase.com](https://app.supabase.com) → Tu proyecto → Settings → API
- Anthropic: [console.anthropic.com](https://console.anthropic.com) → API Keys

---

### ☐ Paso 2: Base de Datos (2 min)

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Abre tu proyecto
3. Click en **SQL Editor** (en el sidebar izquierdo)
4. Copia TODO el contenido de `supabase/schema.sql`
5. Pégalo en el editor
6. Click en **RUN** (esquina inferior derecha)
7. Espera el mensaje de éxito ✅

---

### ☐ Paso 3: Whitelist de Emails (1 min)

En el mismo SQL Editor, ejecuta:

```sql
INSERT INTO public.whitelisted_emails (email) VALUES
  ('tu-email@verymuch.ai');
```

Cambia `tu-email@verymuch.ai` por tu email real.

Añade más emails si tu equipo necesita acceso:

```sql
INSERT INTO public.whitelisted_emails (email) VALUES
  ('team1@verymuch.ai'),
  ('team2@verymuch.ai');
```

---

### ☐ Paso 4: Ejecutar App (30 seg)

En tu terminal:

```bash
npm run dev
```

Abre: [http://localhost:3000](http://localhost:3000)

---

### ☐ Paso 5: Primera Prueba (2 min)

1. Ve a [http://localhost:3000/signup](http://localhost:3000/signup)
2. Regístrate con el email que whitelistaste
3. Login con tus credenciales
4. En el sidebar, click en **"Prospectos AI"** ✨
5. Completa el formulario de prueba:

```
Nombre de Empresa: Factorial HR
Sitio Web: https://factorialhr.com
Nombre del Contacto: Jordi Romero
Cargo: CEO
```

6. Click en **"Analizar Prospecto"**
7. Espera 1-2 minutos
8. ¡Revisa los resultados! 🎉

---

## ✅ Listo

Si completaste estos 5 pasos, tu herramienta está funcionando perfectamente.

---

## 🆘 ¿Algo no funciona?

### Error: "Missing ANTHROPIC_API_KEY"
→ Verifica que `.env.local` esté guardado y reinicia el servidor

### Error: "Unauthorized"
→ Verifica que tu email esté en la tabla `whitelisted_emails`

### El sitio web no carga
→ Ejecuta `npm install` y luego `npm run dev`

### El análisis falla
→ Chequea la consola del navegador y el terminal para ver el error específico

---

## 📚 Más Información

- **Guía completa de setup**: `SETUP-GUIDE.md`
- **Documentación técnica**: `README-PROSPECTOS.md`
- **Resumen del proyecto**: `PROJECT-SUMMARY.md`

---

**¡Empieza a analizar prospectos ahora!** 🚀
