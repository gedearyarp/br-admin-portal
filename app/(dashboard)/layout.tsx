"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()

  // Check localStorage for sidebar state
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState) {
      setIsCollapsed(savedState === "true")
    }

    // Listen for changes to localStorage
    const handleStorageChange = () => {
      const currentState = localStorage.getItem("sidebarCollapsed")
      setIsCollapsed(currentState === "true")
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for same-tab updates
    const handleCustomEvent = (e: CustomEvent) => {
      setIsCollapsed(e.detail === "true")
    }

    window.addEventListener("sidebarStateChange" as any, handleCustomEvent)

    // Create a MutationObserver to watch for changes to the sidebar's data-collapsed attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-collapsed") {
          const sidebarElement = document.querySelector('[data-sidebar="true"]')
          if (sidebarElement) {
            const isCollapsed = sidebarElement.getAttribute("data-collapsed") === "true"
            setIsCollapsed(isCollapsed)
          }
        }
      })
    })

    // Start observing the sidebar element
    const sidebarElement = document.querySelector('[data-sidebar="true"]')
    if (sidebarElement) {
      observer.observe(sidebarElement, { attributes: true })
    }

    // Auth check
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("br_admin_logged_in") === "true"
      if (!isLoggedIn) {
        router.replace("/login")
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("sidebarStateChange" as any, handleCustomEvent)
      observer.disconnect()
    }
  }, [router])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-72"}`}>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
