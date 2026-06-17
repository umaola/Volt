"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SplashPage } from "@/components/pages/splash-page"
import { LoginPage } from "@/components/pages/login-page"
import { SignupPage } from "@/components/pages/signup-page"
import { OtpPage } from "@/components/pages/otp-page"
import { OnboardingPage } from "@/components/pages/onboarding-page"
import { SubscriptionPage } from "@/components/pages/subscription-page"
import { DashboardPage } from "@/components/pages/dashboard-page"
import { CalculatorPage } from "@/components/pages/calculator-page"
import { InsightsPage } from "@/components/pages/insights-page"
import { ProfilePage } from "@/components/pages/profile-page"
import { HistoryPage } from "@/components/pages/history-page"
import { DevicesPage } from "@/components/pages/devices-page"
import { SurgeChecklistPage } from "@/components/pages/surge-checklist-page"
import { BottomNavigation, TabType } from "@/components/design-system/bottom-navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageParam = searchParams.get("page") || "splash"
  const slideParam = searchParams.get("slide")
  const initialSlide = slideParam ? parseInt(slideParam, 10) : 0

  const [user, setUser] = React.useState<{
    name: string
    phone: string
    email: string
    meterNumber: string
    disco: string
    tariffBand: string
    meterType: string
    currentUnits: number
    plan: string
    notificationPreferences?: {
      dailyReminders: boolean
      lowUnitAlerts: boolean
    }
    subscription?: {
      planType: string
      status: string
      endDate: string
    }
  } | null>(null)

  const [isLoading, setIsLoading] = React.useState(false)
  const [deviceActiveStates, setDeviceActiveStates] = React.useState<Record<string, boolean>>({})

  const handleToggleDevice = (name: string) => {
    setDeviceActiveStates((prev) => ({
      ...prev,
      [name]: prev[name] === false
    }))
  }
  const [navigationHistory, setNavigationHistory] = React.useState<string[]>([])
  const [signupError, setSignupError] = React.useState<string | null>(null)
  const [loginError, setLoginError] = React.useState<string | null>(null)
  const [authResolved, setAuthResolved] = React.useState(false)
  const [signupTempData, setSignupTempData] = React.useState<{
    name: string
    email: string
    password: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [confirmationResult, setConfirmationResult] = React.useState<any>(null)
  const [powerState, setPowerState] = React.useState<"on" | "off">("on")
  const [supplyHours, setSupplyHours] = React.useState(13)
  const [isDashboardLoading, setIsDashboardLoading] = React.useState(true)
  const [dashboardData, setDashboardData] = React.useState<{
    userName: string
    remainingUnits: number
    daysRemaining: number
    dailyBurnRate: number
    powerSupplyHours: number
    powerState: "on" | "off"
    recentActivity: Array<{ type: "recharge" | "outage" | "supply"; title: string; desc: string; time: string }>
    tariffRate?: number
    appliances?: Array<{ name: string; wattage: number; hours: number }>
    expectedSupplyHours?: number
    tariffBand?: string
  } | null>(null)

  const [isHistoryLoading, setIsHistoryLoading] = React.useState(true)
  const [historyData, setHistoryData] = React.useState<{
    recharges: any[]
    powerLogs: any[]
    usageLogs: any[]
  } | null>(null)

  const [isInsightsLoading, setIsInsightsLoading] = React.useState(true)
  const [insightsData, setInsightsData] = React.useState<{
    dailyUsage: any[]
    weeklyUsage: any[]
    monthlyUsage: any[]
    insights: any[]
    applianceBreakdown: any[]
  } | null>(null)

  const navigateTo = (page: string, isBackNavigation: boolean = false) => {
    setSignupError(null)
    setLoginError(null)
    if (!isBackNavigation) {
      setNavigationHistory((prev) => [...prev, pageParam])
    }
    router.push(`/?page=${page}`)
  }

  const fetchDashboardData = React.useCallback(() => {
    setIsDashboardLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"
    fetch(`${backendUrl}/getDashboardData?uid=${uid}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        return res.json()
      })
      .then((data) => {
        setDashboardData(data)
        if (data.powerState) {
          setPowerState(data.powerState)
        }
        setUser({
          name: data.userName || (auth.currentUser?.displayName || "Amarachi Okafor"),
          phone: data.phone || (auth.currentUser?.phoneNumber || ""),
          email: data.email || (auth.currentUser?.email || ""),
          meterNumber: data.meterNumber || "",
          disco: data.disco || "",
          tariffBand: data.tariffBand || "",
          meterType: data.meterType || "",
          currentUnits: data.remainingUnits ?? 0,
          plan: data.subscription?.planType || "",
          notificationPreferences: data.notificationPreferences,
          subscription: data.subscription
        })
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setIsDashboardLoading(false)
      })
  }, [])

  const fetchHistoryData = React.useCallback(() => {
    setIsHistoryLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"
    fetch(`${backendUrl}/getHistoryData?uid=${uid}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch history data")
        }
        return res.json()
      })
      .then((data) => {
        setHistoryData(data)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setIsHistoryLoading(false)
      })
  }, [])

  const fetchInsightsData = React.useCallback(() => {
    setIsInsightsLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"
    fetch(`${backendUrl}/getInsightsData?uid=${uid}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch insights data")
        }
        return res.json()
      })
      .then((data) => {
        setInsightsData(data)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setIsInsightsLoading(false)
      })
  }, [])

  const trackAnalyticsEvent = React.useCallback((eventType: string, metadata: any = {}) => {
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"
    fetch(`${backendUrl}/trackEvent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, eventType, metadata })
    }).catch((err) => {
      console.error("Tracking event error:", err)
    })
  }, [])

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setDashboardData(null)
        setAuthResolved(true)
      } else {
        const urlParams = new URLSearchParams(window.location.search)
        const currentPage = urlParams.get("page") || "splash"
        if (currentPage === "otp") {
          setAuthResolved(true)
          return
        }
        setAuthResolved(false)
        setUser((prev) => prev || {
          name: firebaseUser.displayName || "",
          phone: firebaseUser.phoneNumber || "",
          email: firebaseUser.email || "",
          meterNumber: "",
          disco: "",
          tariffBand: "",
          meterType: "",
          currentUnits: 0,
          plan: ""
        })
        const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
        fetch(`${backendUrl}/getDashboardData?uid=${firebaseUser.uid}`)
          .then((res) => {
            if (!res.ok) throw new Error()
            return res.json()
          })
          .then((data) => {
            setDashboardData(data)
            if (data.powerState) setPowerState(data.powerState)
            setUser({
              name: data.userName || firebaseUser.displayName || "Amarachi Okafor",
              phone: data.phone || firebaseUser.phoneNumber || "",
              email: data.email || firebaseUser.email || "",
              meterNumber: data.meterNumber || "",
              disco: data.disco || "",
              tariffBand: data.tariffBand || "",
              meterType: data.meterType || "",
              currentUnits: data.remainingUnits ?? 0,
              plan: data.subscription?.planType || "",
              notificationPreferences: data.notificationPreferences,
              subscription: data.subscription
            })
          })
          .catch((err) => {
            console.error(err)
          })
          .finally(() => {
            setAuthResolved(true)
          })
      }
    })
    return () => unsubscribe()
  }, [])

  React.useEffect(() => {
    if (!authResolved) return

    if (!user) {
      if (!["splash", "signup", "login", "otp"].includes(pageParam)) {
        navigateTo("login")
      }
    } else {
      if (!user.meterNumber) {
        if (pageParam !== "onboarding") {
          navigateTo("onboarding")
        }
      } else if (!user.plan) {
        if (pageParam !== "subscription") {
          navigateTo("subscription")
        }
      } else {
        if (["splash", "login", "signup", "otp", "onboarding", "subscription"].includes(pageParam)) {
          navigateTo("dashboard")
        }
      }
    }
  }, [authResolved, user?.meterNumber, user?.plan, pageParam])

  React.useEffect(() => {
    if (pageParam === "dashboard" || pageParam === "splash") {
      setNavigationHistory([])
    }

    if (pageParam === "dashboard") {
      fetchDashboardData()

      const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
      const uid = auth.currentUser?.uid || "mock-uid"
      fetch(`${backendUrl}/registerDeviceToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          deviceToken: "token_mock_" + uid,
          platform: "web"
        })
      }).catch((err) => {
        console.error("Token registration error:", err)
      })
    } else if (pageParam === "history" || pageParam === "calculator") {
      fetchHistoryData()
    } else if (pageParam === "insights") {
      fetchInsightsData()
    }
  }, [pageParam, fetchDashboardData, fetchHistoryData, fetchInsightsData])


  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const newHistory = [...navigationHistory]
      const prevPage = newHistory.pop()
      setNavigationHistory(newHistory)
      if (prevPage) {
        navigateTo(prevPage, true)
      }
    } else {
      if (pageParam === "history") {
        navigateTo("dashboard", true)
      } else {
        navigateTo("splash", true)
      }
    }
  }

  const handleGetStarted = () => {
    navigateTo("signup")
  }

  const handleSignup = (signupData: { name: string; email: string; password: string }) => {
    setSignupError(null)
    setSignupTempData(signupData)
    navigateTo("otp")
  }

  const handleVerifyOtp = (code: string) => {
    if (!signupTempData) return
    setIsLoading(true)
    setSignupError(null)

    if (code !== "123456") {
      setSignupError("Invalid verification code. Please try again.")
      setIsLoading(false)
      return
    }

    const { name, email, password } = signupTempData

    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
        fetch(`${backendUrl}/createUser`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: result.user.uid,
            name,
            email,
            phone: ""
          })
        })
          .then(() => {
            trackAnalyticsEvent("signup", { name, email })
            setUser({
              name,
              email,
              phone: "",
              meterNumber: "",
              disco: "",
              tariffBand: "",
              meterType: "",
              currentUnits: 0,
              plan: ""
            })
            navigateTo("onboarding")
          })
          .catch((err) => {
            console.error("Backend createUser sync failed:", err)
            trackAnalyticsEvent("signup", { name, email, syncError: true })
            navigateTo("onboarding")
          })
          .finally(() => {
            setIsLoading(false)
          })
      })
      .catch((error) => {
        console.error("Signup failed:", error)
        if (error.code === "auth/email-already-in-use") {
          setSignupError("This email address is already registered.")
          navigateTo("signup")
          setIsLoading(false)
        } else {
          if (process.env.NODE_ENV === "development") {
            setUser({
              name,
              email,
              phone: "",
              meterNumber: "",
              disco: "",
              tariffBand: "",
              meterType: "",
              currentUnits: 0,
              plan: ""
            })
            navigateTo("onboarding")
            setIsLoading(false)
          } else {
            setSignupError(error.message || "An unexpected error occurred.")
            navigateTo("signup")
            setIsLoading(false)
          }
        }
      })
  }

  const handleResendOtp = () => {
    console.log("OTP code resent successfully.")
  }

  const handleVerifyMeter = React.useCallback((meterNumber: string, disco: string, meterType: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    return fetch(`${backendUrl}/verifyMeterNumber`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meterNumber, disco, meterType })
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || "Verification failed") })
        }
        return res.json()
      })
      .then((data) => {
        return { success: true, customerName: data.customerName }
      })
      .catch((err) => {
        console.error(err)
        return { success: false, error: err.message || "Verification failed" }
      })
  }, [])

  const handleValidatePassword = React.useCallback((password: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL || "http://127.0.0.1:5001/volt-test-e8e0b/us-central1"
    return fetch(`${backendUrl}/validatePassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to validate password")
        }
        return res.json()
      })
      .then((data) => {
        return data.criteria || {
          hasMinLength: false,
          hasCapital: false,
          hasNumber: false,
          hasSpecial: false
        }
      })
      .catch((err) => {
        console.error(err)
        return {
          hasMinLength: false,
          hasCapital: false,
          hasNumber: false,
          hasSpecial: false
        }
      })
  }, [])

  const handleLogin = (loginData: { email: string; password: string }) => {
    setIsLoading(true)
    setLoginError(null)
    const { email, password } = loginData

    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        trackAnalyticsEvent("login", { email })
      })
      .catch((error) => {
        console.error("Login failed:", error)
        let cleanMessage = "Login failed. Please check your credentials."
        if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
          cleanMessage = "Invalid email address or password."
        } else if (error.code === "auth/invalid-email") {
          cleanMessage = "Please enter a valid email address."
        }
        setLoginError(cleanMessage)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleForgotPassword = (email: string) => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address first.")
      return
    }
    setIsLoading(true)
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("A password reset link has been sent to your email address.")
      })
      .catch((error) => {
        console.error("Password reset failed:", error)
        alert(error.message || "Failed to send password reset email.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleOnboardingComplete = (data: {
    meterNumber: string
    disco: string
    tariffBand: string
    meterType: string
    appliances: any[]
    currentUnits: number
  }) => {
    setIsLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"

    fetch(`${backendUrl}/saveOnboardingProfile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        meterNumber: data.meterNumber,
        disco: data.disco,
        tariffBand: data.tariffBand,
        meterType: data.meterType,
        appliances: data.appliances,
        currentUnits: data.currentUnits
      })
    })
      .then(() => {
        if (user) {
          setUser({
            ...user,
            meterNumber: data.meterNumber,
            disco: data.disco,
            tariffBand: data.tariffBand,
            meterType: data.meterType,
            currentUnits: data.currentUnits
          })
        }
        navigateTo("subscription")
      })
      .catch((err) => {
        console.error(err)
        navigateTo("subscription")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleActivateTrial = (plan: "monthly" | "annual", cardData: any) => {
    setIsLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"
    const cardLast4 = cardData.cardNumber ? cardData.cardNumber.replace(/\s+/g, "").slice(-4) : "4111"

    fetch(`${backendUrl}/verifyAndStartTrial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        plan,
        cardLast4,
        cardBrand: "visa"
      })
    })
      .then(() => {
        if (user) {
          setUser({
            ...user,
            plan: plan === "monthly" ? "Monthly" : "Annual"
          })
        }
        trackAnalyticsEvent("trial_start", { plan })
        navigateTo("dashboard")
      })
      .catch((err) => {
        console.error(err)
        navigateTo("dashboard")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleTogglePower = (state: "on" | "off") => {
    setPowerState(state)
    setIsDashboardLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"
    fetch(`${backendUrl}/logPowerSupply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, state })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to log power supply")
        }
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          fetchDashboardData()
        }
      })
      .catch((err) => {
        console.error(err)
        setIsDashboardLoading(false)
      })
  }

  const handleQuickAction = (action: "calculator" | "outage" | "appliance" | "insights" | "history" | "notification_opened" | "surge-checklist") => {
    if (action === "calculator") {
      trackAnalyticsEvent("calculator_usage")
      navigateTo("calculator")
    } else if (action === "insights") {
      navigateTo("insights")
    } else if (action === "outage") {
      navigateTo("dashboard")
    } else if (action === "appliance") {
      navigateTo("devices")
    } else if (action === "history") {
      navigateTo("history")
    } else if (action === "surge-checklist") {
      navigateTo("surge-checklist")
    } else if (action === "notification_opened") {
      trackAnalyticsEvent("notification_opened", { source: "mock_push_banner" })
    }
  }

  const handleSaveProfile = (updatedProfile: {
    phone: string
    meterNumber: string
    disco: string
    tariffBand: string
    meterType: string
  }) => {
    setIsDashboardLoading(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"

    fetch(`${backendUrl}/updateProfile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        phone: updatedProfile.phone,
        meterNumber: updatedProfile.meterNumber,
        disco: updatedProfile.disco,
        tariffBand: updatedProfile.tariffBand,
        meterType: updatedProfile.meterType
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update profile")
        }
        return res.json()
      })
      .then(() => {
        fetchDashboardData()
      })
      .catch((err) => {
        console.error(err)
        setIsDashboardLoading(false)
      })
  }

  const handleAddAppliance = (appliance: { name: string; wattage: number; hours: number }) => {
    setIsSubmitting(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"

    fetch(`${backendUrl}/addAppliance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        name: appliance.name,
        wattage: appliance.wattage,
        hours: appliance.hours
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to add appliance")
        }
        return res.json()
      })
      .then(() => {
        fetchDashboardData()
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditAppliance = (appliance: { name: string; wattage: number; hours: number }) => {
    setIsSubmitting(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"

    fetch(`${backendUrl}/updateAppliance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        name: appliance.name,
        wattage: appliance.wattage,
        hours: appliance.hours
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update appliance")
        }
        return res.json()
      })
      .then(() => {
        fetchDashboardData()
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleDeleteAppliance = (name: string) => {
    setIsSubmitting(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"

    fetch(`${backendUrl}/deleteAppliance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        name
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete appliance")
        }
        return res.json()
      })
      .then(() => {
        fetchDashboardData()
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleUpdatePreferences = (prefs: { dailyReminders: boolean; lowUnitAlerts: boolean }) => {
    setIsSubmitting(true)
    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"

    fetch(`${backendUrl}/updateNotificationPreferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        dailyReminders: prefs.dailyReminders,
        lowUnitAlerts: prefs.lowUnitAlerts
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to update preferences")
        }
        return res.json()
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleLogout = () => {
    signOut(auth).catch((err) => {
      console.error(err)
    })
  }

  const handleTabChange = (tab: TabType) => {
    navigateTo(tab)
  }

  const isOtpMode = searchParams.get("mode") === "otp"
  const isMainTab = ["dashboard", "calculator", "devices", "insights", "profile"].includes(pageParam)

  const activeUser = user || {
    name: "Amarachi Okafor",
    phone: "08012345678",
    email: "amarachi@example.com",
    meterNumber: "0127217047315",
    disco: "EKEDC",
    tariffBand: "Band A",
    meterType: "Prepaid",
    currentUnits: 18.4,
    plan: "Monthly",
    notificationPreferences: {
      dailyReminders: true,
      lowUnitAlerts: true
    },
    subscription: {
      planType: "Free Trial",
      status: "trialing",
      endDate: "2026-06-24T12:00:00.000Z"
    }
  }

  if (!authResolved) {
    return (
      <div className="flex-grow flex flex-col justify-center items-center h-full bg-zinc-50">
        <span className="text-sm text-zinc-500 font-sans">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col h-full justify-between bg-zinc-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {pageParam === "splash" && (
          <SplashPage
            onGetStarted={handleGetStarted}
            initialSlide={initialSlide}
            autoPlay={slideParam === null}
          />
        )}
        {pageParam === "signup" && (
          <SignupPage
            isLoading={isLoading}
            error={signupError}
            onSignup={handleSignup}
            onNavigateToLogin={() => navigateTo("login")}
            onValidatePassword={handleValidatePassword}
            onBack={() => navigateTo("splash&slide=2", true)}
          />
        )}
        {pageParam === "otp" && (
          <OtpPage
            isLoading={isLoading}
            error={signupError}
            email={signupTempData?.email || ""}
            onVerify={handleVerifyOtp}
            onResend={handleResendOtp}
            onBack={() => navigateTo("signup", true)}
          />
        )}
        {pageParam === "login" && (
          <LoginPage
            isLoading={isLoading}
            error={loginError}
            onLogin={handleLogin}
            onNavigateToSignup={() => navigateTo("signup")}
            onBack={handleBack}
            onForgotPassword={handleForgotPassword}
          />
        )}
        {pageParam === "onboarding" && (
          <OnboardingPage
            isLoading={isLoading}
            onComplete={handleOnboardingComplete}
            onVerifyMeter={handleVerifyMeter}
          />
        )}
        {pageParam === "subscription" && (
          <SubscriptionPage isLoading={isLoading} onActivateTrial={handleActivateTrial} />
        )}
        {pageParam === "surge-checklist" && (
          <SurgeChecklistPage onBack={handleBack} />
        )}
        {pageParam === "dashboard" && (
          <DashboardPage
            isLoading={isDashboardLoading}
            userName={dashboardData?.userName || activeUser.name}
            remainingUnits={dashboardData?.remainingUnits ?? activeUser.currentUnits}
            daysRemaining={dashboardData?.daysRemaining ?? 4}
            dailyBurnRate={dashboardData?.dailyBurnRate ?? 4.3}
            powerSupplyHours={dashboardData?.powerSupplyHours ?? supplyHours}
            powerState={dashboardData?.powerState || powerState}
            recentActivity={dashboardData?.recentActivity || []}
            expectedSupplyHours={dashboardData?.expectedSupplyHours ?? 20}
            tariffBand={dashboardData?.tariffBand || activeUser.tariffBand || "Band A"}
            onTogglePower={handleTogglePower}
            onQuickAction={handleQuickAction}
            onProfileClick={() => navigateTo("profile")}
            appliances={dashboardData?.appliances || []}
            deviceActiveStates={deviceActiveStates}
            onToggleDevice={handleToggleDevice}
            recharges={historyData?.recharges || []}
            powerLogs={historyData?.powerLogs || []}
            usageLogs={historyData?.usageLogs || []}
          />
        )}
        {pageParam === "calculator" && (
          <CalculatorPage
            tariffRate={
              dashboardData?.tariffRate ??
              ({
                "Band A": 209.50,
                "Band B": 62.50,
                "Band C": 50.00,
                "Band D": 37.50,
                "Band E": 37.50
              }[activeUser.tariffBand || "Band A"] ?? 209.50)
            }
            burnRate={dashboardData?.dailyBurnRate ?? 4.3}
            onSaveRecharge={(amount, units) => {
              setIsSubmitting(true)
              const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
              const uid = auth.currentUser?.uid || "mock-uid"
              const currentTariff = dashboardData?.tariffRate ?? 209.50

              fetch(`${backendUrl}/logRecharge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  uid,
                  amount,
                  units,
                  tariffRate: currentTariff
                })
              })
                .then((res) => {
                  if (!res.ok) {
                    throw new Error("Failed to log recharge")
                  }
                  return res.json()
                })
                .then((data) => {
                  if (data.success && user) {
                    setUser({ ...user, currentUnits: data.newUnits })
                  }
                  trackAnalyticsEvent("recharge_logged", { amount, units })
                  fetchDashboardData()
                  fetchHistoryData()
                })
                .catch((err) => {
                  console.error(err)
                })
                .finally(() => {
                  setIsSubmitting(false)
                })
            }}
            isLoading={isDashboardLoading || !dashboardData}
            isSubmitting={isSubmitting}
            recharges={historyData?.recharges || []}
            isHistoryLoading={isHistoryLoading}
          />
        )}
        {pageParam === "insights" && (
          <InsightsPage
            isLoading={isInsightsLoading}
            dailyUsage={insightsData?.dailyUsage || []}
            weeklyUsage={insightsData?.weeklyUsage || []}
            monthlyUsage={insightsData?.monthlyUsage || []}
            insights={insightsData?.insights || []}
            applianceBreakdown={insightsData?.applianceBreakdown || []}
          />
        )}
        {pageParam === "devices" && (
          <DevicesPage
            isLoading={isDashboardLoading || !dashboardData}
            appliances={dashboardData?.appliances || []}
            deviceActiveStates={deviceActiveStates}
            onToggleDevice={handleToggleDevice}
            onAddAppliance={handleAddAppliance}
            onEditAppliance={handleEditAppliance}
            onDeleteAppliance={handleDeleteAppliance}
            isSubmitting={isSubmitting}
          />
        )}
        {pageParam === "profile" && (
          <ProfilePage
            userData={activeUser}
            onSaveProfile={handleSaveProfile}
            onUpdatePreferences={handleUpdatePreferences}
            onLogout={handleLogout}
            onNavigateTo={navigateTo}
            onVerifyMeter={handleVerifyMeter}
            isLoading={isDashboardLoading || !dashboardData}
            isSubmitting={isSubmitting}
          />
        )}
        {pageParam === "history" && (
          <HistoryPage
            isLoading={isHistoryLoading}
            recharges={historyData?.recharges || []}
            powerLogs={historyData?.powerLogs || []}
            usageLogs={historyData?.usageLogs || []}
            onBack={handleBack}
          />
        )}

      </div>

      {isMainTab && (
        <BottomNavigation
          activeTab={pageParam as TabType}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  )
}

export default function Page() {
  return (
    <React.Suspense fallback={<div className="flex-grow flex flex-col justify-center items-center h-full bg-zinc-50"><span className="text-sm text-zinc-500 font-sans">Loading...</span></div>}>
      <PageContent />
    </React.Suspense>
  )
}
