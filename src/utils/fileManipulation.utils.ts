import XLSX from 'xlsx';

async function readXLSXData<T>(
  xlsxFilePath: string,
  sheetName: string
): Promise<T[]> {
  const workbook = XLSX.readFile(xlsxFilePath);
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json<T>(sheet);
  return data;
}
export default readXLSXData;
