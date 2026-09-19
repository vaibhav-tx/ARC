"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

// ── Demo accounts that already exist via the login bypass ────────────────────
const DEMO_ACCOUNTS = {
  student: { email: "rahul.sharma@student.edu", password: "Password@123", role: "student", label: "Demo Student", dashboard: "/student/dashboard" },
  teacher: { email: "priya.verma@college.edu", password: "Password@123", role: "teacher", label: "Demo Teacher", dashboard: "/teacher/dashboard" },
  canteen: { email: "sanjay.canteen@campus.in", password: "Password@123", role: "canteen", label: "Demo Canteen", dashboard: "/canteen/dashboard" },
} as const

export default function SignupPage() {
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  // Auto-redirect if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const userRole = localStorage.getItem("userRole")
    if (isLoggedIn === "true" && userRole) {
      const urls: Record<string, string> = {
        student: "/student/dashboard",
        teacher: "/teacher/dashboard",
        canteen: "/canteen/dashboard",
      }
      if (urls[userRole]) window.location.replace(urls[userRole])
    }
  }, [])

  const handleDemoLogin = async (roleKey: keyof typeof DEMO_ACCOUNTS) => {
    const demo = DEMO_ACCOUNTS[roleKey]
    setDemoLoading(roleKey)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demo.email, password: demo.password, role: demo.role }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Demo login failed")
        return
      }
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userRole", demo.role)
      localStorage.setItem("currentUser", JSON.stringify(data))
      toast.success(`Welcome! Entering ${demo.label} profile…`)
      window.location.href = demo.dashboard
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setDemoLoading(null)
    }
  }

  const roles = [
    {
      key: "student" as const,
      label: "Student",
      href: "/signup/student",
      icon: (
        <svg className="w-20 h-20 text-[#e78a53]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      ),
      description: "Access timetables, events, food ordering, resource booking, campus navigation, attendance tracking, and internship opportunities",
    },
    {
      key: "teacher" as const,
      label: "Teacher",
      href: "/signup/teacher",
      icon: (
        <svg className="w-20 h-20 text-[#e78a53]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
      description: "Manage timetables, track student attendance, place food orders, and access all teaching resources",
    },
    {
      key: "canteen" as const,
      label: "Canteen",
      href: "/signup/canteen",
      icon: (
        <svg className="w-20 h-20 text-[#e78a53]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.001 3.001 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.06 1.06 0 0 1 1.06 1.06l1.39 1.39c.354.353.354.927 0 1.28L19.682 7.22A1.5 1.5 0 0 1 18.622 8H5.378a1.5 1.5 0 0 1-1.06-1.06L3.75 6.349Z" />
        </svg>
      ),
      description: "Manage food stock, process orders, track queue system, and handle all canteen operations efficiently",
    },
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#e78a53]/3 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#e78a53]/2 rounded-full blur-3xl" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 z-20 text-zinc-400 hover:text-[#e78a53] transition-colors duration-200 flex items-center space-x-2 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </Link>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Join Arc Campus
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Choose your role to create a new account, or try a live demo instantly
          </p>
        </motion.div>

        {/* ── Demo Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-4xl mb-10"
        >
          <div className="p-5 bg-gradient-to-r from-[#e78a53]/10 via-[#e78a53]/5 to-transparent border border-[#e78a53]/25 rounded-2xl">
            <p className="text-center text-sm font-semibold text-[#e78a53] mb-4 uppercase tracking-wider">
              ⚡ Evaluator / Demo Mode — Jump straight into a live profile
            </p>
            <div className="grid grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleDemoLogin(r.key)}
                  disabled={!!demoLoading}
                  className="relative flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800/80 border border-zinc-700 hover:border-[#e78a53]/60 hover:bg-[#e78a53]/10 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {demoLoading === r.key ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#e78a53]" />
                  ) : (
                    <span className="text-[#e78a53] text-base">⚡</span>
                  )}
                  <span className="group-hover:text-[#e78a53] transition-colors">Demo {r.label}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-zinc-500 mt-3">
              Clicks instantly log you into a pre-built profile — no signup needed
            </p>
          </div>
        </motion.div>

        {/* Role Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-6xl"
        >
          <p className="text-center text-zinc-500 text-sm mb-6 uppercase tracking-wider">— or create your own account —</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {roles.map((r, i) => (
              <motion.div
                key={r.key}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // @ts-ignore
                style={{ transitionDelay: `${0.3 + i * 0.1}s` }}
              >
                <Link href={r.href} className="block h-full">
                  <div className="h-full min-h-[420px] bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-10 hover:border-[#e78a53]/60 hover:bg-gradient-to-br hover:from-[#e78a53]/5 hover:to-zinc-800/60 transition-all duration-500 cursor-pointer text-center group-hover:shadow-2xl group-hover:shadow-[#e78a53]/20">
                    <div className="flex flex-col items-center gap-8 h-full justify-center">
                      <div className="p-10 bg-gradient-to-br from-[#e78a53]/20 to-[#e78a53]/10 rounded-full group-hover:from-[#e78a53]/30 group-hover:to-[#e78a53]/20 transition-all duration-500 group-hover:scale-110">
                        {r.icon}
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-3xl font-bold text-white group-hover:text-[#e78a53] transition-colors duration-300">
                          {r.label}
                        </h3>
                        <p className="text-zinc-300 text-base leading-relaxed max-w-sm mx-auto">
                          {r.description}
                        </p>
                        <div className="mt-6">
                          <div className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-[#e78a53] to-[#e78a53]/80 text-white rounded-full text-base font-semibold group-hover:from-[#e78a53]/90 group-hover:to-[#e78a53] transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#e78a53]/25">
                            Create Account
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-zinc-400 text-lg">
            Already have an account?{" "}
            <Link href="/login" className="text-[#e78a53] hover:text-[#e78a53]/80 font-semibold transition-colors duration-200">
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
