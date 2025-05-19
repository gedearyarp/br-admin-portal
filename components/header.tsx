"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <form className="hidden md:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-64 rounded-lg bg-background pl-8 md:w-80" />
          </div>
        </form>
      </div>
      <div className="flex items-center gap-2">{/* Notification button removed */}</div>
    </header>
  )
}
