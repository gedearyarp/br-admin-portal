"use client"

import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function CommunityMembersPage({
  params,
}: {
  params: { id: string }
}) {
  const { communities, communitySignups, fetchCommunities, fetchCommunitySignups, isLoading, error } = useStore()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    console.log("Community members page: Fetching data...")
    fetchCommunities()
    fetchCommunitySignups(params.id)
  }, [fetchCommunities, fetchCommunitySignups, params.id])

  const community = communities.find((c) => c.id === params.id)

  // Filter signups based on search term
  const filteredSignups = communitySignups.filter(
    (signup) =>
      signup.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (signup.user_name && signup.user_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/communities">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">{community ? community.name : "Community"} Members</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchCommunitySignups(params.id)}
          disabled={isLoading.communitySignups}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading.communitySignups ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error.communitySignups && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.communitySignups}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Community Members</CardTitle>
          <CardDescription>View all users who have signed up for this community.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          {isLoading.communitySignups ? (
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
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Signup Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSignups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        {error.communitySignups ? "Error loading data" : "No members found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSignups.map((signup) => (
                      <TableRow key={signup.id}>
                        <TableCell>{signup.user_email}</TableCell>
                        <TableCell>{signup.user_name || "N/A"}</TableCell>
                        <TableCell>
                          {signup.signup_date ? format(new Date(signup.signup_date), "MMM dd, yyyy") : "N/A"}
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
