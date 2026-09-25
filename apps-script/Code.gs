// Paste this into a standalone Apps Script project (script.google.com) and
// deploy it as a web app. See README.md for setup steps.

const SPREADSHEET_ID = "17nvPl8vs9778q2LG9UWkdgKlK2UWhSkTRT2vGVVx-HQ";
const SHEET_NAME = "Responses";
const HEADERS = ["Timestamp", "Full Name", "Email", "Response", "Photo Link", "Photo Consent"];
const MAX_WORDS = 500;

const PHOTO_FOLDER_NAME = "MHEC Submission Photos";
// Photos live in the Drive of the account that runs this script. This address
// is added as an editor of the photo folder so the sheet owner can open them.
const PHOTO_SHARE_WITH = "en@erikanguyen.ai";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const fullName = data.anonymous ? "Anonymous" : String(data.fullName || "").trim();
    const email = String(data.email || "").trim();
    const response = String(data.response || "").trim();
    const photoConsent = data.photoConsent === true;

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

    let photoLink = "";
    if (data.photo && data.photo.data) {
      photoLink = savePhoto(data.photo);
    }

    const sheet = getOrCreateSheet();
    sheet.appendRow([new Date(), fullName, email, response, photoLink, photoConsent]);

    return jsonResponse({ result: "success" });
  } catch (err) {
    return jsonResponse({ result: "error", message: err.message });
  }
}

function savePhoto(photo) {
  const mimeType = String(photo.mimeType || "");
  const extension = PHOTO_EXTENSIONS[mimeType];
  if (!extension) {
    throw new Error("Unsupported photo type.");
  }
  const bytes = Utilities.base64Decode(photo.data);
  if (bytes.length > MAX_PHOTO_BYTES) {
    throw new Error("Photo is too large.");
  }
  // Named by timestamp only, so the file name never reveals who submitted it.
  const stamp = Utilities.formatDate(new Date(), "UTC", "yyyyMMdd-HHmmss");
  const fileName = `${stamp}-${Utilities.getUuid().slice(0, 8)}.${extension}`;
  const file = getPhotoFolder().createFile(Utilities.newBlob(bytes, mimeType, fileName));
  return file.getUrl();
}

function getPhotoFolder() {
  const folders = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  const folder = DriveApp.createFolder(PHOTO_FOLDER_NAME);
  try {
    folder.addEditor(PHOTO_SHARE_WITH);
  } catch (err) {
    // Sharing is best-effort; the photo should still be saved.
  }
  return folder;
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  if (headerRange.getValues()[0].join("|") !== HEADERS.join("|")) {
    headerRange.setValues([HEADERS]);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
