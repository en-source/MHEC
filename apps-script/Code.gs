// Paste this into a standalone Apps Script project (script.google.com) and
// deploy it as a web app. See README.md for setup steps.

const SPREADSHEET_ID = "17nvPl8vs9778q2LG9UWkdgKlK2UWhSkTRT2vGVVx-HQ";
const SHEET_NAME = "Responses";
const MAX_WORDS = 500;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const fullName = data.anonymous ? "Anonymous" : String(data.fullName || "").trim();
    const email = String(data.email || "").trim();
    const response = String(data.response || "").trim();

    if (!fullName) {
      return jsonResponse({ result: "error", message: "Full name is required unless anonymous." });
    }
    if (!response) {
      return jsonResponse({ result: "error", message: "A submission is required." });
    }
    const wordCount = response.split(/\s+/).filter(Boolean).length;
    if (wordCount > MAX_WORDS) {
      return jsonResponse({ result: "error", message: `Submission exceeds ${MAX_WORDS} words.` });
    }

    const sheet = getOrCreateSheet();
    sheet.appendRow([new Date(), fullName, email, response]);

    return jsonResponse({ result: "success" });
  } catch (err) {
    return jsonResponse({ result: "error", message: err.message });
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Full Name", "Email", "Response"]);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
