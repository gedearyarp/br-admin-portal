/**
 * Convert an array of objects to CSV format
 * @param data Array of objects to convert
 * @param columns Object mapping column keys to display names
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, any>>(data: T[], columns: Record<string, string>) {
  if (data.length === 0) return ""

  // Create header row
  const headerRow = Object.values(columns).join(",")

  // Create data rows
  const rows = data.map((item) => {
    return Object.keys(columns)
      .map((key) => {
        // Handle values that might contain commas or quotes
        const value = item[key] !== undefined && item[key] !== null ? String(item[key]) : ""
        const escapedValue =
          value.includes(",") || value.includes('"') || value.includes("\n") ? `"${value.replace(/"/g, '""')}"` : value
        return escapedValue
      })
      .join(",")
  })

  // Combine header and rows
  return [headerRow, ...rows].join("\n")
}

/**
 * Download data as a CSV file
 * @param data CSV string
 * @param filename Filename for the downloaded file
 */
export function downloadCSV(data: string, filename: string) {
  // Create a blob with the CSV data
  const blob = new Blob([data], { type: "text/csv;charset=utf-8;" })

  // Create a download link
  const link = document.createElement("a")

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Set link properties
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Add link to document, click it, and remove it
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
