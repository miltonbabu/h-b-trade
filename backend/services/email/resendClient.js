const logger = require('../../config/logger');

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Thin Resend REST API client (https://resend.com/docs/api-reference/emails/send-email)
 * Uses native fetch — no extra dependency required (Node 18+).
 */
const sendViaResend = async ({ from, to, subject, html, text, replyTo, attachments }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    const err = new Error('RESEND_API_KEY is not configured');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const payload = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (text) payload.text = text;
  if (replyTo) payload.reply_to = replyTo;
  if (attachments && attachments.length > 0) {
    payload.attachments = attachments.map((a) => ({
      content: a.content,
      filename: a.filename,
      content_type: a.contentType,
      ...(a.disposition ? { disposition: a.disposition } : {}),
      ...(a.id ? { id: a.id } : {}),
    }));
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data && (data.message || (data.error && data.error.message))) || `Resend API error (${response.status})`;
    const err = new Error(message);
    err.code = response.status;
    throw err;
  }

  return data; // { id: '...' }
};

module.exports = { sendViaResend };
