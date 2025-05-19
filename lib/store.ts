import { create } from "zustand"
import { toast } from "sonner"
import { supabase } from "./supabase"

// Define types for our data
export type Newsletter = {
  id: string
  email: string
  signup_date: string
  created_at?: string
}

export type Peripheral = {
  id: string
  title: string
  category?: string
  is_active: boolean
  created_at: string
  updated_at?: string
  credits?: string
  event_overview?: string
  event_date?: string
  highlight_quote?: string
  paragraph_1?: string
  paragraph_2?: string
  paragraph_bottom?: string
  background_color?: string
}

export type Community = {
  id: string
  signup_link: string
  image_url: string
  is_active: boolean
  created_at: string
  updated_at?: string
  title?: string
  category?: string
  event_date?: string
  event_location?: string
  event_overview?: string
  event_tnc?: string
  time_place?: string
}

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// Define store types
type State = {
  newsletters: Newsletter[]
  peripherals: Peripheral[]
  communities: Community[]
  selectedCommunity: string | null
  dateRange: DateRange
  isLoading: {
    newsletters: boolean
    peripherals: boolean
    communities: boolean
  }
  error: {
    newsletters: string | null
    peripherals: string | null
    communities: string | null
  }
}

type Actions = {
  // Newsletter actions
  fetchNewsletters: () => Promise<void>

  // Peripheral actions
  fetchPeripherals: () => Promise<void>
  createPeripheral: (peripheral: Omit<Peripheral, "id" | "created_at" | "updated_at">) => Promise<void>
  updatePeripheral: (id: string, peripheral: Partial<Peripheral>) => Promise<void>
  togglePeripheralStatus: (id: string, isActive: boolean) => Promise<void>

  // Community actions
  fetchCommunities: () => Promise<void>
  createCommunity: (community: Omit<Community, "id" | "created_at" | "updated_at">) => Promise<void>
  updateCommunity: (id: string, community: Partial<Community>) => Promise<void>
  toggleCommunityStatus: (id: string, isActive: boolean) => Promise<void>

  // Date range actions
  setDateRange: (range: DateRange) => void
}

