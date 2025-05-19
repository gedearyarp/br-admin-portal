"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useStore, type Community } from "@/lib/store"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AlertCircle, Download, MoreHorizontal, Plus, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { convertToCSV, downloadCSV } from "@/lib/csv-utils"

export default function CommunitiesPage() {
  const { communities, fetchCommunities, createCommunity, updateCommunity, toggleCommunityStatus, isLoading, error } =
    useStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    signup_link: "",
    image_url: "",
    is_active: true,
  })

  useEffect(() => {
    console.log("Communities page: Fetching data...")
    fetchCommunities()
  }, [fetchCommunities])

  // Filter communities based on search term
  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCommunity(formData)
    setFormData({
      name: "",
      description: "",
      signup_link: "",
      image_url: "",
      is_active: true,
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCommunity) {
      updateCommunity(currentCommunity.id, formData)
      setIsEditDialogOpen(false)
    }
  }

  const handleEdit = (community: Community) => {
    setCurrentCommunity(community)
    setFormData({
      name: community.name,
      description: community.description,
      signup_link: community.signup_link,
      image_url: community.image_url,
      is_active: community.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleCommunityStatus(id, isActive)
  }

  const handleDownloadCSV = () => {
    // Define columns for CSV
    const columns = {
      name: "Name",
      description: "Description",
      signup_link: "Signup Link",
      is_active: "Status",
      created_at: "Created At",
    }

    // Prepare data for CSV
    const csvData = filteredCommunities.map((community) => ({
      ...community,
      is_active: community.is_active ? "Active" : "Inactive",
      created_at: community.created_at ? format(new Date(community.created_at), "yyyy-MM-dd") : "N/A",
    }))

    // Convert to CSV and download
    const csv = convertToCSV(csvData, columns)
    downloadCSV(csv, `communities-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Communities Management</h2>
        <div className="mt-2 flex items-center gap-2 sm:mt-0">
          <Button variant="outline" size="sm" onClick={() => fetchCommunities()} disabled={isLoading.communities}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading.communities ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Community
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Community</DialogTitle>
                  <DialogDescription>Create a new community for your website.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="signup_link">Signup Link</Label>
                    <Input
                      id="signup_link"
                      value={formData.signup_link}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          signup_link: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Community</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error.communities && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.communities}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Communities</CardTitle>
          <CardDescription>Manage communities for your website.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownloadCSV}
              disabled={isLoading.communities || filteredCommunities.length === 0}
              title="Download as CSV"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download as CSV</span>
            </Button>
          </div>

          {isLoading.communities ? (
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
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {error.communities ? "Error loading data" : "No communities found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCommunities.map((community) => (
                      <TableRow key={community.id}>
                        <TableCell className="font-medium">{community.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{community.description}</TableCell>
                        <TableCell>
                          <Badge variant={community.is_active ? "default" : "secondary"}>
                            {community.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {community.created_at ? format(new Date(community.created_at), "MMM dd, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(community)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(community.id, !community.is_active)}>
                                {community.is_active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Community</DialogTitle>
              <DialogDescription>Update community information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-signup_link">Signup Link</Label>
                <Input
                  id="edit-signup_link"
                  value={formData.signup_link}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      signup_link: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image_url">Image URL</Label>
                <Input
                  id="edit-image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="edit-is_active">Active</Label>
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Community</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
