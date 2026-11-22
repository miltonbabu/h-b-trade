/**
 * H&B Trade transactional email templates.
 * Email-client safe: table layout, inline styles, 600px card, brand teal (#0d9488).
 * The H&B Trade logo is embedded inline (cid:hb-logo) by the dispatcher; a hosted
 * URL fallback is used when the local logo file is unavailable.
 */

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const BRAND = {
  primary: '#0d9488',
  primaryDark: '#0f766e',
  ink: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  line: '#e2e8f0',
  soft: '#f8fafc',
  footer: '#0f172a',
  gold: '#f59e0b',
  green: '#10b981',
};

const baseLayout = ({ preheader, eyebrow, heading, body, settings = {}, logoSrc, frontendUrl = '' }) => {
  const companyName = escapeHtml(settings.company_name || 'H&B Trade');
  const phone = escapeHtml(settings.phone || '');
  const siteEmail = escapeHtml(settings.email || '');
  const whatsapp = escapeHtml(settings.whatsapp_link || '');
  const facebookPage = escapeHtml(settings.facebook_page || '');
  const address = escapeHtml(settings.office_address || '');
  const year = new Date().getFullYear();

  const contactLinks = [
    phone ? `<a href="tel:${phone.replace(/\s/g, '')}" style="color:#5eead4;text-decoration:none;">${phone}</a>` : '',
    whatsapp ? `<a href="${whatsapp}" style="color:#5eead4;text-decoration:none;">WhatsApp</a>` : '',
    facebookPage ? `<a href="${facebookPage}" style="color:#5eead4;text-decoration:none;">Facebook</a>` : '',
    frontendUrl ? `<a href="${frontendUrl}" style="color:#5eead4;text-decoration:none;">Website</a>` : '',
  ].filter(Boolean).join('<span style="color:#334155;padding:0 8px;">|</span>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:#e2e8f0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,Arial,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader || '')}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e2e8f0;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.12);">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="background-color:${BRAND.primary};padding:26px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="64" valign="middle">
                    <div style="background-color:#ffffff;border-radius:50%;padding:5px;line-height:0;display:inline-block;">
                      <img src="${logoSrc}" alt="H&B Trade" width="54" height="54" style="border-radius:50%;display:block;width:54px;height:54px;">
                    </div>
                  </td>
                  <td valign="middle" style="padding-left:14px;">
                    <div style="color:#ffffff;font-size:23px;font-weight:700;letter-spacing:0.4px;line-height:1.2;">H&amp;B Trade</div>
                    <div style="color:#ccfbf1;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;line-height:1.6;">China &rarr; Bangladesh &middot; Sourcing &amp; Shipping</div>
                  </td>
                  ${eyebrow ? `<td align="right" valign="middle">
                    <div style="background-color:rgba(255,255,255,0.18);color:#ffffff;font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;padding:7px 13px;border-radius:999px;white-space:nowrap;">${escapeHtml(eyebrow)}</div>
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="padding:36px 32px 32px 32px;">
              <h1 style="margin:0 0 6px 0;color:${BRAND.ink};font-size:26px;font-weight:700;line-height:1.3;">${escapeHtml(heading)}</h1>
              <div style="width:52px;height:4px;border-radius:4px;background-color:${BRAND.primary};margin:14px 0 24px 0;"></div>
              ${body}
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="background-color:${BRAND.footer};padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <div style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.5px;">H&amp;B Trade</div>
                    <div style="color:#94a3b8;font-size:12px;line-height:1.7;margin-top:4px;">Your Trusted China &rarr; Bangladesh Sourcing Partner</div>
                  </td>
                </tr>
                ${contactLinks ? `<tr>
                  <td align="center" style="padding:10px 0;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;font-size:12px;">
                    ${contactLinks}
                  </td>
                </tr>` : ''}
                ${address ? `<tr>
                  <td align="center" style="padding-top:14px;">
                    <div style="color:#94a3b8;font-size:11px;line-height:1.7;">${address}</div>
                  </td>
                </tr>` : ''}
                ${siteEmail ? `<tr>
                  <td align="center" style="padding-top:8px;">
                    <a href="mailto:${siteEmail}" style="color:#5eead4;font-size:12px;text-decoration:none;">${siteEmail}</a>
                  </td>
                </tr>` : ''}
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <div style="color:#64748b;font-size:10.5px;line-height:1.7;">
                      You received this email because of activity on your H&amp;B Trade account or request.<br>
                      &copy; ${year} H&amp;B Trade. All rights reserved.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const paragraph = (text, style = '') =>
  `<p style="margin:0 0 16px 0;color:${BRAND.body};font-size:15px;line-height:1.75;${style}">${text}</p>`;

const greeting = (name) => paragraph(`Dear ${escapeHtml(name || 'Customer')},`);

const button = (href, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 8px 0;">
    <tr>
      <td align="center" style="border-radius:10px;background-color:${BRAND.primary};">
        <a href="${href}" target="_blank" style="display:inline-block;padding:15px 34px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;

const linkNote = (href) =>
  `<p style="margin:6px 0 18px 0;color:${BRAND.muted};font-size:12px;line-height:1.7;">If the button does not work, copy and paste this link into your browser:<br>
   <a href="${href}" style="color:${BRAND.primary};word-break:break-all;">${escapeHtml(href)}</a></p>`;

const infoBox = (rows) => {
  const items = rows
    .filter((r) => r && r.value !== undefined && r.value !== null && String(r.value).trim() !== '')
    .map((r, i, arr) => `
      <tr>
        <td style="padding:11px 18px;${i < arr.length - 1 ? `border-bottom:1px solid ${BRAND.line};` : ''}width:42%;">
          <div style="color:${BRAND.muted};font-size:11px;font-weight:700;letter-spacing:0.9px;text-transform:uppercase;">${escapeHtml(r.label)}</div>
        </td>
        <td style="padding:11px 18px;${i < arr.length - 1 ? `border-bottom:1px solid ${BRAND.line};` : ''}">
          <div style="color:${BRAND.ink};font-size:14px;font-weight:600;line-height:1.5;">${r.html || escapeHtml(r.value)}</div>
        </td>
      </tr>`)
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background-color:${BRAND.soft};border:1px solid ${BRAND.line};border-radius:12px;border-collapse:separate;overflow:hidden;">
      ${items}
    </table>`;
};

const timelineBox = (timeline) => {
  if (!Array.isArray(timeline) || timeline.length === 0) return '';
  const rows = timeline.map((step, i) => {
    const isLast = i === timeline.length - 1;
    const state = step.state || 'upcoming';
    const dotStyle =
      state === 'done'
        ? `background-color:${BRAND.green};color:#ffffff;`
        : state === 'current'
          ? `background-color:${BRAND.primary};color:#ffffff;box-shadow:0 0 0 4px rgba(13,148,136,0.18);`
          : `background-color:#e2e8f0;color:#94a3b8;`;
    const symbol = state === 'done' ? '&#10003;' : state === 'current' ? '&#9679;' : '&#9675;';
    const labelColor = state === 'upcoming' ? '#94a3b8' : BRAND.ink;
    const labelWeight = state === 'current' ? '700' : '600';
    const rowBg = state === 'current' ? `background-color:#f0fdfa;border-radius:10px;` : '';
    const lineColor = isLast ? 'transparent' : state === 'done' ? '#6ee7b7' : BRAND.line;

    return `
      <tr>
        <td width="34" valign="top" style="padding-top:4px;${rowBg}">
          <div style="width:22px;height:22px;line-height:22px;border-radius:50%;text-align:center;font-size:11px;font-weight:700;${dotStyle}">${symbol}</div>
        </td>
        <td valign="top" style="padding:2px 12px ${isLast ? '4px' : '16px'} 14px;border-left:2px solid ${lineColor};margin-left:10px;${rowBg}">
          <div style="color:${labelColor};font-size:14px;font-weight:${labelWeight};line-height:1.4;">${escapeHtml(step.label)}</div>
          ${step.description ? `<div style="color:${BRAND.muted};font-size:12px;line-height:1.6;margin-top:2px;">${escapeHtml(step.description)}</div>` : ''}
          ${step.meta ? `<div style="color:${BRAND.primaryDark};font-size:11.5px;font-weight:600;margin-top:3px;">${escapeHtml(step.meta)}</div>` : ''}
        </td>
      </tr>`;
  }).join('');

  return `
    <div style="margin:22px 0;">
      <div style="color:${BRAND.muted};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">Shipment Progress</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </div>`;
};

const noteBox = (text, tone = 'info') => {
  const tones = {
    info: { bg: '#f0fdfa', border: '#99f6e4', color: '#0f766e' },
    success: { bg: '#ecfdf5', border: '#a7f3d0', color: '#047857' },
    warning: { bg: '#fffbeb', border: '#fde68a', color: '#b45309' },
  };
  const t = tones[tone] || tones.info;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;">
      <tr>
        <td style="background-color:${t.bg};border:1px solid ${t.border};border-radius:10px;padding:14px 18px;color:${t.color};font-size:13.5px;line-height:1.7;">
          ${text}
        </td>
      </tr>
    </table>`;
};

const divider = () =>
  `<div style="height:1px;background-color:${BRAND.line};margin:24px 0;"></div>`;

const signature = (extra = '') =>
  `<p style="margin:22px 0 0 0;color:${BRAND.body};font-size:15px;line-height:1.75;">Warm regards,<br>
    <strong style="color:${BRAND.ink};">The H&amp;B Trade Team</strong>${extra}</p>`;

const stripHtml = (html) =>
  String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const withLayout = (params, textBody) => ({
  subject: params.subject,
  html: baseLayout(params),
  text: stripHtml(textBody || params.body || params.heading || ''),
});

/* ============================================================
   TEMPLATES
   Each template: (data, ctx) => { subject, html, text }
   ctx = { settings, frontendUrl, logoSrc }
   ============================================================ */

const templates = {
  /* ---------- CUSTOMER: welcome (C1) ---------- */
  welcome: (data, ctx) => {
    const name = data.name || 'Customer';
    const trackUrl = `${ctx.frontendUrl}/tracking`;
    const servicesUrl = `${ctx.frontendUrl}/services`;
    const body = `
      ${greeting(name)}
      ${paragraph(`Welcome to <strong style="color:${BRAND.ink};">H&amp;B Trade</strong> — your trusted partner for product sourcing and shipping from China to Bangladesh! Your account has been created successfully.`)}
      ${infoBox([
        { label: 'Account Name', value: name },
        { label: 'Email', value: data.email },
      ])}
      ${paragraph('With your H&amp;B Trade account you can:')}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">
        ${[
          'Place wholesale orders and track them in real time',
          'Request quotes for product sourcing &amp; wholesale supply',
          'Book Air Cargo, Sea Shipping &amp; Hand Carry services',
          'Follow every step of your shipment with a tracking number',
        ].map((t) => `<tr>
          <td width="26" valign="top" style="padding:4px 0;">
            <div style="width:18px;height:18px;line-height:18px;border-radius:50%;background-color:${BRAND.primary};color:#fff;text-align:center;font-size:10px;font-weight:700;">&#10003;</div>
          </td>
          <td style="padding:4px 0 4px 6px;color:${BRAND.body};font-size:14.5px;line-height:1.6;">${t}</td>
        </tr>`).join('')}
      </table>
      ${button(`${ctx.frontendUrl}/login`, 'Go to My Account')}
      ${linkNote(`${ctx.frontendUrl}/login`)}
      ${signature()}`;
    return withLayout({
      subject: `Welcome to H&B Trade, ${name}!`,
      preheader: 'Your H&B Trade account is ready — start sourcing and shipping today.',
      eyebrow: 'Welcome',
      heading: `Welcome aboard, ${name}!`,
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `${greeting(name)} Welcome to H&B Trade. Your account is ready. Login: ${ctx.frontendUrl}/login`);
  },

  /* ---------- CUSTOMER: order confirmation (C2) ---------- */
  orderConfirmation: (data, ctx) => {
    const { order } = data;
    let itemsRows = '';
    try {
      const items = typeof order.items_info === 'string' ? JSON.parse(order.items_info) : order.items_info;
      if (Array.isArray(items) && items.length > 0) {
        itemsRows = `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;border:1px solid ${BRAND.line};border-radius:12px;border-collapse:separate;overflow:hidden;">
            <tr>
              <td style="background-color:${BRAND.soft};padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:${BRAND.muted};border-bottom:1px solid ${BRAND.line};">Product</td>
              <td style="background-color:${BRAND.soft};padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:${BRAND.muted};border-bottom:1px solid ${BRAND.line};">Qty</td>
              <td style="background-color:${BRAND.soft};padding:10px 16px;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:${BRAND.muted};border-bottom:1px solid ${BRAND.line};">Total</td>
            </tr>
            ${items.map((it) => `<tr>
              <td style="padding:11px 16px;border-bottom:1px solid ${BRAND.line};color:${BRAND.ink};font-size:13.5px;font-weight:600;">${escapeHtml(it.productName || it.product_name || 'Item')}</td>
              <td style="padding:11px 16px;border-bottom:1px solid ${BRAND.line};color:${BRAND.body};font-size:13.5px;">${escapeHtml(it.totalUnits || it.quantity || 1)}</td>
              <td style="padding:11px 16px;border-bottom:1px solid ${BRAND.line};color:${BRAND.ink};font-size:13.5px;font-weight:600;">$${escapeHtml(it.totalPrice ?? it.total_price ?? '')}</td>
            </tr>`).join('')}
          </table>`;
      }
    } catch (e) { /* items info not parseable — skip table */ }

    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(order.tracking_number || '')}`;
    const body = `
      ${greeting(data.customerName)}
      ${paragraph(`Thank you for your order! We have received it successfully and our team is already on it. Your order is now being processed.`)}
      ${infoBox([
        { label: 'Order Number', value: order.order_number },
        { label: 'Tracking Number', value: order.tracking_number },
        { label: 'Shipping Method', value: order.shipping_method },
        { label: 'Order Total', value: `$${order.price}` },
        { label: 'Status', value: data.statusLabel || 'Pending — awaiting processing' },
      ])}
      ${itemsRows}
      ${noteBox(`You can follow every step of your shipment using your tracking number <strong>${escapeHtml(order.tracking_number || '')}</strong>. We will email you each time your order status changes.`, 'info')}
      ${button(trackUrl, 'Track My Order')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Order Confirmed — ${order.order_number} | H&B Trade`,
      preheader: `Your order ${order.order_number} has been received and is being processed.`,
      eyebrow: 'Order Confirmed',
      heading: 'Your order is confirmed!',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Order ${order.order_number} confirmed. Tracking: ${order.tracking_number}. Track: ${trackUrl}`);
  },

  /* ---------- CUSTOMER: order status update (C7) ---------- */
  orderStatusUpdate: (data, ctx) => {
    const { order, oldStatus, newStatus, newStatusLabel, location, note, timeline } = data;
    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(order.tracking_number || '')}`;
    const body = `
      ${greeting(data.customerName)}
      ${paragraph(`Your order <strong style="color:${BRAND.ink};">${escapeHtml(order.order_number)}</strong> status has been updated.`)}
      ${infoBox([
        { label: 'Order Number', value: order.order_number },
        { label: 'Tracking Number', value: order.tracking_number },
        { label: 'New Status', value: newStatusLabel, html: `<span style="display:inline-block;background-color:${BRAND.primary};color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px;">${escapeHtml(newStatusLabel)}</span>` },
        { label: 'Location', value: location || '' },
      ])}
      ${timelineBox(timeline)}
      ${note ? noteBox(escapeHtml(note), 'info') : ''}
      ${button(trackUrl, 'Track My Order')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Order ${order.order_number} — ${newStatusLabel} | H&B Trade`,
      preheader: `Your order ${order.order_number} is now: ${newStatusLabel}.`,
      eyebrow: 'Tracking Update',
      heading: 'Your order has been updated',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Order ${order.order_number} update: ${newStatusLabel}. Track: ${trackUrl}`);
  },

  /* ---------- CUSTOMER: tracking entry added (C10) ---------- */
  trackingUpdate: (data, ctx) => {
    const { trackingNumber, statusLabel, location, note, estimatedDate, timeline, refNumber } = data;
    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(trackingNumber || '')}`;
    const body = `
      ${greeting(data.customerName)}
      ${paragraph(`A new tracking update is available for your shipment <strong style="color:${BRAND.ink};">${escapeHtml(refNumber || trackingNumber)}</strong>.`)}
      ${infoBox([
        { label: 'Tracking Number', value: trackingNumber },
        { label: 'Status', value: statusLabel, html: `<span style="display:inline-block;background-color:${BRAND.primary};color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px;">${escapeHtml(statusLabel)}</span>` },
        { label: 'Location', value: location || '' },
        { label: 'Estimated Date', value: estimatedDate || '' },
      ])}
      ${timelineBox(timeline)}
      ${note ? noteBox(escapeHtml(note), 'info') : ''}
      ${button(trackUrl, 'View Tracking Details')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Tracking Update: ${statusLabel} — ${trackingNumber} | H&B Trade`,
      preheader: `New tracking update for ${trackingNumber}: ${statusLabel}.`,
      eyebrow: 'Tracking Update',
      heading: 'New tracking update',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Tracking ${trackingNumber}: ${statusLabel}. Track: ${trackUrl}`);
  },

  /* ---------- CUSTOMER: service request received (C3) ---------- */
  serviceRequestReceived: (data, ctx) => {
    const { request } = data;
    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(request.tracking_number || '')}`;
    const body = `
      ${greeting(request.name)}
      ${paragraph(`Thank you for choosing <strong style="color:${BRAND.ink};">H&amp;B Trade</strong>! We have received your service request and our team will review it shortly.`)}
      ${infoBox([
        { label: 'Service', value: data.serviceLabel },
        { label: 'Reference / Tracking No.', value: request.tracking_number },
        { label: 'Name', value: request.name },
        { label: 'Email', value: request.email },
        ...(request.company ? [{ label: 'Company', value: request.company }] : []),
      ])}
      ${paragraph('<strong style="color:' + BRAND.ink + ';">What happens next?</strong>')}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;">
        ${[
          ['1', 'Our team reviews your request details'],
          ['2', 'We prepare a quote and contact you (usually within 24 hours)'],
          ['3', 'Once confirmed, we start processing and keep you updated by email at every step'],
        ].map(([n, t]) => `<tr>
          <td width="30" valign="top" style="padding:5px 0;">
            <div style="width:22px;height:22px;line-height:22px;border-radius:50%;background-color:${BRAND.primary};color:#fff;text-align:center;font-size:11px;font-weight:700;">${n}</div>
          </td>
          <td style="padding:5px 0 5px 8px;color:${BRAND.body};font-size:14.5px;line-height:1.6;">${t}</td>
        </tr>`).join('')}
      </table>
      ${noteBox(`Save your tracking number <strong>${escapeHtml(request.tracking_number || '')}</strong> — you can use it anytime to check your request status online.`, 'success')}
      ${button(trackUrl, 'Track My Request')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Service Request Received — ${data.serviceLabel} | H&B Trade`,
      preheader: `We received your ${data.serviceLabel} request. Tracking: ${request.tracking_number || ''}.`,
      eyebrow: 'Request Received',
      heading: 'Your service request is in!',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Service request received (${data.serviceLabel}). Tracking: ${request.tracking_number}. Track: ${trackUrl}`);
  },

  /* ---------- CUSTOMER: service request status update (C8) ---------- */
  serviceStatusUpdate: (data, ctx) => {
    const { request, newStatusLabel, note, timeline, serviceLabel } = data;
    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(request.tracking_number || '')}`;
    const body = `
      ${greeting(request.name)}
      ${paragraph(`Your <strong style="color:${BRAND.ink};">${escapeHtml(serviceLabel)}</strong> request status has been updated.`)}
      ${infoBox([
        { label: 'Service', value: serviceLabel },
        { label: 'Reference / Tracking No.', value: request.tracking_number },
        { label: 'New Status', value: newStatusLabel, html: `<span style="display:inline-block;background-color:${BRAND.primary};color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px;">${escapeHtml(newStatusLabel)}</span>` },
      ])}
      ${timelineBox(timeline)}
      ${note ? noteBox(escapeHtml(note), 'info') : ''}
      ${button(trackUrl, 'Track My Request')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Request ${request.tracking_number || ''} — ${newStatusLabel} | H&B Trade`,
      preheader: `Your ${serviceLabel} request is now: ${newStatusLabel}.`,
      eyebrow: 'Status Update',
      heading: 'Your request has been updated',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Service request ${request.tracking_number}: ${newStatusLabel}. Track: ${trackUrl}`);
  },

  /* ---------- CUSTOMER: product request received (C4) ---------- */
  productRequestReceived: (data, ctx) => {
    const { request } = data;
    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(request.tracking_number || '')}`;
    const body = `
      ${greeting(request.name)}
      ${paragraph(`We have received your product request. Our sourcing team will look into it and get back to you with a quote soon.`)}
      ${infoBox([
        { label: 'Product', value: request.product_name },
        { label: 'Reference / Tracking No.', value: request.tracking_number },
        ...(request.quantity ? [{ label: 'Quantity', value: request.quantity }] : []),
        ...(request.target_price ? [{ label: 'Target Price', value: `$${request.target_price}` }] : []),
        ...(request.shipping_method ? [{ label: 'Shipping Method', value: request.shipping_method }] : []),
      ])}
      ${noteBox(`Your reference number is <strong>${escapeHtml(request.tracking_number || '')}</strong>. We will email you as soon as your quote is ready.`, 'info')}
      ${button(trackUrl, 'Track My Request')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Product Request Received — ${request.product_name || ''} | H&B Trade`,
      preheader: `We received your product request for ${request.product_name || 'your product'}.`,
      eyebrow: 'Request Received',
      heading: 'Your product request is in!',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Product request received. Tracking: ${request.tracking_number}. Track: ${trackUrl}`);
  },

  /* ---------- CUSTOMER: product request status update (C9) ---------- */
  productStatusUpdate: (data, ctx) => {
    const { request, newStatusLabel, note, timeline } = data;
    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(request.tracking_number || '')}`;
    const body = `
      ${greeting(request.name)}
      ${paragraph(`Your product request <strong style="color:${BRAND.ink};">${escapeHtml(request.product_name || request.tracking_number)}</strong> status has been updated.`)}
      ${infoBox([
        { label: 'Product', value: request.product_name },
        { label: 'Reference / Tracking No.', value: request.tracking_number },
        { label: 'New Status', value: newStatusLabel, html: `<span style="display:inline-block;background-color:${BRAND.primary};color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px;">${escapeHtml(newStatusLabel)}</span>` },
      ])}
      ${timelineBox(timeline)}
      ${note ? noteBox(escapeHtml(note), 'info') : ''}
      ${button(trackUrl, 'Track My Request')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Request ${request.tracking_number || ''} — ${newStatusLabel} | H&B Trade`,
      preheader: `Your product request is now: ${newStatusLabel}.`,
      eyebrow: 'Status Update',
      heading: 'Your request has been updated',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Product request ${request.tracking_number}: ${newStatusLabel}. Track: ${trackUrl}`);
  },

  /* ---------- CUSTOMER: quote / price ready (C11) ---------- */
  quoteReady: (data, ctx) => {
    const { request, price, kind, serviceLabel } = data;
    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(request.tracking_number || '')}`;
    const title = kind === 'service' ? 'Your quote is ready!' : 'Your quote is ready!';
    const body = `
      ${greeting(request.name)}
      ${paragraph(`Good news! We have prepared a quote for your ${kind === 'service' ? `<strong style="color:${BRAND.ink};">${escapeHtml(serviceLabel || 'service')}</strong> request` : 'product request'}.`)}
      ${infoBox([
        ...(kind === 'service'
          ? [{ label: 'Service', value: serviceLabel }]
          : [{ label: 'Product', value: request.product_name }]),
        { label: 'Reference / Tracking No.', value: request.tracking_number },
        { label: 'Quoted Price', value: `$${price}`, html: `<span style="color:${BRAND.primaryDark};font-size:20px;font-weight:800;">$${escapeHtml(price)}</span>` },
      ])}
      ${noteBox(`To confirm this quote, simply reply to this email or contact us via WhatsApp. Payment methods: bKash, Nagad &amp; Bank Transfer.`, 'success')}
      ${button(trackUrl, 'View Request Details')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Quote Ready — $${price} | H&B Trade`,
      preheader: `Your quote of $${price} is ready. Reference: ${request.tracking_number || ''}.`,
      eyebrow: 'Quote Ready',
      heading: title,
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Quote ready: $${price}. Reference: ${request.tracking_number}. ${trackUrl}`);
  },

  /* ---------- CUSTOMER: converted to order (C12) ---------- */
  convertedToOrder: (data, ctx) => {
    const { order, sourceLabel } = data;
    const trackUrl = `${ctx.frontendUrl}/tracking?tn=${encodeURIComponent(order.tracking_number || '')}`;
    const body = `
      ${greeting(data.customerName)}
      ${paragraph(`Your ${escapeHtml(sourceLabel || 'request')} has been officially converted into an order. Processing will begin shortly and we will keep you updated by email at every step.`)}
      ${infoBox([
        { label: 'Order Number', value: order.order_number },
        { label: 'Tracking Number', value: order.tracking_number },
        { label: 'Product / Service', value: order.product_name },
        { label: 'Shipping Method', value: order.shipping_method },
        ...(order.price ? [{ label: 'Total', value: `$${order.price}` }] : []),
      ])}
      ${noteBox(`Keep your tracking number <strong>${escapeHtml(order.tracking_number || '')}</strong> to follow your shipment progress anytime.`, 'success')}
      ${button(trackUrl, 'Track My Order')}
      ${linkNote(trackUrl)}
      ${signature()}`;
    return withLayout({
      subject: `Your request is now Order ${order.order_number} | H&B Trade`,
      preheader: `Your request has been converted to order ${order.order_number}.`,
      eyebrow: 'Order Created',
      heading: 'Your request is now an order!',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Request converted to order ${order.order_number}. Track: ${trackUrl}`);
  },

  /* ---------- CUSTOMER: contact auto-reply (C5) ---------- */
  contactAutoReply: (data, ctx) => {
    const body = `
      ${greeting(data.name)}
      ${paragraph('Thank you for contacting <strong style="color:' + BRAND.ink + ';">H&amp;B Trade</strong>! This is an automatic confirmation that we have received your message.')}
      ${infoBox([
        { label: 'Subject', value: data.subject || 'Contact Form Submission' },
      ])}
      ${noteBox(`<strong>Your message:</strong><br>${escapeHtml(data.message).replace(/\n/g, '<br>')}`, 'info')}
      ${paragraph('Our team will review it and get back to you within <strong>24 hours</strong>. If your matter is urgent, feel free to reach us on WhatsApp or by phone (see footer).')}
      ${signature()}`;
    return withLayout({
      subject: `We received your message — H&B Trade`,
      preheader: 'Thanks for reaching out. We will reply within 24 hours.',
      eyebrow: 'Message Received',
      heading: 'Thanks for reaching out!',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `We received your message (${data.subject || ''}). We will reply within 24 hours.`);
  },

  /* ---------- CUSTOMER: event registration (C6) ---------- */
  eventRegistration: (data, ctx) => {
    const { registration } = data;
    const body = `
      ${greeting(registration.full_name)}
      ${paragraph('Your event registration has been submitted successfully. Thank you for your interest!')}
      ${infoBox([
        { label: 'Event', value: registration.event_title },
        { label: 'Applicant', value: registration.full_name },
        { label: 'Email', value: registration.email },
        { label: 'Status', value: 'Pending Review' },
      ])}
      ${noteBox('Our team will review your registration and contact you with confirmation and further details shortly.', 'info')}
      ${signature()}`;
    return withLayout({
      subject: `Event Registration Received — ${registration.event_title} | H&B Trade`,
      preheader: `We received your registration for ${registration.event_title}.`,
      eyebrow: 'Registration',
      heading: 'Event registration received!',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Event registration received for ${registration.event_title}.`);
  },

  /* ---------- CUSTOMER: invoice (C13) ---------- */
  invoice: (data, ctx) => {
    const body = `
      ${greeting(data.customerName)}
      ${paragraph(`Please find attached your invoice <strong style="color:${BRAND.ink};">${escapeHtml(data.invoiceNumber)}</strong>.`)}
      ${noteBox('If you have any questions regarding this invoice, please don\'t hesitate to contact us. Thank you for your business!', 'info')}
      ${signature()}`;
    return withLayout({
      subject: data.subject || `Invoice ${data.invoiceNumber} | H&B Trade`,
      preheader: `Invoice ${data.invoiceNumber} attached.`,
      eyebrow: 'Invoice',
      heading: 'Your invoice is attached',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `Invoice ${data.invoiceNumber} attached.`);
  },

  /* ---------- ADMIN: generic alert (A1–A8) ---------- */
  adminAlert: (data, ctx) => {
    const rows = (data.rows || [])
      .map((r) => `<tr>
        <td style="padding:9px 16px;border-bottom:1px solid ${BRAND.line};width:38%;">
          <div style="color:${BRAND.muted};font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;">${escapeHtml(r.label)}</div>
        </td>
        <td style="padding:9px 16px;border-bottom:1px solid ${BRAND.line};color:${BRAND.ink};font-size:13.5px;line-height:1.6;">${r.html || escapeHtml(r.value)}</td>
      </tr>`)
      .join('');
    const adminUrl = `${ctx.frontendUrl}/admin/${data.adminPath || 'dashboard'}`;
    const body = `
      ${paragraph(`<strong style="color:${BRAND.ink};">${escapeHtml(data.intro || 'New activity on the H&B Trade website.')}</strong>`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;background-color:${BRAND.soft};border:1px solid ${BRAND.line};border-radius:12px;border-collapse:separate;overflow:hidden;">
        ${rows}
      </table>
      ${data.note ? noteBox(escapeHtml(data.note), 'warning') : ''}
      ${button(adminUrl, 'Open Admin Panel')}
      ${linkNote(adminUrl)}`;
    return withLayout({
      subject: data.subject,
      preheader: data.intro || 'New activity on H&B Trade.',
      eyebrow: data.eyebrow || 'Admin Alert',
      heading: data.heading,
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, `${data.heading}. ${data.intro || ''} ${adminUrl}`);
  },

  /* ---------- Generic test email ---------- */
  testEmail: (data, ctx) => {
    const body = `
      ${greeting(data.name || 'Admin')}
      ${paragraph('This is a test email from your H&amp;B Trade notification system. If you are reading this, your <strong style="color:' + BRAND.ink + ';">Resend</strong> integration is working correctly.')}
      ${infoBox([
        { label: 'Environment', value: data.environment || 'development' },
        { label: 'Sent At', value: new Date().toISOString() },
        { label: 'From', value: data.from },
      ])}
      ${noteBox('All customer and admin notifications will use this email design, branded with the H&amp;B Trade logo.', 'success')}
      ${signature()}`;
    return withLayout({
      subject: 'H&B Trade — Email system test',
      preheader: 'Test email from the H&B Trade notification system.',
      eyebrow: 'Test',
      heading: 'Email system is working!',
      body,
      settings: ctx.settings,
      logoSrc: ctx.logoSrc,
      frontendUrl: ctx.frontendUrl,
    }, 'Test email from H&B Trade notification system. Resend integration is working.');
  },
};

module.exports = { templates, escapeHtml };
