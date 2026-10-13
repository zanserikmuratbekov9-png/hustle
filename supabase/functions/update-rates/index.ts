// Ежедневное обновление курсов USD, EUR, RUB по данным Нацбанка РК.
// Вызывается по расписанию (Supabase Cron). Защита: заголовок x-cron-secret должен совпасть с секретом CRON_SECRET.
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) return new Response("forbidden", { status: 403 });

  const res = await fetch("https://nationalbank.kz/rss/rates_all.xml", { signal: AbortSignal.timeout(20000) });
  if (!res.ok) return new Response("nbk http " + res.status, { status: 502 });
  const xml = await res.text();

  const rates: Record<string, number> = {};
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const b = m[1];
    const code = b.match(/<title>\s*([A-Z]{3})\s*<\/title>/)?.[1];
    const val = parseFloat((b.match(/<description>\s*([\d.,]+)\s*<\/description>/)?.[1] ?? "").replace(",", "."));
    const quant = parseFloat(b.match(/<quant>\s*([\d.,]+)\s*<\/quant>/)?.[1] ?? "1") || 1;
    if (code && isFinite(val)) rates[code] = val / quant; // тенге за 1 единицу валюты
  }
  const { USD, EUR, RUB } = rates;
  // защита от мусора: берём только правдоподобные значения
  if (!(USD > 100 && USD < 3000) || !(EUR > 100 && EUR < 3000) || !(RUB > 0.5 && RUB < 100)) {
    return new Response("unexpected rates: " + JSON.stringify({ USD, EUR, RUB }), { status: 502 });
  }
  const date = xml.match(/<date>\s*([\d.]+)\s*<\/date>/)?.[1] ??
    new Date().toLocaleDateString("ru-RU", { timeZone: "Asia/Almaty" });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY")!,
    { auth: { persistSession: false } },
  );
  const { error } = await admin.from("content").upsert({
    key: "rates",
    value: { USD: +USD.toFixed(2), EUR: +EUR.toFixed(2), RUB: +RUB.toFixed(2), date },
    updated_at: new Date().toISOString(),
  });
  if (error) return new Response("db error: " + error.message, { status: 500 });
  return new Response(JSON.stringify({ ok: true, USD, EUR, RUB, date }), { headers: { "Content-Type": "application/json" } });
});
