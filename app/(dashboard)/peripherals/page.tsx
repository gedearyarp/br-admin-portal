"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useStore, type Peripheral } from "@/lib/store"
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
import { AlertCircle, Calendar, Download, FileText, MoreHorizontal, Plus, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { convertToCSV, downloadCSV } from "@/lib/csv-utils"
import { ImageUpload } from "@/components/ui/image-upload"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function PeripheralsPage() {
  const {
    peripherals,
    fetchPeripherals,
    createPeripheral,
    updatePeripheral,
    togglePeripheralStatus,
    isLoading,
    error,
  } = useStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentPeripheral, setCurrentPeripheral] = useState<Peripheral | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    is_active: true,
    credits: "",
    event_overview: "",
    event_date: "",
    highlight_quote: "",
    paragraph_1: "",
    paragraph_2: "",
    paragraph_bottom: "",
    background_color: "white",
    main_img: "",
    banner_img: "",
    left_img: "",
    right_img: "",
    short_overview: "",
    category_type: "",
  })

  useEffect(() => {
    console.log("Peripherals page: Fetching data...")
    fetchPeripherals()
  }, [fetchPeripherals])

  // Set the default date after component mounts
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      event_date: new Date().toISOString().split("T")[0]
    }))
  }, [])

  // Filter peripherals based on search term
  const filteredPeripherals = peripherals.filter(
    (peripheral) =>
      peripheral.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (peripheral.category && peripheral.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (peripheral.short_overview && peripheral.short_overview.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (peripheral.credits && peripheral.credits.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (peripheral.event_overview && peripheral.event_overview.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (peripheral.highlight_quote && peripheral.highlight_quote.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPeripheral(formData)
    setFormData({
      title: "",
      category: "",
      is_active: true,
      credits: "",
      event_overview: "",
      event_date: "",
      highlight_quote: "",
      paragraph_1: "",
      paragraph_2: "",
      paragraph_bottom: "",
      background_color: "white",
      main_img: "",
      banner_img: "",
      left_img: "",
      right_img: "",
      short_overview: "",
      category_type: "",
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentPeripheral) {
      updatePeripheral(currentPeripheral.id, { ...formData, category_type: formData.category_type || "" })
      setIsEditDialogOpen(false)
    }
  }

  const handleEdit = (peripheral: Peripheral) => {
    setCurrentPeripheral(peripheral)
    setFormData({
      title: peripheral.title,
      category: peripheral.category || "",
      is_active: peripheral.is_active,
      credits: peripheral.credits || "",
      event_overview: peripheral.event_overview || "",
      event_date: peripheral.event_date || "",
      highlight_quote: peripheral.highlight_quote || "",
      paragraph_1: peripheral.paragraph_1 || "",
      paragraph_2: peripheral.paragraph_2 || "",
      paragraph_bottom: peripheral.paragraph_bottom || "",
      background_color: peripheral.background_color || "white",
      main_img: peripheral.main_img || "",
      banner_img: peripheral.banner_img || "",
      left_img: peripheral.left_img || "",
      right_img: peripheral.right_img || "",
      short_overview: peripheral.short_overview || "",
      category_type: peripheral.category_type || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleToggleStatus = (id: string, isActive: boolean) => {
    togglePeripheralStatus(id, isActive)
  }

  const handleDownloadCSV = () => {
    // Define columns for CSV
    const columns = {
      title: "Title",
      category: "Category",
      short_overview: "Short Overview",
      event_date: "Event Date",
      credits: "Credits",
      background_color: "Background Color",
      main_img: "Main Image",
      banner_img: "Banner Image",
      left_img: "Left Image",
      right_img: "Right Image",
      is_active: "Status",
      created_at: "Created At",
    }

    // Prepare data for CSV
    const csvData = filteredPeripherals.map((peripheral) => ({
      ...peripheral,
      is_active: peripheral.is_active ? "Active" : "Inactive",
      created_at: peripheral.created_at ? format(new Date(peripheral.created_at), "yyyy-MM-dd") : "N/A",
      event_date: peripheral.event_date ? format(new Date(peripheral.event_date), "yyyy-MM-dd") : "N/A",
    }))

    // Convert to CSV and download
    const csv = convertToCSV(csvData, columns)
    downloadCSV(csv, `peripherals-${format(new Date(), "yyyy-MM-dd")}.csv`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Peripherals Management</h2>
        <div className="mt-2 flex items-center gap-2 sm:mt-0">
          <Button variant="outline" size="sm" onClick={() => fetchPeripherals()} disabled={isLoading.peripherals}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading.peripherals ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Peripheral
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Peripheral</DialogTitle>
                  <DialogDescription>Create a new peripheral for your website.</DialogDescription>
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
                      placeholder="Article category"
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
                        <SelectItem value="discovery">Discovery</SelectItem>
                        <SelectItem value="clarity">Clarity</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="short_overview">Short Overview</Label>
                    <Input
                      id="short_overview"
                      placeholder="Brief summary or description"
                      value={formData.short_overview}
                      onChange={(e) => setFormData({ ...formData, short_overview: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="credits">Credits</Label>
                    <RichTextEditor
                      value={formData.credits || ""}
                      onChange={(value) => setFormData({ ...formData, credits: value })}
                      placeholder="Writer and photographer credits"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_overview">Event Overview</Label>
                    <RichTextEditor
                      value={formData.event_overview || ""}
                      onChange={(value) => setFormData({ ...formData, event_overview: value })}
                      placeholder="Introductory paragraph summarizing the event"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_date">Event Date</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date || ""}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="highlight_quote">Highlight Quote</Label>
                    <RichTextEditor
                      value={formData.highlight_quote || ""}
                      onChange={(value) => setFormData({ ...formData, highlight_quote: value })}
                      placeholder="Featured quote or statement to emphasize"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paragraph_1">Paragraph 1</Label>
                    <RichTextEditor
                      value={formData.paragraph_1 || ""}
                      onChange={(value) => setFormData({ ...formData, paragraph_1: value })}
                      placeholder="First supporting paragraph"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paragraph_2">Paragraph 2</Label>
                    <RichTextEditor
                      value={formData.paragraph_2 || ""}
                      onChange={(value) => setFormData({ ...formData, paragraph_2: value })}
                      placeholder="Second supporting paragraph"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paragraph_bottom">Closing Paragraph</Label>
                    <RichTextEditor
                      value={formData.paragraph_bottom || ""}
                      onChange={(value) => setFormData({ ...formData, paragraph_bottom: value })}
                      placeholder="Optional closing paragraph"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="background_color">Background Color</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="background_color_white"
                          name="background_color"
                          value="white"
                          checked={formData.background_color === "white"}
                          onChange={() => setFormData({ ...formData, background_color: "white" })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="background_color_white" className="cursor-pointer">
                          White
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="background_color_black"
                          name="background_color"
                          value="black"
                          checked={formData.background_color === "black"}
                          onChange={() => setFormData({ ...formData, background_color: "black" })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="background_color_black" className="cursor-pointer">
                          Black
                        </Label>
                      </div>
                    </div>
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
                      label="Left Image"
                      value={formData.left_img}
                      onChange={(value) => setFormData({ ...formData, left_img: value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <ImageUpload
                      label="Right Image"
                      value={formData.right_img}
                      onChange={(value) => setFormData({ ...formData, right_img: value })}
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
                  <Button type="submit">Create Peripheral</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error.peripherals && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.peripherals}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Peripherals</CardTitle>
          <CardDescription>
            Manage peripherals for your website.{" "}
            <a
              href="https://docs.google.com/document/d/175WKYuO9Bv90oMgSDGX7JxM1nCPleUoyBpfq0yRNzF8/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              View Peripheral Creation Guidelines
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search peripherals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownloadCSV}
              disabled={isLoading.peripherals || filteredPeripherals.length === 0}
              title="Download as CSV"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download as CSV</span>
            </Button>
          </div>

          {isLoading.peripherals ? (
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
                    <TableHead>Credits</TableHead>
                    <TableHead>Background</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPeripherals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        {error.peripherals ? "Error loading data" : "No peripherals found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPeripherals.map((peripheral) => (
                      <TableRow key={peripheral.id}>
                        <TableCell className="font-medium">{peripheral.title}</TableCell>
                        <TableCell>{peripheral.category || "—"}</TableCell>
                        <TableCell>
                          {peripheral.event_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{format(new Date(peripheral.event_date), "MMM dd, yyyy")}</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{peripheral.credits || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-4 w-4 rounded-full border ${
                                peripheral.background_color === "black"
                                  ? "bg-black border-gray-400"
                                  : "bg-white border-gray-300"
                              }`}
                            />
                            <span className="capitalize">{peripheral.background_color || "white"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={peripheral.is_active ? "default" : "secondary"}>
                            {peripheral.is_active ? "Active" : "Inactive"}
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
                              <DropdownMenuItem onClick={() => handleEdit(peripheral)}>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(peripheral.id, !peripheral.is_active)}
                              >
                                {peripheral.is_active ? "Deactivate" : "Activate"}
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
              <DialogTitle>Edit Peripheral</DialogTitle>
              <DialogDescription>Update peripheral information.</DialogDescription>
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
                  placeholder="Article category"
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
                    <SelectItem value="discovery">Discovery</SelectItem>
                    <SelectItem value="clarity">Clarity</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-short_overview">Short Overview</Label>
                <Input
                  id="edit-short_overview"
                  placeholder="Brief summary or description"
                  value={formData.short_overview}
                  onChange={(e) => setFormData({ ...formData, short_overview: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-credits">Credits</Label>
                <RichTextEditor
                  value={formData.credits || ""}
                  onChange={(value) => setFormData({ ...formData, credits: value })}
                  placeholder="Writer and photographer credits"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-event_overview">Event Overview</Label>
                <RichTextEditor
                  value={formData.event_overview || ""}
                  onChange={(value) => setFormData({ ...formData, event_overview: value })}
                  placeholder="Introductory paragraph summarizing the event"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-event_date">Event Date</Label>
                <Input
                  id="edit-event_date"
                  type="date"
                  value={formData.event_date || ""}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-highlight_quote">Highlight Quote</Label>
                <RichTextEditor
                  value={formData.highlight_quote || ""}
                  onChange={(value) => setFormData({ ...formData, highlight_quote: value })}
                  placeholder="Featured quote or statement to emphasize"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paragraph_1">Paragraph 1</Label>
                <RichTextEditor
                  value={formData.paragraph_1 || ""}
                  onChange={(value) => setFormData({ ...formData, paragraph_1: value })}
                  placeholder="First supporting paragraph"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paragraph_2">Paragraph 2</Label>
                <RichTextEditor
                  value={formData.paragraph_2 || ""}
                  onChange={(value) => setFormData({ ...formData, paragraph_2: value })}
                  placeholder="Second supporting paragraph"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paragraph_bottom">Closing Paragraph</Label>
                <RichTextEditor
                  value={formData.paragraph_bottom || ""}
                  onChange={(value) => setFormData({ ...formData, paragraph_bottom: value })}
                  placeholder="Optional closing paragraph"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-background_color">Background Color</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="edit-background_color_white"
                      name="edit-background_color"
                      value="white"
                      checked={formData.background_color === "white"}
                      onChange={() => setFormData({ ...formData, background_color: "white" })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="edit-background_color_white" className="cursor-pointer">
                      White
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="edit-background_color_black"
                      name="edit-background_color"
                      value="black"
                      checked={formData.background_color === "black"}
                      onChange={() => setFormData({ ...formData, background_color: "black" })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="edit-background_color_black" className="cursor-pointer">
                      Black
                    </Label>
                  </div>
                </div>
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
                  label="Left Image"
                  value={formData.left_img}
                  onChange={(value) => setFormData({ ...formData, left_img: value })}
                />
              </div>
              <div className="grid gap-2">
                <ImageUpload
                  label="Right Image"
                  value={formData.right_img}
                  onChange={(value) => setFormData({ ...formData, right_img: value })}
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
              <Button type="submit">Update Peripheral</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
