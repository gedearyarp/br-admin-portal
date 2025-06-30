"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useStore, type Carousel } from "@/lib/store"
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
  Download,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { convertToCSV, downloadCSV } from "@/lib/csv-utils"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/rich-text-editor"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"

function RenderRichText({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content,
    editable: false,
  })
  if (!editor) return null
  return <EditorContent editor={editor} />
}

export default function CarouselPage() {
  const { carousels, fetchCarousels, createCarousel, updateCarousel, toggleCarouselStatus, isLoading, error } = useStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCarousel, setCurrentCarousel] = useState<Carousel | null>(null)
  const [formData, setFormData] = useState({
    pictures: "",
    title: "",
    subtitle: "",
    is_active: true,
  })

  useEffect(() => {
    console.log("Carousel page: Fetching data...")
    fetchCarousels()
  }, [fetchCarousels])

  // Filter carousels based on search term
  const filteredCarousels = carousels.filter(
    (carousel) =>
      (carousel.title && carousel.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (carousel.subtitle && carousel.subtitle.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Submitting form data:", formData)
    await createCarousel(formData)
    setFormData({
      pictures: "",
      title: "",
      subtitle: "",
      is_active: true,
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentCarousel) {
      console.log("Updating carousel with data:", formData)
      await updateCarousel(currentCarousel.id, formData)
      setIsEditDialogOpen(false)
    }
  }

  const handleEdit = (carousel: Carousel) => {
    console.log("Editing carousel:", carousel)
    setCurrentCarousel(carousel)
    setFormData({
      pictures: carousel.pictures || "",
      title: carousel.title || "",
      subtitle: carousel.subtitle || "",
      is_active: carousel.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const handleToggleStatus = (id: string, isActive: boolean) => {
    toggleCarouselStatus(id, isActive)
  }

  const handleDownloadCSV = () => {
    // Define columns for CSV
    const columns = {
      title: "Title",
      subtitle: "Subtitle",
      pictures: "Image URL",
      is_active: "Status",
      created_at: "Created At",
    }

    // Prepare data for CSV
    const csvData = filteredCarousels.map((carousel) => ({
      ...carousel,
      is_active: carousel.is_active ? "Active" : "Inactive",
      created_at: carousel.created_at ? format(new Date(carousel.created_at), "yyyy-MM-dd") : "N/A",
    }))

    // Convert to CSV and download
    const csv = convertToCSV(csvData, columns)
    downloadCSV(csv, `carousels-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  return (
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Carousel Management</h2>
        <div className="mt-2 flex items-center gap-2 sm:mt-0">
          <Button variant="outline" size="sm" onClick={() => fetchCarousels()} disabled={isLoading.carousels}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading.carousels ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </Button>
        </div>
      </div>

      {error.carousels && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.carousels}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Carousel Banners</CardTitle>
          <CardDescription>Manage banner images for the carousel/slider on your website.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by title or subtitle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownloadCSV}
                disabled={isLoading.carousels || filteredCarousels.length === 0}
                title="Download as CSV"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download as CSV</span>
              </Button>
            </div>
          </div>

          {isLoading.carousels ? (
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
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCarousels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {error.carousels ? "Error loading data" : "No banners found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCarousels.map((carousel) => (
                      <TableRow key={carousel.id}>
                        <TableCell>
                          {carousel.pictures ? (
                            <img
                              src={carousel.pictures}
                              alt={carousel.title}
                              className="h-12 w-16 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-16 bg-gray-200 rounded flex items-center justify-center">
                              <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium min-w-[180px]">
                          <RenderRichText content={carousel.title} />
                        </TableCell>
                        <TableCell>{carousel.subtitle || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={carousel.is_active ? "default" : "secondary"}>
                            {carousel.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {carousel.created_at ? format(new Date(carousel.created_at), "MMM dd, yyyy") : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEdit(carousel)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(carousel.id, !carousel.is_active)}
                              >
                                {carousel.is_active ? "Deactivate" : "Activate"}
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
              <DialogDescription>Create a new carousel banner with image and details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-pictures">Banner Image</Label>
                <ImageUpload
                  value={formData.pictures}
                  onChange={(value) => setFormData({ ...formData, pictures: value })}
                  onRemove={() => setFormData({ ...formData, pictures: "" })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-title">Title</Label>
                <RichTextEditor
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                  placeholder="Enter banner title..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-subtitle">Subtitle</Label>
                <Input
                  id="create-subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-is-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="create-is-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Banner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Banner</DialogTitle>
              <DialogDescription>Update banner information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-pictures">Banner Image</Label>
                <ImageUpload
                  value={formData.pictures}
                  onChange={(value) => setFormData({ ...formData, pictures: value })}
                  onRemove={() => setFormData({ ...formData, pictures: "" })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <RichTextEditor
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                  placeholder="Enter banner title..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subtitle">Subtitle</Label>
                <Input
                  id="edit-subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="edit-is-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Banner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 