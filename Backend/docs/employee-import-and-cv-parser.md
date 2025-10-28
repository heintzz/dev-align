Employee Import + CV Parser — API and Frontend Integration Guide

Purpose
-------
This document explains in detail the backend endpoints, expected request/response shapes, and recommended frontend user flows for:

- Bulk Employee Import (CSV/XLSX)
- CV Parser (PDF)

It's written for the frontend team and product owners to implement a safe, user-friendly import experience.

Security & Auth
----------------
All HR endpoints require a valid Bearer token and the calling user must have the `hr` role (the router uses `verifyToken` and `auth('hr')`).
Include header:

Authorization: Bearer <JWT>

File size limit: multer is configured with in-memory storage and a 10 MB limit. If you need larger files, coordinate with backend to change limits and add streaming/temporary file storage.

Endpoints Overview
------------------
1) GET /hr/employees/template[?format=xlsx|csv]
- Description: Download an import template (default XLSX). Use `?format=csv` to get CSV.
- Auth: HR only.
- Response: a file attachment (XLSX or CSV).

2) POST /hr/employees/import[?dryRun={true|false}&sendEmails={true|false}]
- Description: Upload a CSV/XLSX file to import multiple employees in bulk.
- Auth: HR only.
- Request: multipart/form-data with a single file field named `file`.
  - Field name: file
  - Accepted types: .xlsx, .xls, .csv (xlsx parsing implemented with `xlsx` lib)
  - Default behavior (no query params): dryRun=true (preview only), sendEmails=false.
- Query params:
  - dryRun (optional): if omitted or `true`, the request is a preview that performs parsing/validation/resolution but DOES NOT create users or send emails. To perform actual import set `dryRun=false`.
  - sendEmails (optional): only applied when `dryRun=false`. Default: `false`. If `sendEmails=true`, the system will attempt to send welcome emails to created users.
- Response: JSON with a per-row report. See "Response shapes" below.

3) POST /hr/parse-cv
- Description: Upload a CV (PDF) to perform lightweight parsing (text extraction). Currently only PDF is supported.
- Auth: HR only.
- Request: multipart/form-data with a single file field `file`.
- Response: JSON { success: true, text, emails, phones }
  - `text`: (string) first 10k chars of extracted text
  - `emails`: array of matched email addresses
  - `phones`: array of matched phone numbers

4) POST /hr/employee
- Single create (existing). Behavior unchanged: creates one user and sends welcome email.

5) GET /hr/employees (existing)
- Returns paginated employees and `meta.total` (used as employee count). Supports filters: search, role, position. By default returns only active users.

6) DELETE /hr/employee/:id
- Soft delete by default (sets `active=false`). Hard delete only when `?hard=true` is used (HR-only route). Use with care.

Template format and expected columns
-----------------------------------
The template file (`scripts/employee-import-template.csv`) contains headers and example rows. Column headers are case-insensitive. The importer accepts the following columns (preferred names listed first):

- Name (required) — employee full name
- Email (required) — employee email (used as login)
- Phone / PhoneNumber / phone — phone number (optional)
- PlaceOfBirth / placeOfBirth — string
- DateOfBirth / dateOfBirth — ISO date recommended (YYYY-MM-DD) or Excel date cells
- Position / position — name or id (backend will attempt to resolve by ObjectId first, then by position name)
- ManagerEmail / managerEmail — manager's email (used to resolve managerId). The importer will look up user by email and set managerId accordingly. If manager not found the importer warns and leaves managerId null.
- Role / role — one of: hr, manager, staff (defaults to staff if omitted)

