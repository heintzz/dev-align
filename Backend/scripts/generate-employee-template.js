const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

(async () => {
  try {
    const csvPath = path.join(__dirname, 'employee-import-template.csv');
    const xlsxPath = path.join(__dirname, 'employee-import-template.xlsx');

    if (!fs.existsSync(csvPath)) {
      console.error('CSV template not found at', csvPath);
      process.exit(1);
    }

  const csv = fs.readFileSync(csvPath, 'utf8');
  const wb = XLSX.utils.book_new();
  // csv_to_sheet correctly parses CSV string into a worksheet
  const ws = XLSX.utils.csv_to_sheet(csv);
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, xlsxPath);

    console.log('Generated XLSX template at', xlsxPath);
  } catch (err) {
    console.error('Failed to generate XLSX template:', err.message || err);
    process.exit(1);
  }
})();
