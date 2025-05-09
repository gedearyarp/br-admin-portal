import { create } from "zustand"
import { toast } from "sonner"
import { supabase } from "./supabase"

// Define types for our data
export type Newsletter = {
  id: string
  email: string
  signup_date: string
  created_at?: string
  tags?: string[]
}

export type Peripheral = {
  id: string
  title: string
  description: string
  image_url: string
  category: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export type Community = {
  id: string
  name: string
  description: string
  signup_link: string
  image_url: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export type CommunitySignup = {
  id: string
  community_id: string
  user_name?: string
  user_email: string
  signup_date: string
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
  communitySignups: CommunitySignup[]
  selectedCommunity: string | null
  dateRange: DateRange
  isLoading: {
    newsletters: boolean
    peripherals: boolean
    communities: boolean
    communitySignups: boolean
  }
  error: {
    newsletters: string | null
    peripherals: string | null
    communities: string | null
    communitySignups: string | null
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

  // Community signup actions
  fetchCommunitySignups: (communityId: string) => Promise<void>
  setSelectedCommunity: (communityId: string | null) => void

  // Date range actions
  setDateRange: (range: DateRange) => void
}

// Create store
export const useStore = create<State & Actions>((set, get) => ({
  newsletters: [],
  peripherals: [],
  communities: [],
  communitySignups: [],
  selectedCommunity: null,
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date(),
  },
  isLoading: {
    newsletters: false,
    peripherals: false,
    communities: false,
    communitySignups: false,
  },
  error: {
    newsletters: null,
    peripherals: null,
    communities: null,
    communitySignups: null,
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
      const { data, error } = await supabase.from("communities").insert([community]).select()

      if (error) {
        toast.error(`Failed to create community: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
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
      const { data, error } = await supabase.from("communities").update(community).eq("id", id).select()

      if (error) {
        toast.error(`Failed to update community: ${error.message}`)
        return
      }

      if (data && data.length > 0) {
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

  // Community signup actions
  fetchCommunitySignups: async (communityId) => {
    set((state) => ({
      isLoading: { ...state.isLoading, communitySignups: true },
      error: { ...state.error, communitySignups: null },
      selectedCommunity: communityId,
    }))

    try {
      console.log(`Fetching community signups for community ID: ${communityId}...`)
      const { data, error } = await supabase
        .from("community_signups")
        .select("*")
        .eq("community_id", communityId)
        .order("signup_date", { ascending: false })

      if (error) {
        console.error("Error fetching community signups:", error)
        set({
          error: { ...get().error, communitySignups: error.message },
          isLoading: { ...get().isLoading, communitySignups: false },
        })
        toast.error(`Failed to fetch community signups: ${error.message}`)
        return
      }

      console.log("Community signups fetched:", data?.length || 0)
      set({
        communitySignups: data || [],
        isLoading: { ...get().isLoading, communitySignups: false },
      })
    } catch (error) {
      console.error("Error fetching community signups:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      set({
        error: { ...get().error, communitySignups: errorMessage },
        isLoading: { ...get().isLoading, communitySignups: false },
      })
      toast.error(`Failed to fetch community signups: ${errorMessage}`)
    }
  },

  setSelectedCommunity: (communityId) => {
    set({ selectedCommunity: communityId })
  },

  // Date range actions
  setDateRange: (range) => {
    set({ dateRange: range })
  },
}))
