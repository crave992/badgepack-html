import * as XLSX from "xlsx";

const getFileName = (name: string) => {
  let sheetName = "groups-list";
  let fileName = "groups-list";
  return {
    sheetName,
    fileName
  };
};
export class GroupUtil {
  static exportArrayToExcel(arr: any[], name?: string) {
    let { sheetName, fileName } = getFileName(name);
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(arr);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.csv`);
  }
}
