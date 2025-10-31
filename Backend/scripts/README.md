# Employee import template generator

This folder contains the CSV template and a small script to generate an XLSX template.

Why: The import endpoint expects an XLSX template. If you maintain the CSV file, you can generate the XLSX locally.

How to generate the XLSX template:

1. Make sure you have dependencies installed (in the repo root `Backend`):

```powershell
cd d:/HRIS/DevAlign/Backend
npm install
```

2. Run the generator script:

```powershell
node .\scripts\generate-employee-template.js
```

This will produce `scripts/employee-import-template.xlsx` which can be downloaded by the API at `GET /hr/employees/template`.

Headers used (case-insensitive):
- name
- email
- phoneNumber
- placeOfBirth
- dateOfBirth (ISO format yyyy-mm-dd recommended)
- position (can be position name or ObjectId)
- managerEmail
- role (e.g., staff, manager, hr)

Example rows are present in `employee-import-template.csv` as guidance for HR users.