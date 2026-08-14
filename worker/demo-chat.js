// worker/demo-chat.js
//
// Backend de la demo interactiva de Arkeon (demo.html).
// Se despliega en Cloudflare Workers — GitHub Pages solo sirve archivos
// estáticos, así que este trozo vive fuera del repositorio publicado.
//
// Recibe { system, messages } desde el navegador y llama a la API de
// Anthropic con la clave guardada como SECRETO del Worker. La clave nunca
// llega al navegador del lead ni se sube a GitHub.
//
// Instrucciones de despliegue: ver worker/README.md

const ALLOWED_ORIGINS = [
  "https://arkeondata.com",
  "https://www.arkeondata.com",
];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return json({ error: "Método no permitido" }, 405, origin);
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "Falta el secreto ANTHROPIC_API_KEY en el Worker." }, 500, origin);
    }

    let system, messages;
    try {
      ({ system, messages } = await request.json());
    } catch {
      return json({ error: "JSON inválido" }, 400, origin);
    }

    // Límites básicos: esta ruta es pública, así que acotamos el abuso.
    if (typeof system !== "string" || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: "Petición mal formada" }, 400, origin);
    }
    if (messages.length > 30) {
      return json({ error: "Conversación demasiado larga" }, 400, origin);
    }
    const tooLong = messages.some(
      (m) => typeof m.content !== "string" || m.content.length > 2000
    );
    if (tooLong) {
      return json({ error: "Mensaje demasiado largo" }, 400, origin);
    }

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 300,
        // Sin esto, Sonnet 5 razona por defecto y el razonamiento consume
        // los 300 tokens de max_tokens — la respuesta llegaría vacía o cortada.
        // Para un chat corto tipo WhatsApp no aporta nada.
        thinking: { type: "disabled" },
        system,
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      console.error("Anthropic API error:", await anthropicRes.text());
      return json({ error: "Error llamando a Anthropic" }, 502, origin);
    }

    const data = await anthropicRes.json();

    // Las clasificaciones de seguridad pueden devolver 200 con stop_reason
    // "refusal" y content vacío — hay que comprobarlo antes de leer content.
    if (data.stop_reason === "refusal") {
      return json({ reply: "Lo siento, no puedo ayudarte con eso." }, 200, origin);
    }

    const reply = data.content?.find((c) => c.type === "text")?.text ?? "";
    return json({ reply }, 200, origin);
  },
};
