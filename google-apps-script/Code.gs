/**
 * LiveScore Alerts — sign-up collector.
 *
 * Receives form submissions from the landing page and appends them as a row
 * in the Google Sheet this script is bound to. See README.md at the repo root
 * for the one-time deployment steps.
 */

var SHEET_NAME = 'Sign-ups';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000); // avoid interleaved writes when two people submit at once

  try {
    var data = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Channels', 'Matches']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date(),
      String(data.name || '').slice(0, 100),
      String(data.phone || '').slice(0, 20),
      Array.isArray(data.channels) ? data.channels.join(', ') : '',
      String(data.sport || '').slice(0, 50)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
