// Netlify serverless function for Soporte Sonoro
// Handles: budget notification emails + newsletter sending via Brevo API
// Env var required: BREVO_API_KEY

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

async function sendEmail(apiKey, to, subject, html, sender) {
  const res = await fetch(BREVO_URL, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: sender || { name: "Soporte Sonoro", email: "noreply@soportesonoro.com" },
      to: Array.isArray(to) ? to : [to],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${err}`);
  }
  return res.json();
}

function buildBudgetHtml(data) {
  const { clientName, clientPhone, os, items, total, currency, packageName } = data;
  const cur = currency === "USD" ? "US$" : "$";
  const rows = (items || [])
    .map(
      (it) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${it.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee">${it.cat || ""}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${cur}${it.price?.toLocaleString() || 0}</td>
          <td style="padding:8px;border-bottom:1px solid #eee"><a href="${it.link || "#"}" style="color:#4f8cff">Link</a></td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#eee;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#4f8cff,#a259ff);padding:24px;text-align:center">
      <h1 style="margin:0;font-size:22px;color:#fff">Nuevo Presupuesto Recibido</h1>
    </div>
    <div style="padding:24px">
      <p><strong>Cliente:</strong> ${clientName || "Sin nombre"}</p>
      ${clientPhone ? `<p><strong>Telefono:</strong> ${clientPhone}</p>` : ""}
      <p><strong>Sistema:</strong> ${os || "No especificado"}</p>
      ${packageName ? `<p><strong>Paquete:</strong> ${packageName}</p>` : ""}
      <p><strong>Moneda:</strong> ${currency || "ARS"}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#222">
            <th style="padding:8px;text-align:left">Plugin</th>
            <th style="padding:8px;text-align:left">Categoria</th>
            <th style="padding:8px;text-align:right">Precio</th>
            <th style="padding:8px;text-align:left">Link</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="background:#222;padding:16px;border-radius:8px;text-align:right;font-size:20px;margin-top:16px">
        <strong>Total: ${cur}${total?.toLocaleString() || 0}</strong>
      </div>
    </div>
  </div>`;
}

function buildNewsletterHtml(data) {
  const { subject, message, plugins, currency } = data;
  const cur = currency === "USD" ? "US$" : "$";
  const cards = (plugins || [])
    .map(
      (p) => `
    <div style="background:#1a1a2e;border-radius:12px;padding:20px;margin:12px 0;border:1px solid #333">
      <h3 style="margin:0 0 8px;color:#4f8cff">${p.name}</h3>
      <p style="margin:0 0 8px;color:#aaa;font-size:13px">${p.cat || "Plugin"}</p>
      <p style="margin:0 0 12px;color:#ccc;font-size:14px">${p.desc || ""}</p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:20px;font-weight:bold;color:#a259ff">${cur}${p.price?.toLocaleString() || 0}</span>
        ${p.link ? `<a href="${p.link}" style="background:#4f8cff;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px">Ver mas</a>` : ""}
      </div>
    </div>`
    )
    .join("");

  return `
  <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#eee;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#4f8cff,#a259ff);padding:32px;text-align:center">
      <h1 style="margin:0;font-size:24px;color:#fff">${subject || "Novedades de Soporte Sonoro"}</h1>
    </div>
    <div style="padding:24px">
      ${message ? `<p style="font-size:15px;line-height:1.6;color:#ddd;margin-bottom:24px">${message}</p>` : ""}
      <h2 style="color:#fff;font-size:18px;margin-bottom:16px">Plugins Destacados</h2>
      ${cards}
    </div>
    <div style="background:#0a0a0a;padding:16px;text-align:center;font-size:12px;color:#666">
      <p>Soporte Sonoro - Catalogo de Plugins</p>
    </div>
  </div>`;
}

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "BREVO_API_KEY not configured" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { action } = body;

  try {
    if (action === "notify") {
      // Budget notification to admin
      const { adminEmail } = body;
      if (!adminEmail) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "adminEmail required" }) };
      }
      const html = buildBudgetHtml(body);
      const clientName = body.clientName || "Cliente";
      await sendEmail(apiKey, { email: adminEmail, name: "Admin" }, `Nuevo presupuesto de ${clientName}`, html);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: "Notification sent" }) };

    } else if (action === "newsletter") {
      // Newsletter to list of emails
      const { recipients, subject, message, plugins, currency, senderEmail, senderName } = body;
      if (!recipients || !recipients.length) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: "recipients required" }) };
      }
      const html = buildNewsletterHtml({ subject, message, plugins, currency });
      const to = recipients.map((e) => (typeof e === "string" ? { email: e } : e));
      const sender = senderEmail
        ? { name: senderName || "Soporte Sonoro", email: senderEmail }
        : undefined;
      await sendEmail(apiKey, to, subject || "Newsletter - Soporte Sonoro", html, sender);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: "Newsletter sent" }) };

    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action. Use 'notify' or 'newsletter'" }) };
    }
  } catch (err) {
    console.error("Brevo error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
