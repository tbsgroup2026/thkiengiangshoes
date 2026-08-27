const fs = require('fs');
const path = require('path');

// Use a simple approach: read as binary and parse
const ExcelJS = require('exceljs');

async function parseMapping() {
  try {
    const filePath = path.join(__dirname, 'mapping_370_employees.xlsx');
    
    console.log('📂 Reading file:', filePath);
    console.log('📏 File size:', fs.statSync(filePath).size, 'bytes');
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.worksheets[0];
    console.log(`\n📊 Worksheet: "${worksheet.name}"`);
    console.log(`📈 Total rows: ${worksheet.rowCount}`);
    
    // Get header row (row 2 based on screenshot)
    const headers = [];
    const headerRow = worksheet.getRow(2);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value ? String(cell.value).trim() : '';
    });
    
    console.log(`\n📋 Headers (${headers.filter(h => h).length} columns):`);
    headers.forEach((h, idx) => {
      if (h) console.log(`  [${idx}] ${h}`);
    });
    
    // Find key columns
    const msgnCol = headers.findIndex(h => h.toUpperCase().includes('MSNV'));
    const nameCol = headers.findIndex(h => h.toUpperCase().includes('HỌ') && h.toUpperCase().includes('TÊN'));
    const pbNewCol = headers.findIndex(h => h.includes('(NEW)') || h.includes('Phòng ban'));
    const deptNewCol = headers.findIndex(h => h.includes('BỘ PHẬN') && h.includes('NEW'));
    
    console.log(`\n🔍 Key columns found:`);
    console.log(`  MSNV: column ${msgnCol}`);
    console.log(`  Name: column ${nameCol}`);
    console.log(`  Dept (NEW): column ${deptNewCol}`);
    console.log(`  PB (NEW): column ${pbNewCol}`);
    
    // Parse data rows (start from row 3, skip headers)
    const mappingData = [];
    let validCount = 0;
    let invalidCount = 0;
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 2) return; // Skip header rows
      
      const msnv = row.getCell(msgnCol + 1)?.value;
      const name = row.getCell(nameCol + 1)?.value;
      const deptNew = row.getCell(deptNewCol + 1)?.value;
      const pbNew = row.getCell(pbNewCol + 1)?.value;
      
      if (msnv && (deptNew || pbNew)) {
        mappingData.push({
          msnv: String(msnv).trim(),
          name: name ? String(name).trim() : '',
          department_new: deptNew ? String(deptNew).trim() : '',
          phong_ban_new: pbNew ? String(pbNew).trim() : '',
          row: rowNumber
        });
        
        if (deptNew || pbNew) {
          validCount++;
        } else {
          invalidCount++;
        }
      } else if (msnv) {
        invalidCount++;
        console.log(`⚠️ Row ${rowNumber}: MSNV ${msnv} - Missing department info`);
      }
    });
    
    console.log(`\n✅ Valid records: ${validCount}`);
    console.log(`❌ Invalid records: ${invalidCount}`);
    console.log(`\n📊 Sample data (first 10):`);
    mappingData.slice(0, 10).forEach((item, idx) => {
      console.log(`  [${idx + 1}] ${item.msnv} | ${item.name} | ${item.department_new || item.phong_ban_new}`);
    });
    
    // Export to JSON
    const jsonPath = path.join(__dirname, 'mapping_370_employees.json');
    fs.writeFileSync(jsonPath, JSON.stringify(mappingData, null, 2));
    console.log(`\n💾 Exported to: ${jsonPath}`);
    
    // Summary statistics
    const departments = [...new Set(mappingData.map(m => m.department_new || m.phong_ban_new))];
    console.log(`\n📈 Department groups found: ${departments.length}`);
    departments.forEach(dept => {
      const count = mappingData.filter(m => (m.department_new || m.phong_ban_new) === dept).length;
      console.log(`  • ${dept}: ${count} employees`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

parseMapping();
