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
import { AlertCircle, Calendar, Download, MoreHorizontal, Plus, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { convertToCSV, downloadCSV } from "@/lib/csv-utils"

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
    event_date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
    highlight_quote: "",
    paragraph_1: "",
    paragraph_2: "",
    paragraph_bottom: "",
    background_color: "white",
  })

  useEffect(() => {
    console.log("Peripherals page: Fetching data...")
    fetchPeripherals()
  }, [fetchPeripherals])

  // Filter peripherals based on search term
  const filteredPeripherals = peripherals.filter(
    (peripheral) =>
      peripheral.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (peripheral.category && peripheral.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
      event_date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      highlight_quote: "",
      paragraph_1: "",
      paragraph_2: "",
      paragraph_bottom: "",
      background_color: "white",
    })
    setIsCreateDialogOpen(false)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentPeripheral) {
      updatePeripheral(currentPeripheral.id, formData)
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
      event_date: "Event Date",
      credits: "Credits",
      background_color: "Background Color",
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
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      placeholder="Writer and photographer credits"
                      value={formData.credits || ""}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="event_overview">Event Overview</Label>
                    <Textarea
                      id="event_overview"
                      placeholder="Introductory paragraph summarizing the event"
                      value={formData.event_overview || ""}
                      onChange={(e) => setFormData({ ...formData, event_overview: e.target.value })}
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
                    <Textarea
                      id="highlight_quote"
                      placeholder="Featured quote or statement to emphasize"
                      value={formData.highlight_quote || ""}
                      onChange={(e) => setFormData({ ...formData, highlight_quote: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paragraph_1">Paragraph 1</Label>
                    <Textarea
                      id="paragraph_1"
                      placeholder="First supporting paragraph"
                      value={formData.paragraph_1 || ""}
                      onChange={(e) => setFormData({ ...formData, paragraph_1: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paragraph_2">Paragraph 2</Label>
                    <Textarea
                      id="paragraph_2"
                      placeholder="Second supporting paragraph"
                      value={formData.paragraph_2 || ""}
                      onChange={(e) => setFormData({ ...formData, paragraph_2: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="paragraph_bottom">Closing Paragraph</Label>
                    <Textarea
                      id="paragraph_bottom"
                      placeholder="Optional closing paragraph"
                      value={formData.paragraph_bottom || ""}
                      onChange={(e) => setFormData({ ...formData, paragraph_bottom: e.target.value })}
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
          <CardDescription>Manage peripherals for your website.</CardDescription>
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
                <Label htmlFor="edit-credits">Credits</Label>
                <Input
                  id="edit-credits"
                  placeholder="Writer and photographer credits"
                  value={formData.credits || ""}
                  onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-event_overview">Event Overview</Label>
                <Textarea
                  id="edit-event_overview"
                  placeholder="Introductory paragraph summarizing the event"
                  value={formData.event_overview || ""}
                  onChange={(e) => setFormData({ ...formData, event_overview: e.target.value })}
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
                <Textarea
                  id="edit-highlight_quote"
                  placeholder="Featured quote or statement to emphasize"
                  value={formData.highlight_quote || ""}
                  onChange={(e) => setFormData({ ...formData, highlight_quote: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paragraph_1">Paragraph 1</Label>
                <Textarea
                  id="edit-paragraph_1"
                  placeholder="First supporting paragraph"
                  value={formData.paragraph_1 || ""}
                  onChange={(e) => setFormData({ ...formData, paragraph_1: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paragraph_2">Paragraph 2</Label>
                <Textarea
                  id="edit-paragraph_2"
                  placeholder="Second supporting paragraph"
                  value={formData.paragraph_2 || ""}
                  onChange={(e) => setFormData({ ...formData, paragraph_2: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paragraph_bottom">Closing Paragraph</Label>
                <Textarea
                  id="edit-paragraph_bottom"
                  placeholder="Optional closing paragraph"
                  value={formData.paragraph_bottom || ""}
                  onChange={(e) => setFormData({ ...formData, paragraph_bottom: e.target.value })}
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