Notes on columns and parsing
- Headers are case-insensitive and the importer attempts flexible mapping.
- For `position`, the importer accepts either an ObjectId (if provided) or a position name; if name not found the row will be imported with no position (warning).
- For `manager`, the importer ONLY uses `managerEmail` (email is recommended because names are ambiguous). If manager email is not found, the import will continue but row will contain a warning.
- `DateOfBirth` parsing: importer uses `new Date(...)`. Prefer ISO (YYYY-MM-DD). If parsing fails the importer will include a warning.
- Duplicates: importer detects within-file duplicates (same email appearing multiple times) and duplicates vs existing DB accounts. Duplicate rows are marked with errors and will not be created.

Dry-run / Preview mode
----------------------
- Default: the API runs in dry-run mode (preview) unless `dryRun=false` is passed.
- Dry-run performs:
  - Parse the file
  - Validate required fields (name, email)
  - Validate email format
  - Detect within-file duplicate emails
  - Detect existing emails in DB
  - Resolve managerEmail → managerId (if found)
  - Resolve position names → ids using Position collection
  - Validate date parsing
  - Return a detailed per-row result with `errors` and `warnings` and `resolved` info
- In dry-run: NO DB writes, NO emails are sent. This is safer and recommended as default.

Final import
------------
To perform import and create users:
- Call POST /hr/employees/import?dryRun=false
- If you also want welcome emails to be sent, add `&sendEmails=true`.
- The response contains created/failed counts and per-row details. If sendEmails=true and sending fails for a particular user, creation is not rolled back but the row will include a warning.

Per-row response shape (example)
--------------------------------
Each row result object in the `results` array follows:

{
  row: 2,                       // spreadsheet row number (1-indexed header at 1 => first data row = 2)
  success: true|false,
  errors: ["..."],            // fatal errors (e.g. missing required field, duplicate email)
  warnings: ["..."],          // non-fatal (e.g. position not found, manager not found, invalid date)
  resolved: {                   // resolved ids when applicable
    managerId: "<ObjectId>",
    position: "<ObjectId>"
  },
  id: "<createdUserId>",      // present only when success and dryRun=false (user created)
  email: "..."                // the email for the row
}

Top-level response (example)
----------------------------
Dry-run preview response:
{
  success: true,
  dryRun: true,
  sendEmails: false,
  created: 0,
  failed: 3,
  results: [ ... per-row objects ... ]
}

Final import response (dryRun=false):
{
  success: true,
  dryRun: false,
  sendEmails: true,
  created: 12,
  failed: 1,
  results: [ ... ]
}

Frontend UX recommendations (detailed)
--------------------------------------
Goal: provide HR a safe, obvious multi-step flow with clear feedback.

1) Page layout
- Top: "Download template" button (default XLSX). Use GET /hr/employees/template?format=xlsx.
- Upload area: file input + drag & drop. Accept .xlsx/.xls/.csv.
- Options panel (collapsed by default): checkboxes/switches for
  - "Preview (recommended)" — linked to `dryRun` (default ON). If admin is a power user, allow unchecking.
  - "Send welcome emails" — only enabled when not in preview (i.e., when ready to import). Default OFF.
- Primary button changes depending on state:
  - If preview mode on: "Preview Import" (POST without dryRun=false or with dryRun=true)
  - If preview mode off: "Start Import" (POST with dryRun=false and sendEmails as chosen)

2) Preview flow
- After upload, immediately call the import endpoint (dryRun=true). Show a loading indicator.
- When response arrives, show a table with per-row status:
  - Row number, Name, Email, ManagerEmail (as provided), Summary column containing:
    - Green: "OK" if success==true and no warnings
    - Yellow: "Warning — position not found" (show warnings inline)
    - Red: "Error — Duplicate email" (show errors inline)
  - Option to expand a row to view all warnings/errors and the resolved IDs (managerId/positionId if found).
- Provide global summary: created count if run now, failed count, number of warnings.
- Provide action buttons:
  - "Download report CSV" — allows HR to download the `results` array as CSV for offline review.
  - "Fix file" — link to re-upload after editing the uploaded XLSX locally.
  - "Proceed to Import" — enabled only if preview completed. Clicking opens a confirmation modal (see next).

