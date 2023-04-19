import * as XLSX from "xlsx";

const getFileName = (name: string) => {
  let sheetName = "badges-list";
  let fileName = "badges-list";
  return {
    sheetName,
    fileName
  };
};
export class BadgeUtil {
  static exportArrayToExcel(arr: any[], name?: string) {
    let { sheetName, fileName } = getFileName(name);
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(arr);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.csv`);
  }
}