// Create store
export const useStore = create<State & Actions>((set, get) => ({
  newsletters: [],
  peripherals: [],
  communities: [],
  selectedCommunity: null,
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  },
  isLoading: {
    newsletters: false,
    peripherals: false,
    communities: false,
  },
  error: {
    newsletters: null,
    peripherals: null,
    communities: null,
  },

  // Newsletter actions
  fetchNewsletters: async () => {
    set((state) => ({
      isLoading: { ...state.isLoading, newsletters: true },
      error: { ...state.error, newsletters: null },
    }))

    try {
      console.log("Fetching newsletter subscribers...")
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("signup_date", { ascending: false })

      if (error) {
        console.error("Error fetching newsletter subscribers:", error)
        set({
          error: { ...get().error, newsletters: error.message },
          isLoading: { ...get().isLoading, newsletters: false },
        })
        toast.error(`Failed to fetch newsletters: ${error.message}`)
        return
      }

      console.log("Newsletter subscribers fetched:", data?.length || 0)
      set({
        newsletters: data || [],
        isLoading: { ...get().isLoading, newsletters: false },
      })
    } catch (error) {
      console.error("Error fetching newsletters:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: { ...get().error, newsletters: errorMessage },
        isLoading: { ...get().isLoading, newsletters: false },
      })
      toast.error(`Failed to fetch newsletters: ${errorMessage}`)
    }
  },

  // Peripheral actions
  fetchPeripherals: async () => {
    set((state) => ({
      isLoading: { ...state.isLoading, peripherals: true },
      error: { ...state.error, peripherals: null },
    }))

    try {
      console.log("Fetching peripherals...")
      const { data, error } = await supabase.from("peripherals").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching peripherals:", error)
        set({
          error: { ...get().error, peripherals: error.message },
          isLoading: { ...get().isLoading, peripherals: false },
        })
        toast.error(`Failed to fetch peripherals: ${error.message}`)
        return
      }

      console.log("Peripherals fetched:", data?.length || 0)
      set({
        peripherals: data || [],
        isLoading: { ...get().isLoading, peripherals: false },
      })
    } catch (error) {
      console.error("Error fetching peripherals:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: { ...get().error, peripherals: errorMessage },
        isLoading: { ...get().isLoading, peripherals: false },
      })
      toast.error(`Failed to fetch peripherals: ${errorMessage}`)
    }
  },

  createPeripheral: async (peripheral) => {
    try {
      const { data, error } = await supabase.from("peripherals").insert([peripheral]).select()

      if (error) {
        toast.error(`Failed to create peripheral: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        set((state) => ({
          peripherals: [data[0] as Peripheral, ...state.peripherals],
        }))
        toast.success("Peripheral created successfully")
      }
    } catch (error) {
      console.error("Error creating peripheral:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Failed to create peripheral: ${errorMessage}`)
    }
  },

  updatePeripheral: async (id, peripheral) => {
    try {
      const { data, error } = await supabase.from("peripherals").update(peripheral).eq("id", id).select()

      if (error) {
        toast.error(`Failed to update peripheral: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        set((state) => ({
          peripherals: state.peripherals.map((p) => (p.id === id ? ({ ...p, ...data[0] } as Peripheral) : p)),
        }))
        toast.success("Peripheral updated successfully")
      }
    } catch (error) {
      console.error("Error updating peripheral:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Failed to update peripheral: ${errorMessage}`)
    }
  },

  togglePeripheralStatus: async (id, isActive) => {
    try {
      const { error } = await supabase.from("peripherals").update({ is_active: isActive }).eq("id", id)

      if (error) {
        toast.error(`Failed to update peripheral status: ${error.message}`)
        return
      }

      set((state) => ({
        peripherals: state.peripherals.map((p) => (p.id === id ? { ...p, is_active: isActive } : p)),
      }))
      toast.success(`Peripheral ${isActive ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      console.error("Error toggling peripheral status:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Failed to update peripheral status: ${errorMessage}`)
    }
  },

  // Community actions
  fetchCommunities: async () => {
    set((state) => ({
      isLoading: { ...state.isLoading, communities: true },
      error: { ...state.error, communities: null },
    }))

    try {
      console.log("Fetching communities...")
      const { data, error } = await supabase.from("communities").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching communities:", error)
        set({
          error: { ...get().error, communities: error.message },
          isLoading: { ...get().isLoading, communities: false },
        })
        toast.error(`Failed to fetch communities: ${error.message}`)
        return
      }

      console.log("Communities fetched:", data?.length || 0)
      set({
        communities: data || [],
        isLoading: { ...get().isLoading, communities: false },
      })
    } catch (error) {
      console.error("Error fetching communities:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: { ...get().error, communities: errorMessage },
        isLoading: { ...get().isLoading, communities: false },
      })
      toast.error(`Failed to fetch communities: ${errorMessage}`)
    }
  },

  createCommunity: async (community) => {
    try {
      console.log("Creating community with data:", community)

      // Ensure event_date is properly formatted for PostgreSQL
      const formattedCommunity = { ...community }
      if (formattedCommunity.event_date && formattedCommunity.event_date.trim() === "") {
        formattedCommunity.event_date = null
      }

      const { data, error } = await supabase.from("communities").insert([formattedCommunity]).select()

      if (error) {
        console.error("Error creating community:", error)
        toast.error(`Failed to create community: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        console.log("Community created successfully:", data[0])
        set((state) => ({
          communities: [data[0] as Community, ...state.communities],
        }))
        toast.success("Community created successfully")
      }
    } catch (error) {
      console.error("Error creating community:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Failed to create community: ${errorMessage}`)
    }
  },

  updateCommunity: async (id, community) => {
    try {
      console.log("Updating community with ID:", id, "Data:", community)

      // Ensure event_date is properly formatted for PostgreSQL
      const formattedCommunity = { ...community }
      if (formattedCommunity.event_date && formattedCommunity.event_date.trim() === "") {
        formattedCommunity.event_date = null
      }

      const { data, error } = await supabase.from("communities").update(formattedCommunity).eq("id", id).select()

      if (error) {
        console.error("Error updating community:", error)
        toast.error(`Failed to update community: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
        console.log("Community updated successfully:", data[0])
        set((state) => ({
          communities: state.communities.map((c) => (c.id === id ? ({ ...c, ...data[0] } as Community) : c)),
        }))
        toast.success("Community updated successfully")
      }
    } catch (error) {
      console.error("Error updating community:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Failed to update community: ${errorMessage}`)
    }
  },

  toggleCommunityStatus: async (id, isActive) => {
    try {
      const { error } = await supabase.from("communities").update({ is_active: isActive }).eq("id", id)

      if (error) {
        toast.error(`Failed to update community status: ${error.message}`)
        return
      }

      set((state) => ({
        communities: state.communities.map((c) => (c.id === id ? { ...c, is_active: isActive } : c)),
      }))
      toast.success(`Community ${isActive ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      console.error("Error toggling community status:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      toast.error(`Failed to update community status: ${errorMessage}`)
    }
  },

  // Date range actions
  setDateRange: (range) => {
    set({ dateRange: range })
  },
}))
