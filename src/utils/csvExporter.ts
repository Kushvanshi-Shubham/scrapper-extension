type DataType = {
  [key: string]: unknown;
};

export const exportToCSV = (
  data: DataType[],
  filename: string = "scraped-data.csv"
) => {
  if (!data || data.length === 0) {
    console.error("No data to export.");
    return;
  }

  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          let cell =
            row[header] === null || row[header] === undefined
              ? ""
              : String(row[header]);

          cell = cell.replace(/"/g, '""');
          if (cell.includes(",") || cell.includes("\n")) {
            cell = `"${cell}"`;
          }
          return cell;
        })
        .join(",")
    ),
  ];

  const csvString = csvRows.join("\n");

  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }
};
