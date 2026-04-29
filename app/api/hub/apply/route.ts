import { NextResponse, type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { applicationSchema } from '@/lib/hub/application-schema';

/**
 * POST /api/hub/apply
 *
 * Recibe una aplicación pública del Hub, la valida con Zod y persiste
 * en `hub_applications` con status 'pending_review'.
 *
 * En esta versión (para demo a Jorge) NO hace:
 *   - evaluación con Claude (Fase 2 completa)
 *   - email de confirmación con Resend
 *   - notificación a Slack
 *   - rate limiting
 *
 * Esos quedan para el trabajo de Fase 2 en serio. El endpoint sigue siendo
 * seguro: valida todo con el schema compartido y usa service role solo
 * para el INSERT (no expone tabla al cliente).
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'invalid_json', message: 'Body inválido' },
      },
      { status: 400 }
    );
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'validation_error',
          message: 'Revisa los campos del formulario',
          issues: parsed.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
      },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Captura contexto del request (para análisis de fraude futuro)
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? null;
  const userAgent = req.headers.get('user-agent') ?? null;

  const supabase = createServiceClient();

  const { data: inserted, error } = await supabase
    .from('hub_applications')
    .insert({
      full_name: data.full_name,
      email: data.email,
      linkedin_url: data.linkedin_url,
      country: data.country,
      city: data.city,
      languages: data.languages,
      stack: data.stack,
      years_with_llms: data.years_with_llms,
      claude_experience: data.claude_experience,
      portfolio_url: data.portfolio_url || null,
      weekly_hours_min: data.weekly_hours_min,
      weekly_hours_max: data.weekly_hours_max,
      hourly_rate_min_usd: data.hourly_rate_min_usd,
      hourly_rate_max_usd: data.hourly_rate_max_usd,
      summary: data.summary,
      referral_source: data.referral_source,
      referral_details: data.referral_details || null,
      status: 'pending_review',
      source_ip: ip,
      user_agent: userAgent,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[hub/apply] insert error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'db_error',
          message:
            'No pudimos guardar tu aplicación. Intenta de nuevo en unos minutos.',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    id: inserted.id,
  });
}
