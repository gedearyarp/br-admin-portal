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
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  AlertCircle,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { convertToCSV, downloadCSV } from "@/lib/csv-utils"
import { RichTextEditor } from "@/components/rich-text-editor"
import { formatUrl } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/image-upload"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function CommunitiesPage() {
  const { communities, fetchCommunities, createCommunity, updateCommunity, toggleCommunityStatus, isLoading, error } =
    useStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null)
  const [formData, setFormData] = useState({
    signup_link: "",
    main_img: "",
    banner_img: "",
    community_img: "",
    is_active: true,
    title: "",
    category: "",
    event_date: "",
    event_location: "",
    event_overview: "",
    event_tnc: "",
    time_place: "",
    full_rundown_url: "",
    documentation_url: "",
    category_type: "",
  })

  useEffect(() => {
    console.log("Communities page: Fetching data...")
    fetchCommunities()
  }, [fetchCommunities])

  // Set the default date after component mounts
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      event_date: new Date().toISOString().split("T")[0]
    }))
  }, [])

  // Filter communities based on search term
  const filteredCommunities = communities.filter(
    (community) =>
      (community.title && community.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (community.category && community.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (community.event_location && community.event_location.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting form data:", formData)
    const formattedData = {
      ...formData,
      signup_link: formatUrl(formData.signup_link),
      full_rundown_url: formData.full_rundown_url ? formatUrl(formData.full_rundown_url) : "",
      documentation_url: formData.documentation_url ? formatUrl(formData.documentation_url) : "",
    }
    await createCommunity(formattedData)
    setFormData({
      signup_link: "",
      main_img: "",
      banner_img: "",
      community_img: "",
      is_active: true,
      title: "",
      category: "",
      event_date: "",
      event_location: "",
      event_overview: "",
      event_tnc: "",
      time_place: "",
      full_rundown_url: "",
      documentation_url: "",
      category_type: "",
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCommunity) {
      console.log("Updating community with data:", formData)
      const formattedData = {
        ...formData,
        signup_link: formatUrl(formData.signup_link),
        full_rundown_url: formData.full_rundown_url ? formatUrl(formData.full_rundown_url) : "",
        documentation_url: formData.documentation_url ? formatUrl(formData.documentation_url) : "",
      }
      await updateCommunity(currentCommunity.id, formattedData)
      setIsEditDialogOpen(false)
    }
  }

  const handleEdit = (community: Community) => {
    console.log("Editing community:", community)
    setCurrentCommunity(community)
    setFormData({
      signup_link: community.signup_link || "",
      main_img: community.main_img || "",
      banner_img: community.banner_img || "",
      community_img: community.community_img || "",
      is_active: community.is_active,
      title: community.title || "",
      category: community.category || "",
      event_date: community.event_date || "",
      event_location: community.event_location || "",
      event_overview: community.event_overview || "",
      event_tnc: community.event_tnc || "",
      time_place: community.time_place || "",
      full_rundown_url: community.full_rundown_url || "",
      documentation_url: community.documentation_url || "",
      category_type: community.category_type || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleCommunityStatus(id, isActive)
  }

  const handleDownloadCSV = () => {
    // Define columns for CSV
    const columns = {
      title: "Title",
      category: "Category",
      event_date: "Event Date",
      event_location: "Event Location",
      signup_link: "Signup Link",
      full_rundown_url: "Full Rundown URL",
      documentation_url: "Documentation URL",
      main_img: "Main Image",
      banner_img: "Banner Image",
      community_img: "Community Image",
      is_active: "Status",
      created_at: "Created At",
    }

    // Prepare data for CSV
    const csvData = filteredCommunities.map((community) => ({
      ...community,
      is_active: community.is_active ? "Active" : "Inactive",
      created_at: community.created_at ? format(new Date(community.created_at), "yyyy-MM-dd") : "N/A",
      event_date: community.event_date ? format(new Date(community.event_date), "yyyy-MM-dd") : "N/A",
    }))

    // Convert to CSV and download
    const csv = convertToCSV(csvData, columns)
    downloadCSV(csv, `communities-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
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
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category_type">Category Type</Label>
                    <Select
                      value={formData.category_type}
                      onValueChange={(value) => setFormData({ ...formData, category_type: value })}
                    >
                      <SelectTrigger id="category_type">
                        <SelectValue placeholder="Select category type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marathon">Marathon</SelectItem>
                        <SelectItem value="exhibition">Exhibition</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_date">Event Date</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_location">Event Location</Label>
                    <Input
                      id="event_location"
                      value={formData.event_location}
                      onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                      placeholder="e.g. Bali, Jakarta"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_overview">Event Overview</Label>
                    <RichTextEditor
                      value={formData.event_overview}
                      onChange={(value) => setFormData({ ...formData, event_overview: value })}
                      placeholder="Introductory paragraph summarizing the event"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_tnc">Terms & Conditions</Label>
                    <RichTextEditor
                      value={formData.event_tnc}
                      onChange={(value) => setFormData({ ...formData, event_tnc: value })}
                      placeholder="Terms and conditions for the event"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time_place">Time & Place</Label>
                    <RichTextEditor
                      value={formData.time_place}
                      onChange={(value) => setFormData({ ...formData, time_place: value })}
                      placeholder="Information about time and place"
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
                    <Label htmlFor="full_rundown_url">Full Rundown URL</Label>
                    <Input
                      id="full_rundown_url"
                      value={formData.full_rundown_url}
                      onChange={(e) => setFormData({ ...formData, full_rundown_url: e.target.value })}
                      placeholder="https://example.com/full-rundown"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="documentation_url">Documentation URL</Label>
                    <Input
                      id="documentation_url"
                      value={formData.documentation_url}
                      onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                      placeholder="https://example.com/documentation"
                    />
                  </div>
                  <div className="grid gap-2">
                    <ImageUpload
                      label="Main Image"
                      value={formData.main_img}
                      onChange={(value) => setFormData({ ...formData, main_img: value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <ImageUpload
                      label="Banner Image"
                      value={formData.banner_img}
                      onChange={(value) => setFormData({ ...formData, banner_img: value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <ImageUpload
                      label="Community Image"
                      value={formData.community_img}
                      onChange={(value) => setFormData({ ...formData, community_img: value })}
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
          <CardDescription>
            Manage communities for your website.
            <a
              href="https://docs.google.com/document/d/1skoYSLTXVl2vUK1t7twmAhbYaSn1jMT258y4iJ2uJJo/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              View Community Creation Guidelines
            </a>
          </CardDescription>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Event Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Signup Link</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommunities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        {error.communities ? "Error loading data" : "No communities found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCommunities.map((community) => (
                      <TableRow key={community.id}>
                        <TableCell className="font-medium">{community.title || "—"}</TableCell>
                        <TableCell>{community.category || "—"}</TableCell>
                        <TableCell>
                          {community.event_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{format(new Date(community.event_date), "MMM dd, yyyy")}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {community.event_location ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{community.event_location}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {community.signup_link ? (
                            <div className="flex items-center">
                              <a
                                href={formatUrl(community.signup_link)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <span className="truncate max-w-[100px]">Link</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={community.is_active ? "default" : "secondary"}>
                            {community.is_active ? "Active" : "Inactive"}
                          </Badge>
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
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category_type">Category Type</Label>
                <Select
                  value={formData.category_type}
                  onValueChange={(value) => setFormData({ ...formData, category_type: value })}
                >
                  <SelectTrigger id="edit-category_type">
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marathon">Marathon</SelectItem>
                    <SelectItem value="exhibition">Exhibition</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-event_date">Event Date</Label>
                <Input
                  id="edit-event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-event_location">Event Location</Label>
                <Input
                  id="edit-event_location"
                  value={formData.event_location}
                  onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                  placeholder="e.g. Bali, Jakarta"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-event_overview">Event Overview</Label>
                <RichTextEditor
                  value={formData.event_overview}
                  onChange={(value) => setFormData({ ...formData, event_overview: value })}
                  placeholder="Introductory paragraph summarizing the event"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-event_tnc">Terms & Conditions</Label>
                <RichTextEditor
                  value={formData.event_tnc}
                  onChange={(value) => setFormData({ ...formData, event_tnc: value })}
                  placeholder="Terms and conditions for the event"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time_place">Time & Place</Label>
                <RichTextEditor
                  value={formData.time_place}
                  onChange={(value) => setFormData({ ...formData, time_place: value })}
                  placeholder="Information about time and place"
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
                <Label htmlFor="edit-full_rundown_url">Full Rundown URL</Label>
                <Input
                  id="edit-full_rundown_url"
                  value={formData.full_rundown_url}
                  onChange={(e) => setFormData({ ...formData, full_rundown_url: e.target.value })}
                  placeholder="https://example.com/full-rundown"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-documentation_url">Documentation URL</Label>
                <Input
                  id="edit-documentation_url"
                  value={formData.documentation_url}
                  onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                  placeholder="https://example.com/documentation"
                />
              </div>
              <div className="grid gap-2">
                <ImageUpload
                  label="Main Image"
                  value={formData.main_img}
                  onChange={(value) => setFormData({ ...formData, main_img: value })}
                />
              </div>
              <div className="grid gap-2">
                <ImageUpload
                  label="Banner Image"
                  value={formData.banner_img}
                  onChange={(value) => setFormData({ ...formData, banner_img: value })}
                />
              </div>
              <div className="grid gap-2">
                <ImageUpload
                  label="Community Image"
                  value={formData.community_img}
                  onChange={(value) => setFormData({ ...formData, community_img: value })}
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
