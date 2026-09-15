# Submission form

A single static page (`index.html`) that collects submissions and appends them
as rows to a Google Sheet, using a Google Apps Script web app as the backend
(no server or paid hosting needed).

Fields: Full Name (or "Anonymous" via checkbox), Email Address (optional),
and a response text box capped at 500 words.

## Setup

1. **Create the spreadsheet.** Make a new Google Sheet — this is where
   submissions will land. You don't need to add any columns; the script
   creates a `Responses` sheet and header row on first submission.

2. **Add the Apps Script backend.**
   - In the Sheet, go to `Extensions > Apps Script`.
   - Delete the placeholder code and paste in the contents of
     [`apps-script/Code.gs`](apps-script/Code.gs).
   - Save the project (give it any name).

3. **Deploy it as a web app.**
   - Click `Deploy > New deployment`.
   - Click the gear icon next to "Select type" and choose `Web app`.
   - Set **Execute as**: `Me`.
   - Set **Who has access**: `Anyone`.
   - Click `Deploy`, and authorize the script when prompted (it only needs
     access to this one spreadsheet).
   - Copy the resulting **Web app URL** — it looks like
     `https://script.google.com/macros/s/XXXXXXXX/exec`.

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
