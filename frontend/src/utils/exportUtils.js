// utils/exportUtils.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

export const exportCSV = (data, fileName) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data available to export.');
    return;
  }
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};

export const exportPDF = (data, title) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data available to export.');
    return;
  }
  const doc = new jsPDF();
  doc.text(title, 10, 10);
  const tableData = data.map((row) => Object.values(row));
  const tableHeaders = Object.keys(data[0] || {}).map((key) =>
    key.charAt(0).toUpperCase() + key.slice(1)
  );
  doc.autoTable({
    head: [tableHeaders],
    body: tableData,
  });
  doc.save(`${title}.pdf`);
};
