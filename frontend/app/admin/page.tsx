"use client"

import * as React from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth"
import {
  AdminPage,
  AdminSummaryData,
  AdminUserItem,
  AdminUserDetail
} from "@/components/pages/admin-page"

export default function AdminControllerPage() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [authError, setAuthError] = React.useState<string | null>(null)
  const [isSubmittingLogin, setIsSubmittingLogin] = React.useState(false)

  const [isLoadingSummary, setIsLoadingSummary] = React.useState(false)
  const [summaryData, setSummaryData] = React.useState<AdminSummaryData | null>(null)

  const [usersList, setUsersList] = React.useState<AdminUserItem[]>([])
  const [isUsersLoading, setIsUsersLoading] = React.useState(false)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDisco, setSelectedDisco] = React.useState("")
  const [selectedBand, setSelectedBand] = React.useState("")

  const [selectedUserDetail, setSelectedUserDetail] = React.useState<AdminUserDetail | null>(null)
  const [isUserDetailLoading, setIsUserDetailLoading] = React.useState(false)

  const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL || "https://us-central1-volt-94f9f.cloudfunctions.net"

  const fetchSummary = React.useCallback(async (user: User) => {
    try {
      setIsLoadingSummary(true)
      const token = await user.getIdToken()
      const res = await fetch(`${backendUrl}/getAdminAnalyticsSummary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.status === 403) {
        setIsAuthenticated(false)
        setAuthError("Access denied: You must be an authorized Volt administrator to view this portal.")
        return
      }

      if (!res.ok) {
        throw new Error("Failed to load admin analytics")
      }

      const data = await res.json()
      if (data.success && data.summary) {
        setSummaryData(data.summary)
        setIsAuthenticated(true)
        setAuthError(null)
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to load admin data")
    } finally {
      setIsLoadingSummary(false)
      setIsCheckingAuth(false)
    }
  }, [backendUrl])

  const fetchUsers = React.useCallback(async (query = "", disco = "", band = "") => {
    try {
      if (!auth.currentUser) return
      setIsUsersLoading(true)
      const token = await auth.currentUser.getIdToken()
      const params = new URLSearchParams()
      if (query) params.append("search", query)
      if (disco) params.append("disco", disco)
      if (band) params.append("band", band)
      params.append("limit", "50")

      const res = await fetch(`${backendUrl}/getAdminUsersList?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.users)) {
          setUsersList(data.users)
        }
      }
    } catch {
    } finally {
      setIsUsersLoading(false)
    }
  }, [backendUrl])

  const fetchUserDetail = React.useCallback(async (uid: string) => {
    try {
      if (!auth.currentUser) return
      setIsUserDetailLoading(true)
      const token = await auth.currentUser.getIdToken()
      const res = await fetch(`${backendUrl}/getAdminUserDetail?uid=${encodeURIComponent(uid)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.user) {
          setSelectedUserDetail(data.user)
        }
      }
    } catch {
    } finally {
      setIsUserDetailLoading(false)
    }
  }, [backendUrl])

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchSummary(user)
        await fetchUsers()
      } else {
        setIsAuthenticated(false)
        setIsCheckingAuth(false)
      }
    })
    return () => unsubscribe()
  }, [fetchSummary, fetchUsers])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    fetchUsers(query, selectedDisco, selectedBand)
  }

  const handleDiscoChange = (disco: string) => {
    setSelectedDisco(disco)
    fetchUsers(searchQuery, disco, selectedBand)
  }

  const handleBandChange = (band: string) => {
    setSelectedBand(band)
    fetchUsers(searchQuery, selectedDisco, band)
  }

  const handleInspectUser = (uid: string) => {
    setSelectedUserDetail({ uid })
    fetchUserDetail(uid)
  }

  const handleCloseUserModal = () => {
    setSelectedUserDetail(null)
  }

  const handleLogin = async (email: string, pass: string) => {
    try {
      setIsSubmittingLogin(true)
      setAuthError(null)
      const cred = await signInWithEmailAndPassword(auth, email, pass)
      await fetchSummary(cred.user)
      await fetchUsers()
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in. Please verify your credentials.")
    } finally {
      setIsSubmittingLogin(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    setCurrentUser(null)
    setIsAuthenticated(false)
    setSummaryData(null)
    setUsersList([])
  }

  return (
    <AdminPage
      isLoading={isLoadingSummary || isSubmittingLogin}
      isAuthenticated={isAuthenticated}
      isCheckingAuth={isCheckingAuth}
      authError={authError}
      currentAdminEmail={currentUser?.email}
      summaryData={summaryData}
      usersList={usersList}
      isUsersLoading={isUsersLoading}
      selectedUserDetail={selectedUserDetail}
      isUserDetailLoading={isUserDetailLoading}
      searchQuery={searchQuery}
      selectedDisco={selectedDisco}
      selectedBand={selectedBand}
      onSearchChange={handleSearchChange}
      onDiscoChange={handleDiscoChange}
      onBandChange={handleBandChange}
      onInspectUser={handleInspectUser}
      onCloseUserModal={handleCloseUserModal}
      onRefreshSummary={() => currentUser && fetchSummary(currentUser)}
      onRefreshUsers={() => fetchUsers(searchQuery, selectedDisco, selectedBand)}
      onSubmitLogin={handleLogin}
      onLogout={handleLogout}
    />
  )
}