3) Confirmation modal before final import
- Show a concise summary:
  - Total rows, OK rows, rows with warnings, rows with errors.
  - If there are errors, indicate they will be skipped and how many will be created.
  - Checkbox: "Send welcome emails to created users" (default unchecked). If user checks it, the UI will call sendEmails=true.
  - Strong warning: "This will create X user accounts. This action cannot be undone."
  - Buttons: "Cancel" and "Confirm and Import".

4) After import
- Show final summary: created count, failed count, link to download the detailed import result.
- For created rows, provide quick links to view the created user in the app (if frontend has a route) using returned `id`.

UX details for errors and warnings
- Errors (red) should block creation for that row. Show an inline message and suggested fix (e.g. "Duplicate email — use different email or remove existing account").
- Warnings (yellow) do not block creation by default. Examples: position not found, manager email not found, date parsing problem. Allow HR to continue but surface these prominently.

Frontend implementation notes & examples
---------------------------------------
- Use fetch or an HTTP client that supports multipart/form-data uploads.
- Always set Authorization header.

JS example (preview):
const form = new FormData();
form.append('file', fileInput.files[0]);
const resp = await fetch('/hr/employees/import', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: form,
});
const json = await resp.json();
// json.results contains per-row details

JS example (final import, no emails):
const resp = await fetch('/hr/employees/import?dryRun=false', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: form,
});

JS example (final import + send emails):
const resp = await fetch('/hr/employees/import?dryRun=false&sendEmails=true', {
  ...
});

PowerShell curl examples
- Preview (default):
curl -X POST 'http://localhost:3000/hr/employees/import' -H "Authorization: Bearer $token" -F "file=@C:\path\to\employees.xlsx"

- Final import with emails:
curl -X POST 'http://localhost:3000/hr/employees/import?dryRun=false&sendEmails=true' -H "Authorization: Bearer $token" -F "file=@C:\path\to\employees.xlsx"

Backend behaviors the frontend must handle
-----------------------------------------
- The importer returns a list with many items. The frontend should implement pagination or virtualized list if the file is large.
- When user requests final import, the call can be slow for many rows. Show a progress indicator and consider a server-side background job for >500 rows (future improvement).
- If the importer returns created IDs, frontend can show links like `/users/:id`.

Edge cases & recommendations
----------------------------
- Large imports: for >1000 rows we recommend converting the import to a background job with status polling. Current implementation is synchronous and may time out.
- Encoding: ensure uploaded CSV is UTF-8. The XLSX lib handles Excel formats.
- Manager not found: recommended to let import continue (non-fatal) and show warning. HR can re-run import after fixing managerEmail.
- If you want stricter policy (fail rows when manager not found), tell backend and we will change the importer to treat it as an error.

Testing checklist for frontend QA
---------------------------------
- Download template (xlsx) and verify it opens in Excel/Sheets.
- Upload a valid file and confirm preview shows OK rows.
- Upload file with duplicate emails and confirm preview flags duplicates.
- Upload file with unknown managerEmail and confirm preview shows warning.
- Confirm final import (dryRun=false) creates accounts (verify via DB or GET /hr/employees search).
- Confirm sendEmails=true triggers sending (watch SMTP logs or mock sendEmail in test env).
- Test CSV template download and XLSX download. Verify both open correctly.

Appendix: quick reference
-------------------------
- Download template (XLSX): GET /hr/employees/template
- Download template (CSV): GET /hr/employees/template?format=csv
- Preview import (default): POST /hr/employees/import (multipart file field `file`)
- Final import: POST /hr/employees/import?dryRun=false
- Final import + emails: POST /hr/employees/import?dryRun=false&sendEmails=true
- Parse CV (PDF): POST /hr/parse-cv (multipart file `file`)

Contact
-------
If anything is unclear, or you want changes to the column set or stricter validation rules, ping backend and we will adjust the importer and template accordingly.
