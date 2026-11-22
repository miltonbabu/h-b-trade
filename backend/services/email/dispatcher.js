const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../../config/database');
const logger = require('../../config/logger');
const { sendViaResend } = require('./resendClient');
const { templates } = require('./templates');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://hbtrade.ltd';

const LOGO_CANDIDATES = [
  path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'logo-hb-small.png'),
  path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'logo-hb.png'),
];

let cachedLogo = undefined; // { content, filename, contentType } | null

const getLogoAttachment = () => {
  if (cachedLogo !== undefined) return cachedLogo;
  for (const p of LOGO_CANDIDATES) {
    try {
      if (fs.existsSync(p)) {
        cachedLogo = {
          content: fs.readFileSync(p).toString('base64'),
          filename: path.basename(p),
          contentType: 'image/png',
        };
        return cachedLogo;
      }
    } catch (e) {
      /* try next */
    }
  }
  cachedLogo = null;
  return cachedLogo;
};

const getSettings = async () => {
  try {
    return (await db.getOne('SELECT * FROM settings LIMIT 1')) || {};
  } catch (e) {
    logger.warn('email: could not load settings: ' + e.message);
    return {};
  }
};

const boolOn = (v, defaultValue = true) => {
  if (v === undefined || v === null || v === '') return defaultValue;
  return !(v === false || v === 0 || v === '0' || String(v).toLowerCase() === 'false');
};

/**
 * Should this email be sent based on env kill-switch + settings toggles?
 * Returns { send: boolean, reason?: string }
 */
const resolvePolicy = (settings, category, recipientType) => {
  if (!boolOn(process.env.EMAIL_ENABLED, true)) {
    return { send: false, reason: 'EMAIL_ENABLED is false' };
  }
  if (!boolOn(settings.email_notifications_enabled, true)) {
    return { send: false, reason: 'email notifications disabled in settings' };
  }
  const isStatusUpdate = ['order_status_update', 'service_status_update', 'product_status_update', 'tracking_update'].includes(category);
  if (recipientType === 'customer' && isStatusUpdate && !boolOn(settings.notify_customer_status_updates, true)) {
    return { send: false, reason: 'customer status update emails disabled in settings' };
  }
  if (recipientType === 'admin' && !boolOn(settings.notify_admin_new_activity, true)) {
    return { send: false, reason: 'admin activity emails disabled in settings' };
  }
  return { send: true };
};

const logEmail = async (entry) => {
  try {
    await db.run(
      `INSERT INTO email_log
        (id, to_email, from_email, reply_to, subject, category, recipient_type, related_type, related_id, status, error, resend_id, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.to,
        entry.from || null,
        entry.replyTo || null,
        entry.subject || null,
        entry.category || null,
        entry.recipientType || null,
        entry.relatedType || null,
        entry.relatedId || null,
        entry.status,
        entry.error || null,
        entry.resendId || null,
        entry.status === 'sent' ? new Date().toISOString() : null,
      ]
    );
  } catch (e) {
    logger.warn('email: failed to write email_log: ' + e.message);
  }
};

/**
 * Send a templated transactional email via Resend and log the result.
 * NEVER throws — a failed email must not break the calling request.
 *
 * @param {Object} options
 * @param {string} options.to            recipient email
 * @param {string} options.template      key of templates map
 * @param {Object} options.data          template data
 * @param {string} options.category      e.g. 'order_status_update'
 * @param {string} options.recipientType 'customer' | 'admin'
 * @param {string} [options.relatedType] e.g. 'order'
 * @param {string} [options.relatedId]
 * @param {string} [options.replyTo]
 * @param {Array}  [options.attachments] extra attachments [{ content(base64), filename, contentType }]
 * @returns {Promise<{success: boolean, skipped?: boolean, error?: string, resendId?: string}>}
 */
const sendEmail = async (options) => {
  const {
    to,
    template: templateKey,
    data = {},
    category,
    recipientType = 'customer',
    relatedType,
    relatedId,
    replyTo,
    attachments,
  } = options || {};

  const logId = uuidv4();

  try {
    if (!to) {
      await logEmail({ id: logId, to: '(missing)', subject: null, category, recipientType, relatedType, relatedId, status: 'failed', error: 'No recipient email' });
      return { success: false, error: 'No recipient email' };
    }

    const settings = await getSettings();
    const policy = resolvePolicy(settings, category, recipientType);
    if (!policy.send) {
      logger.info(`email: skipped (${policy.reason}) → ${to} [${category}]`);
      await logEmail({ id: logId, to, subject: null, category, recipientType, relatedType, relatedId, status: 'skipped', error: policy.reason });
      return { success: true, skipped: true, reason: policy.reason };
    }

    const templateFn = templates[templateKey];
    if (!templateFn) {
      throw new Error(`Unknown email template: ${templateKey}`);
    }

    const logo = getLogoAttachment();
    const ctx = {
      settings,
      frontendUrl: FRONTEND_URL,
      logoSrc: logo ? 'cid:hb-logo' : `${FRONTEND_URL}/logo-hb.png`,
    };

    const rendered = templateFn(data, ctx);

    const fromName = settings.email_from_name || process.env.EMAIL_FROM_NAME || settings.company_name || 'H&B Trade';
    const from = process.env.EMAIL_FROM || `"${fromName}" <onboarding@resend.dev>`;

    const allAttachments = [];
    if (logo) {
      allAttachments.push({ ...logo, disposition: 'inline', id: 'hb-logo' });
    }
    if (Array.isArray(attachments)) {
      for (const a of attachments) {
        allAttachments.push({
          content: a.content,
          filename: a.filename || 'attachment',
          contentType: a.contentType || 'application/octet-stream',
          disposition: 'attachment',
        });
      }
    }

    const result = await sendViaResend({
      from,
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      replyTo,
      attachments: allAttachments,
    });

    await logEmail({
      id: logId,
      to,
      from,
      replyTo,
      subject: rendered.subject,
      category,
      recipientType,
      relatedType,
      relatedId,
      status: 'sent',
      resendId: (result && result.id) || null,
    });

    logger.info(`email: sent [${category}] → ${to} (resend id: ${(result && result.id) || 'n/a'})`);
    return { success: true, resendId: result && result.id };
  } catch (error) {
    logger.error(`email: FAILED [${category}] → ${to}: ${error.message}`);
    await logEmail({
      id: logId,
      to,
      subject: null,
      category,
      recipientType,
      relatedType,
      relatedId,
      status: 'failed',
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, getSettings, FRONTEND_URL };
