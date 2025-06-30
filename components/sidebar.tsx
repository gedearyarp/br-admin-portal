"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Mail, Cpu, Users, Menu, X, ChevronLeft, ChevronRight, Image } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-black",
  },
  {
    label: "Newsletter",
    icon: Mail,
    href: "/newsletter",
    color: "text-black",
  },
  {
    label: "Peripherals",
    icon: Cpu,
    href: "/peripherals",
    color: "text-black",
  },
  {
    label: "Communities",
    icon: Users,
    href: "/communities",
    color: "text-black",
  },
  {
    label: "Carousel",
    icon: Image,
    href: "/carousel",
    color: "text-black",
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  // Save collapsed state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState) {
      setIsCollapsed(savedState === "true")
    }
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent("sidebarStateChange", { detail: String(newState) }))
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        data-sidebar="true"
        data-collapsed={isCollapsed}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-950 border-r shadow-sm transition-all duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-72",
        )}
      >
        <div className="flex h-16 items-center border-b px-6 justify-between">
          <Link href="/" className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
            <div className="relative h-8 w-10 rounded-full bg-black text-white flex items-center justify-center">
              <span className="font-bold">BR</span>
            </div>
            {!isCollapsed && <h1 className="text-xl font-bold">Admin Portal</h1>}
          </Link>

          {/* Collapse toggle button - desktop only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden md:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-black dark:hover:text-white",
                  pathname === route.href
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-muted-foreground",
                  isCollapsed && "justify-center px-0",
                )}
                title={isCollapsed ? route.label : undefined}
              >
                <route.icon className="h-4 w-4" />
                {!isCollapsed && route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className={cn("flex items-center gap-3 rounded-lg bg-muted p-3", isCollapsed && "justify-center p-2")}>
            <div className="rounded-full bg-black text-white p-1">
              <span className="sr-only">BR Admin</span>
              <Users className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="text-sm">
                <p className="font-medium">BR Admin</p>
              </div>
            )}
          </div>
          {/* Logout Button */}
          <Button
            variant="outline"
            className={cn("mt-4 w-full", isCollapsed && "w-10 h-10 p-0 flex justify-center items-center")}
            onClick={() => {
              localStorage.removeItem("br_admin_logged_in")
              router.replace("/login")
            }}
          >
            {!isCollapsed ? "Logout" : <span className="sr-only">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  )
}
