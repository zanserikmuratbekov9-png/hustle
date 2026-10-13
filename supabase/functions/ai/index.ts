// Помощник ИИ для HUSTLE. Ключ Claude хранится только здесь (в секретах Supabase), в сайт он не попадает.
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-sonnet-5-5";
const LIMIT_FREE = Number(Deno.env.get("AI_LIMIT_FREE") ?? "5");   // запросов в день на бесплатном тарифе
const LIMIT_PRO = Number(Deno.env.get("AI_LIMIT_PRO") ?? "50");    // запросов в день на платном
const MAX_PROMPT = 40000;                                           // символов
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";       // после покупки домена впишите https://ваш-домен

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SYSTEM =
  "Ты — помощник сценариста и кинопродюсера в студенческом проекте HUSTLE. Отвечай на русском. " +
  "Помогай только с кино: сценарии, сцены, структура, идеи, экспликации, съёмки. " +
  "Если просят о другом — вежливо откажись и предложи вернуться к проекту.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Метод не поддерживается" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY")!;
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicKey) return json({ error: "Помощник пока не настроен на сервере." }, 500);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1. Кто спрашивает
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u } = await admin.auth.getUser(token);
  const user = u?.user;
  if (!user) return json({ error: "Войдите в аккаунт, чтобы пользоваться помощником." }, 401);

  // 2. Что спрашивают
  let prompt = "";
  try {
    const body = await req.json();
    prompt = typeof body?.prompt === "string" ? body.prompt : "";
  } catch { /* пустой запрос */ }
  if (!prompt.trim()) return json({ error: "Пустой запрос." }, 400);
  if (prompt.length > MAX_PROMPT) return json({ error: "Запрос слишком длинный. Сократите сценарий." }, 413);

  // 3. Дневной лимит по тарифу
  const { data: prof } = await admin.from("profiles").select("plan").eq("user_id", user.id).maybeSingle();
  const limit = prof?.plan && prof.plan !== "free" ? LIMIT_PRO : LIMIT_FREE;
  const { data: allowed, error: limErr } = await admin.rpc("ai_take", { p_user: user.id, p_limit: limit });
  if (limErr) return json({ error: "Не удалось проверить лимит. Попробуйте позже." }, 500);
  if (!allowed) return json({ error: `Лимит помощника на сегодня исчерпан (${limit} запросов). Он обновится завтра.` }, 429);

  // 4. Запрос к Claude
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, max_tokens: 4000, system: SYSTEM, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(120000),
    });
    if (!r.ok) {
      await admin.rpc("ai_refund", { p_user: user.id });
      const busy = r.status === 429 || r.status === 529;
      console.error("anthropic error", r.status, await r.text());
      return json({ error: busy ? "Сервис ИИ сейчас перегружен. Попробуйте через минуту." : "Помощник временно недоступен." }, 502);
    }
    const data = await r.json();
    const text = (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim();
    if (!text) {
      await admin.rpc("ai_refund", { p_user: user.id });
      return json({ error: "Помощник вернул пустой ответ. Попробуйте ещё раз." }, 502);
    }
    return json({ text });
  } catch (e) {
    await admin.rpc("ai_refund", { p_user: user.id });
    console.error("ai function failure", e);
    return json({ error: "Помощник не ответил вовремя. Попробуйте ещё раз." }, 504);
  }
});
