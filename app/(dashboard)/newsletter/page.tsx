"use client"

import { useEffect, useState } from "react"
import { useStore, type Newsletter } from "@/lib/store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Download, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { convertToCSV, downloadCSV } from "@/lib/csv-utils"

export default function NewsletterPage() {
  const { newsletters, fetchNewsletters, isLoading, error } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<keyof Newsletter>("signup_date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    console.log("Newsletter page: Fetching data...")
    fetchNewsletters()
  }, [fetchNewsletters])

  // Filter newsletters based on search term
  const filteredNewsletters = newsletters.filter((newsletter) =>
    newsletter.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort newsletters
  const sortedNewsletters = [...filteredNewsletters].sort((a, b) => {
    if (sortBy === "signup_date") {
      return sortOrder === "asc"
        ? new Date(a.signup_date).getTime() - new Date(b.signup_date).getTime()
        : new Date(b.signup_date).getTime() - new Date(a.signup_date).getTime()
    }

    if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1
    if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const handleSort = (column: keyof Newsletter) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handleDownloadCSV = () => {
    // Define columns for CSV
    const columns = {
      email: "Email",
      signup_date: "Signup Date",
      tags: "Tags",
    }

    // Prepare data for CSV (format dates and join tags)
    const csvData = sortedNewsletters.map((newsletter) => ({
      ...newsletter,
      signup_date: newsletter.signup_date ? format(new Date(newsletter.signup_date), "yyyy-MM-dd") : "N/A",
      tags: newsletter.tags ? newsletter.tags.join(", ") : "",
    }))

    // Convert to CSV and download
    const csv = convertToCSV(csvData, columns)
    downloadCSV(csv, `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Newsletter Management</h2>
        <Button variant="outline" size="sm" onClick={() => fetchNewsletters()} disabled={isLoading.newsletters}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading.newsletters ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error.newsletters && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.newsletters}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscribers</CardTitle>
          <CardDescription>Manage users who have signed up for your newsletter.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-full sm:w-[180px]">
                <Select
                  value={`${sortBy}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [column, order] = value.split("-")
                    setSortBy(column as keyof Newsletter)
                    setSortOrder(order as "asc" | "desc")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                    <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                    <SelectItem value="signup_date-desc">Newest First</SelectItem>
                    <SelectItem value="signup_date-asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownloadCSV}
                disabled={isLoading.newsletters || sortedNewsletters.length === 0}
                title="Download as CSV"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download as CSV</span>
              </Button>
            </div>
          </div>

          {isLoading.newsletters ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                      Email
                      {sortBy === "email" && <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("signup_date")}>
                      Date of Signup
                      {sortBy === "signup_date" && <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>}
                    </TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNewsletters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        {error.newsletters ? "Error loading data" : "No subscribers found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedNewsletters.map((newsletter) => (
                      <TableRow key={newsletter.id}>
                        <TableCell>{newsletter.email}</TableCell>
                        <TableCell>
                          {newsletter.signup_date ? format(new Date(newsletter.signup_date), "MMM dd, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {newsletter.tags && newsletter.tags.length > 0
                              ? newsletter.tags.map((tag) => (
                                  <Badge key={tag} variant="outline">
                                    {tag}
                                  </Badge>
                                ))
                              : "No tags"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
