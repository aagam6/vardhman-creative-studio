import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';

const rows=[{
  'Applicant Full Name':'શ્રીમતી મીનાક્ષીબેન રસીકલાલ શાહ પરિવાર',
  'Mobile Number (WhatsApp)':'+919876543210',City:'અમદાવાદ',
  'Number of Passes Required':6,'Names of Additional Participants':'પ્રથમ નામ\nબીજું નામ,Third Guest;Fourth Guest',
  'Pass Generated':'YES','Pass Number':'PVC-2026-000021 to PVC-2026-000026',
  'Generated Date':'24-10-2026','Generated Time':'11:55 PM',Status:'Generated',
}, {
  'Applicant Full Name':'Synthetic Guest','Mobile Number (WhatsApp)':'001234567890',City:'Surat',
  'Number of Passes Required':1,'Names of Additional Participants':'','Pass Generated':'NO',
  'Pass Number':'','Generated Date':'','Generated Time':'',Status:'Pending',
}];

test('official SheetJS distribution includes both security fixes',()=>{
  assert.equal(XLSX.version,'0.20.3');
});

for(const bookType of ['xlsx','biff8'])test(`existing Excel APIs preserve Gujarati, first sheet, phone strings and pass logs (${bookType})`,()=>{
  const sheet=XLSX.utils.json_to_sheet(rows);
  const book=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book,sheet,'Passes');
  XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet([{Name:'Ignored second sheet'}]),'Other');
  const bytes=XLSX.write(book,{type:'array',bookType});
  const imported=XLSX.read(new Uint8Array(bytes),{type:'array'});
  assert.equal(imported.SheetNames[0],'Passes');
  const actual=XLSX.utils.sheet_to_json(imported.Sheets[imported.SheetNames[0]]);
  assert.deepEqual(actual,rows);
  const updated=actual.map((row,i)=>({...row,'Pass Generated':i?'YES':row['Pass Generated'],'Pass Number':i?'PVC-2026-000027':row['Pass Number'],Status:'Generated'}));
  const exported=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(exported,XLSX.utils.json_to_sheet(updated),'Passes');
  const result=XLSX.read(XLSX.write(exported,{type:'array',bookType:'xlsx'}),{type:'array'});
  assert.deepEqual(XLSX.utils.sheet_to_json(result.Sheets.Passes),updated);
  assert.equal({}.polluted,undefined);
});
