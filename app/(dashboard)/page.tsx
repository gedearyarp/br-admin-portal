"use client"

import { useEffect, useState } from "react"
import { useStore, type DateRange } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MailIcon, CpuIcon, UsersIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DashboardPage() {
  const {
    newsletters,
    peripherals,
    communities,
    fetchNewsletters,
    fetchPeripherals,
    fetchCommunities,
    dateRange,
    setDateRange,
    isLoading,
    error,
  } = useStore()

  const [date, setDate] = useState<DateRange>({
    from: dateRange.from,
    to: dateRange.to,
  })

  useEffect(() => {
    console.log("Dashboard: Fetching data...")
    fetchNewsletters()
    fetchPeripherals()
    fetchCommunities()
  }, [fetchNewsletters, fetchPeripherals, fetchCommunities])

  const applyDateFilter = () => {
    setDateRange(date)
  }

  // Filter data based on date range
  const filterByDate = <T extends { created_at?: string; signup_date?: string }>(items: T[]) => {
    if (!dateRange.from) return items

    return items.filter((item) => {
      const dateField = item.signup_date || item.created_at
      if (!dateField) return true

      const itemDate = new Date(dateField)
      const fromDate = dateRange.from as Date
      const toDate = dateRange.to as Date

      if (dateRange.to) {
        return itemDate >= fromDate && itemDate <= toDate
      }

      return itemDate >= fromDate
    })
  }

  const filteredNewsletters = filterByDate(newsletters)
  const filteredPeripherals = filterByDate(peripherals)
  const filteredCommunities = filterByDate(communities)

  // Check if there are any errors
  const hasErrors = error.newsletters || error.peripherals || error.communities

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <div className="mt-2 flex items-center gap-2 sm:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
              />
              <div className="flex items-center justify-end gap-2 p-3 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDate({
                      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      to: new Date(),
                    })
                  }}
                >
                  Last 7 days
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDate({
                      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      to: new Date(),
                    })
                  }}
                >
                  Last 30 days
                </Button>
                <Button onClick={applyDateFilter}>Apply</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            There was an error loading some data. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Signups</CardTitle>
            <MailIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading.newsletters ? (
              <Skeleton className="h-8 w-20" />
            ) : error.newsletters ? (
              <div className="text-sm text-destructive">Error loading data</div>
            ) : (
              <div className="text-2xl font-bold">{filteredNewsletters.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Peripherals</CardTitle>
            <CpuIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading.peripherals ? (
              <Skeleton className="h-8 w-20" />
            ) : error.peripherals ? (
              <div className="text-sm text-destructive">Error loading data</div>
            ) : (
              <div className="text-2xl font-bold">{filteredPeripherals.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading.communities ? (
              <Skeleton className="h-8 w-20" />
            ) : error.communities ? (
              <div className="text-sm text-destructive">Error loading data</div>
            ) : (
              <div className="text-2xl font-bold">{filteredCommunities.length}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
