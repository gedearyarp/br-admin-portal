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
import { AlertCircle, MoreHorizontal, Plus, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    description: "",
    image_url: "",
    category: "",
    is_active: true,
  })

  useEffect(() => {
    console.log("Peripherals page: Fetching data...")
    fetchPeripherals()
  }, [fetchPeripherals])

  // Filter peripherals based on search term
  const filteredPeripherals = peripherals.filter(
    (peripheral) =>
      peripheral.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peripheral.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peripheral.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createPeripheral(formData)
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category: "",
      is_active: true,
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
      description: peripheral.description,
      image_url: peripheral.image_url,
      category: peripheral.category,
      is_active: peripheral.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const handleToggleStatus = (id: string, isActive: boolean) => {
    togglePeripheralStatus(id, isActive)
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
                <div className="grid gap-4 py-4">
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
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPeripherals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        {error.peripherals ? "Error loading data" : "No peripherals found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPeripherals.map((peripheral) => (
                      <TableRow key={peripheral.id}>
                        <TableCell className="font-medium">{peripheral.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{peripheral.description}</TableCell>
                        <TableCell>{peripheral.category}</TableCell>
                        <TableCell>
                          <Badge variant={peripheral.is_active ? "default" : "secondary"}>
                            {peripheral.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {peripheral.created_at ? format(new Date(peripheral.created_at), "MMM dd, yyyy") : "N/A"}
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
            <div className="grid gap-4 py-4">
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
                <Label htmlFor="edit-image_url">Image URL</Label>
                <Input
                  id="edit-image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              <Button type="submit">Update Peripheral</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
