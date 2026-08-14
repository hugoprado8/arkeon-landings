# Backend de la demo interactiva

`arkeondata.com` se sirve desde **GitHub Pages**, que solo entrega archivos
estáticos: no ejecuta código de servidor. La demo necesita llamar a la API de
Anthropic con una clave, y esa clave **no puede vivir en el navegador** — el
repositorio es público y cualquiera podría usarla a tu cargo.

La solución: un **Cloudflare Worker** que hace de intermediario. La página sigue
en GitHub Pages; solo la llamada a Anthropic pasa por el Worker, que guarda la
clave como secreto del lado del servidor.

Plan gratuito: 100.000 peticiones al día. No pide tarjeta.

---

## Despliegue (unos 10 minutos)

### 1. Consigue una clave de Anthropic

En [console.anthropic.com](https://console.anthropic.com) → **Settings → API Keys**
→ *Create Key*. Cópiala; solo se muestra una vez.

> Si alguna clave se te ha escapado alguna vez fuera de un gestor de secretos
> (un chat, un correo, una captura), revócala desde esa misma página antes de
> seguir. Una clave expuesta se explota en minutos.

### 2. Crea el Worker

1. Entra en [dash.cloudflare.com](https://dash.cloudflare.com) (crea la cuenta si no la tienes).
2. **Workers & Pages** → **Create** → **Create Worker**.
3. Nómbralo `arkeon-demo-chat` → **Deploy** (despliega el ejemplo por defecto, da igual).
4. **Edit code**: borra todo lo que haya y pega el contenido de
   [`demo-chat.js`](demo-chat.js) → **Deploy**.

### 3. Guarda la clave como secreto

En el Worker → **Settings** → **Variables and Secrets** → **Add**:

| Campo  | Valor                              |
| ------ | ---------------------------------- |
| Tipo   | **Secret** (no "Text")             |
| Nombre | `ANTHROPIC_API_KEY`                |
| Valor  | tu clave `sk-ant-api03-…`          |

**Que sea Secret y no Text.** Un valor Text se puede leer después desde el
panel; un Secret no. Guarda y vuelve a desplegar.

### 4. Conecta la demo

Copia la URL del Worker (algo como
`https://arkeon-demo-chat.tu-subdominio.workers.dev`) y pégala en la constante
`API_URL` al principio del bloque `<script>` de [`../demo.html`](../demo.html):

```js
const API_URL = "https://arkeon-demo-chat.tu-subdominio.workers.dev";
```

Haz commit, mergea a `main`, y la demo queda viva en
**https://arkeondata.com/demo.html** (GitHub Pages tarda 1-2 minutos en publicar).

---

## Notas

- **Origen permitido**: el Worker solo acepta peticiones desde `arkeondata.com`
  y `www.arkeondata.com` (constante `ALLOWED_ORIGINS`). Si pruebas desde otro
  dominio o desde `localhost`, añádelo ahí.
- **Límites**: se rechazan conversaciones de más de 30 mensajes o mensajes de
  más de 2000 caracteres. La ruta es pública — si acabas mandándola a mucha
  gente, conviene añadir rate limiting en Cloudflare (**Security → WAF → Rate
  limiting rules**).
- **Coste**: Cloudflare gratis; pagas solo los tokens de Anthropic. Con
  `max_tokens: 300` y Sonnet 5, cada respuesta cuesta céntimos. Ponte un límite
  de gasto en **Console → Settings → Limits** por si acaso.
