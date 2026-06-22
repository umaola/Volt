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
import { auth, getFcmToken, onMessageListener } from "@/lib/firebase"
import { toast } from "sonner"


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
  const [powerState, setPowerState] = React.useState<"on" | "off">("off")
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
    estimatedSessionMinutes?: number
    currentSessionStart?: string
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

  const getLocalDashboardFallback = React.useCallback((currentUser: any) => {
    const cachedApps = localStorage.getItem("volt_appliances")
    const appliancesList = cachedApps ? JSON.parse(cachedApps) : []
    let calculatedBurnRate = 0
    appliancesList.forEach((app: any) => {
      calculatedBurnRate += (Number(app.wattage || app.custom_wattage || 0) * Number(app.hours || app.hours_per_day || 0)) / 1000
    })
    const cachedUser = typeof window !== "undefined" ? localStorage.getItem("volt_user") : null
    const parsedUser = cachedUser ? JSON.parse(cachedUser) : null
    const createdTime = parsedUser?.created_at ? new Date(parsedUser.created_at).getTime() : (auth.currentUser?.metadata.creationTime ? new Date(auth.currentUser.metadata.creationTime).getTime() : Date.now())
    const isNewUser = (Date.now() - createdTime) < 24 * 60 * 60 * 1000

    let dailyBurnRate = 0
    if (!isNewUser) {
      dailyBurnRate = calculatedBurnRate > 0 ? calculatedBurnRate : 4.3
    }
    const currentUnits = currentUser?.currentUnits ?? 18.4
    const daysRemaining = dailyBurnRate > 0 ? Math.max(0, Math.ceil(Number(currentUnits) / dailyBurnRate)) : 0
    const cachedLogs = localStorage.getItem("volt_power_logs")
    const localLogs = cachedLogs ? JSON.parse(cachedLogs) : []
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    let totalSeconds = 0
    localLogs.forEach((log: any) => {
      const start = Math.max(new Date(log.powerOn).getTime(), cutoff)
      const end = log.powerOff ? new Date(log.powerOff).getTime() : Date.now()
      if (end > start) {
        totalSeconds += (end - start) / 1000
      }
    })
    const powerSupplyHours = Number((totalSeconds / 3600).toFixed(1))
    const activeLog = localLogs.find((l: any) => l.powerOff === null)
    const currentSessionStart = activeLog ? activeLog.powerOn : null
    return {
      userName: currentUser?.name || "Amarachi Okafor",
      remainingUnits: Number(Number(currentUnits).toFixed(1)),
      daysRemaining,
      dailyBurnRate: Number(dailyBurnRate.toFixed(1)),
      powerSupplyHours,
      powerState: (activeLog ? "on" : "off") as "on" | "off",
      recentActivity: [],
      tariffBand: currentUser?.tariffBand || "Band A",
      appliances: appliancesList,
      expectedSupplyHours: 20,
      currentSessionStart: currentSessionStart || undefined
    }
  }, [])

  const userRef = React.useRef(user)
  React.useEffect(() => {
    userRef.current = user
  }, [user])

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
        if (data.appliances && typeof window !== "undefined") {
          localStorage.setItem("volt_appliances", JSON.stringify(data.appliances))
        }
        if (data.powerState) {
          setPowerState(data.powerState)
        }
        setUser((prev) => {
          const mNum = data.meterNumber || (prev?.meterNumber || "")
          const pPlan = data.subscription?.planType || (prev?.plan || "")
          return {
            name: data.userName || (auth.currentUser?.displayName || "Amarachi Okafor"),
            phone: data.phone || (auth.currentUser?.phoneNumber || ""),
            email: data.email || (auth.currentUser?.email || ""),
            meterNumber: mNum,
            disco: data.disco || (prev?.disco || ""),
            tariffBand: data.tariffBand || (prev?.tariffBand || ""),
            meterType: data.meterType || (prev?.meterType || ""),
            currentUnits: data.remainingUnits ?? (prev?.currentUnits ?? 0),
            plan: pPlan,
            notificationPreferences: data.notificationPreferences || prev?.notificationPreferences,
            subscription: data.subscription || prev?.subscription
          }
        })
      })
      .catch((err) => {
        console.error(err)
        const cachedUser = typeof window !== "undefined" ? localStorage.getItem("volt_user") : null
        const parsedUser = cachedUser ? JSON.parse(cachedUser) : null
        if (parsedUser) {
          setUser(parsedUser)
        }
        setDashboardData(getLocalDashboardFallback(parsedUser || userRef.current))
      })
      .finally(() => {
        setIsDashboardLoading(false)
      })
  }, [getLocalDashboardFallback])

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
        const cachedRecharges = localStorage.getItem("volt_recharges")
        const recharges = cachedRecharges ? JSON.parse(cachedRecharges) : []
        const cachedLogs = localStorage.getItem("volt_power_logs")
        const powerLogs = cachedLogs ? JSON.parse(cachedLogs) : []
        setHistoryData({
          recharges,
          powerLogs,
          usageLogs: []
        })
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
        const cachedApps = localStorage.getItem("volt_appliances")
        const appliancesList = cachedApps ? JSON.parse(cachedApps) : []
        const cachedUser = typeof window !== "undefined" ? localStorage.getItem("volt_user") : null
        const parsedUser = cachedUser ? JSON.parse(cachedUser) : null
        const createdTime = parsedUser?.created_at ? new Date(parsedUser.created_at).getTime() : (auth.currentUser?.metadata.creationTime ? new Date(auth.currentUser.metadata.creationTime).getTime() : Date.now())
        const isNewUser = (Date.now() - createdTime) < 24 * 60 * 60 * 1000

        let dailyBurn = 0
        if (!isNewUser) {
          appliancesList.forEach((app: any) => {
            dailyBurn += (Number(app.wattage || app.custom_wattage || 0) * Number(app.hours || app.hours_per_day || 0)) / 1000
          })
          if (dailyBurn === 0) dailyBurn = 4.3
        }
        const dailyUsage = []
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dayName = days[d.getDay()]
          const variance = 0.85 + Math.random() * 0.3
          const kwh = Number((dailyBurn * variance).toFixed(2))
          const cost = Number((kwh * 209.50).toFixed(2))
          dailyUsage.push({
            label: dayName,
            kwh,
            cost
          })
        }
        setInsightsData({
          dailyUsage,
          weeklyUsage: [],
          monthlyUsage: [],
          insights: [],
          applianceBreakdown: []
        })
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
        setUser((prev) => {
          if (prev) return prev
          if (typeof window !== "undefined") {
            const cached = localStorage.getItem("volt_user")
            if (cached) {
              try {
                return JSON.parse(cached)
              } catch (e) {}
            }
          }
          return {
            name: firebaseUser.displayName || "",
            phone: firebaseUser.phoneNumber || "",
            email: firebaseUser.email || "",
            meterNumber: "",
            disco: "",
            tariffBand: "",
            meterType: "",
            currentUnits: 0,
            plan: ""
          }
        })
        const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
        fetch(`${backendUrl}/getDashboardData?uid=${firebaseUser.uid}`)
          .then((res) => {
            if (!res.ok) throw new Error()
            return res.json()
          })
          .then((data) => {
            setDashboardData(data)
            if (data.appliances && typeof window !== "undefined") {
              localStorage.setItem("volt_appliances", JSON.stringify(data.appliances))
            }
            if (data.powerState) setPowerState(data.powerState)
            setUser((prev) => {
              const mNum = data.meterNumber || (prev?.meterNumber || "")
              const pPlan = data.subscription?.planType || (prev?.plan || "")
              return {
                name: data.userName || firebaseUser.displayName || "Amarachi Okafor",
                phone: data.phone || firebaseUser.phoneNumber || "",
                email: data.email || firebaseUser.email || "",
                meterNumber: mNum,
                disco: data.disco || (prev?.disco || ""),
                tariffBand: data.tariffBand || (prev?.tariffBand || ""),
                meterType: data.meterType || (prev?.meterType || ""),
                currentUnits: data.remainingUnits ?? (prev?.currentUnits ?? 0),
                plan: pPlan,
                notificationPreferences: data.notificationPreferences || prev?.notificationPreferences,
                subscription: data.subscription || prev?.subscription
              }
            })
          })
          .catch((err) => {
            console.error(err)
            const cachedUser = typeof window !== "undefined" ? localStorage.getItem("volt_user") : null
            const parsedUser = cachedUser ? JSON.parse(cachedUser) : null
            if (parsedUser) {
              setUser(parsedUser)
            }
            setDashboardData(getLocalDashboardFallback(parsedUser || user))
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

    if (auth.currentUser) {
      if (pageParam === "dashboard") {
        fetchDashboardData()
        fetchHistoryData()
        fetchInsightsData()

        const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
        const uid = auth.currentUser.uid
        const registerFCM = async () => {
          try {
            if (typeof window !== "undefined" && "Notification" in window) {
              const permission = await Notification.requestPermission()
              if (permission === "granted") {
                const token = await getFcmToken()
                if (token) {
                  await fetch(`${backendUrl}/registerDeviceToken`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      uid,
                      deviceToken: token,
                      platform: "web"
                    })
                  })
                  return
                }
              }
            }
          } catch (e) {
            console.error("FCM registration error:", e)
          }
          await fetch(`${backendUrl}/registerDeviceToken`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid,
              deviceToken: "token_mock_" + uid,
              platform: "web"
            })
          }).catch((err) => {
            console.error("Mock token registration error:", err)
          })
        }
        registerFCM()
      } else if (pageParam === "calculator") {
        fetchDashboardData()
        fetchHistoryData()
      } else if (pageParam === "devices" || pageParam === "profile") {
        fetchDashboardData()
      } else if (pageParam === "history") {
        fetchHistoryData()
      } else if (pageParam === "insights") {
        fetchInsightsData()
      }
    }
  }, [pageParam, fetchDashboardData, fetchHistoryData, fetchInsightsData, authResolved])

  React.useEffect(() => {
    let unsubscribeMessageListener: (() => void) | undefined
    const setupListener = async () => {
      unsubscribeMessageListener = await onMessageListener((payload) => {
        if (payload?.notification) {
          toast(payload.notification.title || "Notification", {
            description: payload.notification.body,
            duration: 5000,
          })
        }
      })
    }
    setupListener()
    return () => {
      if (unsubscribeMessageListener) {
        unsubscribeMessageListener()
      }
    }
  }, [])
  React.useEffect(() => {
    if (!authResolved) return
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem("volt_user", JSON.stringify(user))
      } else {
        localStorage.removeItem("volt_user")
      }
    }
  }, [user, authResolved])


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
        return { success: true, customerName: "Test User (Verified)" }
      })
  }, [])

  const handleValidatePassword = React.useCallback((password: string) => {
    const pass = password || ""
    return Promise.resolve({
      hasMinLength: pass.length >= 8,
      hasCapital: /[A-Z]/.test(pass),
      hasNumber: /\d/.test(pass),
      hasSpecial: /[^A-Za-z0-9]/.test(pass)
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
    powerState: "on" | "off"
  }) => {
    setIsLoading(true)
    localStorage.setItem("volt_appliances", JSON.stringify(data.appliances))
    if (data.powerState === "on") {
      const localLogs = [{
        id: "local_" + Date.now(),
        powerOn: new Date().toISOString(),
        powerOff: null,
        duration: 0
      }]
      localStorage.setItem("volt_power_logs", JSON.stringify(localLogs))
    } else {
      localStorage.setItem("volt_power_logs", JSON.stringify([]))
    }
    setPowerState(data.powerState)
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
        currentUnits: data.currentUnits,
        powerState: data.powerState
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
        if (user) {
          setUser({
            ...user,
            plan: plan === "monthly" ? "Monthly" : "Annual"
          })
        }
        navigateTo("dashboard")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleTogglePower = (state: "on" | "off") => {
    setPowerState(state)
    setIsDashboardLoading(true)
    const localLogsStr = localStorage.getItem("volt_power_logs")
    const localLogs = localLogsStr ? JSON.parse(localLogsStr) : []
    if (state === "on") {
      const activeLog = localLogs.find((l: any) => l.powerOff === null)
      if (!activeLog) {
        localLogs.unshift({
          id: "local_" + Date.now(),
          powerOn: new Date().toISOString(),
          powerOff: null,
          duration: 0
        })
      }
    } else {
      const activeLogIndex = localLogs.findIndex((l: any) => l.powerOff === null)
      if (activeLogIndex !== -1) {
        const nowStr = new Date().toISOString()
        const duration = (new Date(nowStr).getTime() - new Date(localLogs[activeLogIndex].powerOn).getTime()) / (1000 * 60 * 60)
        localLogs[activeLogIndex].powerOff = nowStr
        localLogs[activeLogIndex].duration = Number(duration.toFixed(2))
      }
    }
    localStorage.setItem("volt_power_logs", JSON.stringify(localLogs))
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
          fetchHistoryData()
        }
      })
      .catch((err) => {
        console.error(err)
        fetchDashboardData()
        fetchHistoryData()
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
    const cachedApps = localStorage.getItem("volt_appliances")
    const apps = cachedApps ? JSON.parse(cachedApps) : []
    apps.push(appliance)
    localStorage.setItem("volt_appliances", JSON.stringify(apps))
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
        fetchDashboardData()
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditAppliance = (appliance: { name: string; wattage: number; hours: number }) => {
    setIsSubmitting(true)
    const cachedApps = localStorage.getItem("volt_appliances")
    let apps = cachedApps ? JSON.parse(cachedApps) : []
    apps = apps.map((a: any) => a.name === appliance.name ? appliance : a)
    localStorage.setItem("volt_appliances", JSON.stringify(apps))
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
        fetchDashboardData()
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleDeleteAppliance = (name: string) => {
    setIsSubmitting(true)
    const cachedApps = localStorage.getItem("volt_appliances")
    let apps = cachedApps ? JSON.parse(cachedApps) : []
    apps = apps.filter((a: any) => a.name !== name)
    localStorage.setItem("volt_appliances", JSON.stringify(apps))
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
        fetchDashboardData()
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditRecharge = (id: string, amount: number, units: number) => {
    setIsSubmitting(true)
    const cachedRecharges = localStorage.getItem("volt_recharges")
    const recharges = cachedRecharges ? JSON.parse(cachedRecharges) : []
    const targetIdx = recharges.findIndex((r: any) => r.id === id)
    let oldUnits = 0
    if (targetIdx !== -1) {
      oldUnits = recharges[targetIdx].units || 0
      recharges[targetIdx].amount = amount
      recharges[targetIdx].units = units
      localStorage.setItem("volt_recharges", JSON.stringify(recharges))
    }

    const diffUnits = units - oldUnits
    if (user) {
      const newUnits = (user.currentUnits || 0) + diffUnits
      setUser({ ...user, currentUnits: Number(newUnits.toFixed(2)) })
    }

    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"
    fetch(`${backendUrl}/updateRecharge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        rechargeId: id,
        amount,
        units
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to edit recharge")
        }
        return res.json()
      })
      .then((data) => {
        if (data.success && user) {
          setUser({ ...user, currentUnits: data.newUnits })
        }
        fetchDashboardData()
        fetchHistoryData()
      })
      .catch((err) => {
        console.error(err)
        fetchDashboardData()
        fetchHistoryData()
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleDeleteRecharge = (id: string) => {
    setIsSubmitting(true)
    const cachedRecharges = localStorage.getItem("volt_recharges")
    const recharges = cachedRecharges ? JSON.parse(cachedRecharges) : []
    const targetIdx = recharges.findIndex((r: any) => r.id === id)
    let oldUnits = 0
    if (targetIdx !== -1) {
      oldUnits = recharges[targetIdx].units || 0
      const updatedRecharges = recharges.filter((r: any) => r.id !== id)
      localStorage.setItem("volt_recharges", JSON.stringify(updatedRecharges))
    }

    if (user) {
      const newUnits = Math.max(0, (user.currentUnits || 0) - oldUnits)
      setUser({ ...user, currentUnits: Number(newUnits.toFixed(2)) })
    }

    const backendUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL
    const uid = auth.currentUser?.uid || "mock-uid"
    fetch(`${backendUrl}/deleteRecharge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid,
        rechargeId: id
      })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete recharge")
        }
        return res.json()
      })
      .then((data) => {
        if (data.success && user) {
          setUser({ ...user, currentUnits: data.newUnits })
        }
        fetchDashboardData()
        fetchHistoryData()
      })
      .catch((err) => {
        console.error(err)
        fetchDashboardData()
        fetchHistoryData()
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
    signOut(auth)
      .then(() => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("volt_user")
          localStorage.removeItem("volt_appliances")
          localStorage.removeItem("volt_power_logs")
          localStorage.removeItem("volt_recharges")
        }
      })
      .catch((err) => {
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
      <div className="flex-grow flex flex-col justify-center items-center h-[100dvh] bg-zinc-50">
        <span className="text-sm text-zinc-500 font-sans">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex-grow flex flex-col h-[100dvh] max-h-[100dvh] justify-between bg-zinc-50 overflow-hidden">
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
            weeklyUsage={insightsData?.weeklyUsage || []}
            monthlyUsage={insightsData?.monthlyUsage || []}
            estimatedSessionMinutes={dashboardData?.estimatedSessionMinutes ?? 0}
            currentSessionStart={dashboardData?.currentSessionStart}
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
              const cachedRecharges = localStorage.getItem("volt_recharges")
              const recharges = cachedRecharges ? JSON.parse(cachedRecharges) : []
              recharges.unshift({
                id: "local_" + Date.now(),
                amount,
                units,
                date: new Date().toISOString(),
                source: "Manual"
              })
              localStorage.setItem("volt_recharges", JSON.stringify(recharges))

              if (user) {
                const newUnits = (user.currentUnits || 0) + Number(units)
                setUser({ ...user, currentUnits: Number(newUnits.toFixed(2)) })
              }

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
                  fetchDashboardData()
                  fetchHistoryData()
                })
                .finally(() => {
                  setIsSubmitting(false)
                })
            }}
            isLoading={isDashboardLoading || !dashboardData}
            isSubmitting={isSubmitting}
            recharges={historyData?.recharges || []}
            isHistoryLoading={isHistoryLoading}
            onEditRecharge={handleEditRecharge}
            onDeleteRecharge={handleDeleteRecharge}
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
