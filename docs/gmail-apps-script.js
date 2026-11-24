/**
 * SR Gastos · sends bank notification emails from Gmail to the app every hour.
 *
 * Setup (once):
 * 1. Go to https://script.google.com → New project, paste this file.
 * 2. Project Settings → Script Properties:
 *      APP_URL = https://your-domain.com      (no trailing slash needed)
 *      TOKEN   = the INBOUND_EMAIL_TOKEN value from the server's .env
 * 3. Run sendBankEmails once by hand and accept the Gmail permissions.
 * 4. Triggers → Add trigger → sendBankEmails, time-driven, hour timer, every hour.
 *
 * To add a bank, add its notification sender to SENDERS. Bancolombia only emails statements
 * and ads (movements arrive by SMS/app), so it is not listed.
 *
 * The server ignores emails it already has (by Gmail message id), so overlaps are harmless.
 */
const SENDERS = [
    'notificacionesBreB@bbva.com',
    'BBVA@bbvanet.com.co',
    'notificaciones@nequi.com.co',
    'info@cliente.littio.co',
    'notificaciones@lulobank.com',
    'noreply@rappicard.co',
];
// BBVA's app-login alerts are not movements: skip them so they never cost an AI call.
const SEARCH =
    'from:(' +
    SENDERS.join(' OR ') +
    ') -subject:"Confirmación de ingreso" -subject:"otra sesión"';
const BATCH = 100;

// eslint-disable-next-line no-unused-vars -- Apps Script trigger entry point
function sendBankEmails() {
    const props = PropertiesService.getScriptProperties();
    const url =
        props.getProperty('APP_URL').replace(/\/$/, '') + '/api/inbound-emails';
    const token = props.getProperty('TOKEN');
    const lastSuccess = Number(props.getProperty('LAST_SUCCESS') || 0);
    const startedAt = Date.now();
    // One hour of overlap so an email that arrives during a run is never skipped.
    // First run: only the last 3 days (threads can hold months-old messages).
    const since = lastSuccess
        ? lastSuccess - 60 * 60 * 1000
        : startedAt - 3 * 24 * 60 * 60 * 1000;

    const emails = [];
    GmailApp.search(SEARCH + ' newer_than:3d').forEach(function (thread) {
        // Gmail groups notifications with the same subject into one thread: read every message.
        thread.getMessages().forEach(function (message) {
            if (message.getDate().getTime() < since) return;
            emails.push({
                message_id: message.getId(),
                from: message.getFrom().slice(0, 255),
                subject: message.getSubject().slice(0, 500),
                date: message.getDate().toISOString(),
                body: message.getPlainBody().slice(0, 100000),
            });
        });
    });

    for (let i = 0; i < emails.length; i += BATCH) {
        const response = UrlFetchApp.fetch(url, {
            method: 'post',
            contentType: 'application/json',
            headers: { Authorization: 'Bearer ' + token },
            payload: JSON.stringify({ emails: emails.slice(i, i + BATCH) }),
            muteHttpExceptions: true,
        });
        if (response.getResponseCode() >= 300) {
            throw new Error(
                'SR Gastos responded ' +
                    response.getResponseCode() +
                    ': ' +
                    response.getContentText().slice(0, 500),
            );
        }
    }

    props.setProperty('LAST_SUCCESS', String(startedAt));
}
