## HR Backend — Frontend Integration Notes

Ringkasan singkat untuk tim Frontend: dokumen ini berisi endpoint yang paling penting, contoh request/response, dan catatan implementasi supaya tim frontend bisa langsung mulai mengintegrasikan UI.

### Authentication
- Semua endpoint membutuhkan header: `Authorization: Bearer <JWT_TOKEN>` kecuali yang secara eksplisit tidak (periksa route middleware).
- Token dikeluarkan oleh service auth (login) — gunakan token tersebut untuk panggilan API.

### Base paths (assume server prefix)
- `/hr/employees` — list, import, template download
- `/hr/employee/:id` — get, update, delete
- `/hr/parse-cv` — upload CV (PDF) untuk parsing

---

### 1) GET /hr/employees
- Query params:
  - `page` (int, optional, default 1)
  - `limit` (int, optional, default 20)
  - `search` (string, optional)
  - `role` (string, optional)
  - `position` (id, optional)
  - `includeInactive=true` (boolean, only allowed for `hr` role)
- Response (200):
```json
{
  "success": true,
  "data": [ /* array of users */ ],
  "meta": { "total": 123, "page": 1, "limit": 20 }
}
```

Notes:
- `data` items follow DTO shape: includes `id`, `name`, `email`, `phoneNumber`, `position` (populated object), `managerId`, `role`, `active`, `createdAt`, `updatedAt`.

---

### 2) GET /hr/employee/:id
- Path param: `id` (Mongo ObjectId)
- Authorization: `hr` and `manager` can view any; others only their own record.
- Response 200: `{ success: true, data: <user> }`
- Errors: 400 Invalid ID, 403 Forbidden, 404 Not Found

---

### 3) POST /hr/employee
- Body: JSON
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "0812...",
  "position": "<positionId>",
  "managerId": "<userId>",
  "role": "staff"
}
```
- Response 201: `{ success: true, data: <createdUser> }`
- Error: 400 Duplicate Email

---

### 4) PUT /hr/employee/:id
- Body: updatable fields: `name`, `email`, `phoneNumber`, `placeOfBirth`, `dateOfBirth`, `position`, `managerId`, `role`.
- Response 200: `{ success: true, data: <updatedUser> }`

---

### 5) DELETE /hr/employee/:id
- Default **soft-delete**: sets `active=false`.
- To hard-delete (remove from DB) use query `?hard=true` (HR-only route).
- Responses:
  - 200 `{ success: true, message: 'Employee deactivated' }`
  - 200 `{ success: true, message: 'Employee hard-deleted' }`

---

### 6) POST /hr/employees/import
- Purpose: bulk import employees from Excel/CSV.
- Upload: form-data with field `file` (use multipart/form-data). The file can be `.xlsx` or `.csv` (handler uses multer memory storage).
- Query params (defaults):
  - `dryRun` (boolean) — default: `true` (preview mode). To actually create accounts set `?dryRun=false`.
  - `sendEmails` (boolean) — default: `false`. If true, will attempt to send welcome emails for created accounts.
- Important: Manager mapping resolves by `managerEmail` (email field in file). If the manager email is not found in system, row will get a warning; it will not block creation unless you choose to treat warnings as fatal in UI.
- File field name: `file` (form-data). Limit: project default multer memory limit (~10MB). If you expect larger files, ask backend to increase or use chunking.
- Response (200):
```json
{
  "success": true,
  "dryRun": true,
  "sendEmails": false,
  "created": 0,
  "failed": 10,
  "results": [ { "row": 2, "errors": ["Invalid email format"], "warnings": [] }, ... ]
}
```

Frontend flow recommendation:
- Step 1: Upload file with `dryRun` default (no creation) -> show `results` table with row-level errors/warnings.
- Step 2: If all acceptable, call again with `?dryRun=false&sendEmails=true` (if you want to send welcome emails).

---

### 7) GET /hr/employees/template
- Query `?format=xlsx|csv` (default `xlsx`).
- Returns file download attachment. Use to generate example template for users.

---

### 8) POST /hr/parse-cv
- Upload: form-data field `file` (PDF). Currently only PDF supported.
- Response 200:
```json
{ "success": true, "text": "...extracted text...", "emails": ["a@x.com"], "phones": ["+62..."] }
```

---

### Error shapes (common)
- `400` Bad Request — invalid id, missing file, invalid file type, duplicate email
- `403` Forbidden — insufficient role
- `404` Not Found — resource not found
- `500` Internal Server Error — unexpected

Example error:
```json
{ "success": false, "error": "Invalid ID" }
```

---

### Frontend examples (axios)
1) List employees
```js
const res = await axios.get('/hr/employees?page=1&limit=20', { headers: { Authorization: `Bearer ${token}` } });
// res.data.data -> users
```

2) Import preview
```js
const form = new FormData();
form.append('file', fileInput.files[0]);
const res = await axios.post('/hr/employees/import', form, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
// res.data.results -> per-row validation
```

3) Import final (create accounts)
```js
const res = await axios.post('/hr/employees/import?dryRun=false&sendEmails=false', form, { headers: { Authorization: `Bearer ${token}` } });
```

---

### Operational notes & caveats
- Email sending relies on backend `utils/email.js` and SMTP config in env; in dev it may be mocked or fail silently.
- Multer uses memory storage; large files (>10MB) may be rejected. Coordinate with backend if you need bigger limits.
- The backend enforces soft-delete; frontend should treat `active:false` as hidden unless `includeInactive=true` (hr only).
- There are no end-to-end automated tests in repo for import flow; recommend QA on staging with sample files.

---

If kamu mau, saya akan:
- Tambahkan file Postman/OpenAPI export berikutnya, atau
- Tambahkan contoh React component untuk upload + preview yang bisa langsung dipasang di `Frontend/src/components`.

Dokumen ini ditempatkan di `docs/frontend-hr-api.md`.

Signed-off-by: Backend integration helper
