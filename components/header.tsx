"use client"

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">{/* Search feature removed */}</div>
      <div className="flex items-center gap-2">{/* Notification button removed */}</div>
    </header>
  )
}
