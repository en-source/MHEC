# Submission form

A single static page (`index.html`) that collects submissions and appends them
as rows to a Google Sheet, using a Google Apps Script web app as the backend
(no server or paid hosting needed).

Fields: Full Name (or "Anonymous" via checkbox), Email Address (optional),
a response text box capped at 500 words, and an optional photo with a
"permission to share" checkbox.

Photos are downscaled in the browser (max 1600px, JPEG) and saved by the
script to a private Drive folder named `MHEC Submission Photos` in the
account that runs the script. The sheet gets a `Photo Link` column and a
`Photo Consent` column (TRUE/FALSE). The script shares the folder with
`PHOTO_SHARE_WITH` (set at the top of `Code.gs`) so the sheet owner can open
the links.

## Setup

1. **Spreadsheet.** Submissions land in
   [MHEC Submissions](https://docs.google.com/spreadsheets/d/17nvPl8vs9778q2LG9UWkdgKlK2UWhSkTRT2vGVVx-HQ/edit).
   You don't need to add any columns; the script creates a `Responses` sheet
   and header row on first submission.

2. **Add the Apps Script backend.**
   - Go to [script.google.com](https://script.google.com) and create a new,
     standalone project (**not** bound to the sheet — this avoids org
     policies that can block anonymous access to domain-bound web apps).
   - Delete the placeholder code and paste in the contents of
     [`apps-script/Code.gs`](apps-script/Code.gs). It references the
     spreadsheet by ID (`SPREADSHEET_ID`), which is already set.
   - If this project's account is **not** the spreadsheet's owner, share the
     sheet with that account as **Editor** first, or `appendRow` will fail.
   - Save the project (give it any name).

3. **Deploy it as a web app.**
   - Click `Deploy > New deployment`.
   - Click the gear icon next to "Select type" and choose `Web app`.
   - Set **Execute as**: `Me`.
   - Set **Who has access**: `Anyone`.
   - Click `Deploy`, and authorize the script when prompted.
   - Copy the resulting **Web app URL** — it looks like
     `https://script.google.com/macros/s/XXXXXXXX/exec`.
   - Verify it's actually publicly reachable by opening that URL in an
     incognito/private window (logged out) — it should show
     `Script function not found: doGet`, not a Google sign-in page. If it
     asks you to sign in, the deployment isn't truly public yet (this
     commonly happens with Google Workspace accounts due to org sharing
     policy, even with "Anyone" selected).

4. **Connect the form.**
   - Open [`index.html`](index.html) and replace
     `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` (near the top of the
     `<script>` block) with the URL you copied.

5. **Update the placeholder text.** Replace the two `placeholder` strings in
   `index.html` (`<title>` and the header/subheader) with your actual page
   title and copy.

6. **Host the page.** `index.html` is a single self-contained file — host it
   anywhere static (GitHub Pages, Netlify, S3, or just open the file
   locally to test).

## Notes

- Word limit (500) is enforced both client-side (typing is capped) and
  server-side (extra safety in case the request is sent directly).
- If you ever change the Apps Script code, you need to create a **new
  deployment version** (`Deploy > Manage deployments > Edit > New version`)
  for the changes to take effect on the live URL.
- The photo feature makes the script use Google Drive, so the first
  redeploy after adding it asks you to re-authorize with the extra Drive
  permission.
- Deploy the updated `Code.gs` **before** the updated `index.html` goes
  live, otherwise photos submitted in between are dropped by the old script.
