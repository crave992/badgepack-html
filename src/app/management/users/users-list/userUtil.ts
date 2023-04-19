import * as XLSX from "xlsx";

const getFileName = (name: string) => {
  let sheetName = "users-list";
  let fileName = "users-list";
  return {
    sheetName,
    fileName
  };
};
export class UserUtil {
  static exportArrayToExcel(arr: any[], name?: string) {
    let { sheetName, fileName } = getFileName(name);
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(arr);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.csv`);
  }
}
