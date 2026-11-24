/**
 * SR Gastos · sends bank notification emails from Gmail to the app every hour.
 *
 * Setup (once):
 * 1. In Gmail, create a filter per bank sender (BBVA, Littio, Bancolombia, Nequi…) with
 *    "Apply the label: Bancos". Optionally tick "Also apply filter to matching conversations".
 * 2. Go to https://script.google.com → New project, paste this file.
 * 3. Project Settings → Script Properties:
 *      APP_URL = https://your-domain.com      (no trailing slash needed)
 *      TOKEN   = the INBOUND_EMAIL_TOKEN value from the server's .env
 * 4. Run sendBankEmails once by hand and accept the Gmail permissions.
 * 5. Triggers → Add trigger → sendBankEmails, time-driven, hour timer, every hour.
 *
 * The server ignores emails it already has (by Gmail message id), so overlaps are harmless.
 */
const LABEL = 'Bancos';
const BATCH = 100;

function sendBankEmails() {
    const props = PropertiesService.getScriptProperties();
    const url =
        props.getProperty('APP_URL').replace(/\/$/, '') + '/api/inbound-emails';
    const token = props.getProperty('TOKEN');
    const lastSuccess = Number(props.getProperty('LAST_SUCCESS') || 0);
    // One hour of overlap so an email that arrives during a run is never skipped.
    const since = lastSuccess ? lastSuccess - 60 * 60 * 1000 : 0;
    const startedAt = Date.now();

    const emails = [];
    GmailApp.search('label:' + LABEL + ' newer_than:3d').forEach(
        function (thread) {
            // Gmail groups notifications with the same subject into one thread: read every message.
            thread.getMessages().forEach(function (message) {
                if (message.getDate().getTime() < since) return;
                emails.push({
                    message_id: message.getId(),
                    from: message.getFrom(),
                    subject: message.getSubject(),
                    date: message.getDate().toISOString(),
                    body: message.getPlainBody().slice(0, 100000),
                });
            });
        },
    );

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
