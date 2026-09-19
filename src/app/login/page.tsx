"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ShieldQuestion, Lock, X, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

// ── Forgot Password Modal ─────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"email" | "answer" | "success">("email")
  const [fpEmail, setFpEmail] = useState("")
  const [fpRole, setFpRole] = useState<"student" | "teacher" | "canteen">("student")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [fpError, setFpError] = useState("")
  const [fpLoading, setFpLoading] = useState(false)

  const handleGetQuestion = async () => {
    if (!fpEmail.trim()) { setFpError("Please enter your email address."); return }
    setFpError("")
    setFpLoading(true)
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-question", email: fpEmail, role: fpRole }),
      })
      const data = await res.json()
      if (!res.ok) { setFpError(data.error || "Failed to find account."); return }
      setSecurityQuestion(data.securityQuestion)
      setStep("answer")
    } catch {
      setFpError("Network error. Please try again.")
    } finally {
      setFpLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!securityAnswer.trim()) { setFpError("Please answer the security question."); return }
    if (newPassword.length < 8) { setFpError("Password must be at least 8 characters."); return }
    if (newPassword !== confirmNewPassword) { setFpError("Passwords do not match."); return }
    setFpError("")
    setFpLoading(true)
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", email: fpEmail, role: fpRole, securityAnswer, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setFpError(data.error || "Reset failed."); return }
      setStep("success")
      toast.success("Password reset successfully!")
    } catch {
      setFpError("Network error. Please try again.")
    } finally {
      setFpLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/60"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {step === "email" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#e78a53]/10 rounded-xl">
                <ShieldQuestion className="h-6 w-6 text-[#e78a53]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Forgot Password</h2>
                <p className="text-zinc-400 text-sm">We'll verify via your security question</p>
              </div>
            </div>

            {fpError && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fpError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-zinc-300">Account Type</Label>
              <Select value={fpRole} onValueChange={(v) => setFpRole(v as any)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="canteen">Canteen Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Email Address</Label>
              <Input
                type="email"
                value={fpEmail}
                onChange={(e) => setFpEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                onKeyDown={(e) => e.key === "Enter" && handleGetQuestion()}
              />
            </div>

            <Button
              onClick={handleGetQuestion}
              disabled={fpLoading}
              className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white font-semibold py-3 rounded-xl"
            >
              {fpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {fpLoading ? "Looking up account..." : "Continue →"}
            </Button>
          </div>
        )}

        {step === "answer" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#e78a53]/10 rounded-xl">
                <Lock className="h-6 w-6 text-[#e78a53]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Security Verification</h2>
                <p className="text-zinc-400 text-sm">Answer your security question to continue</p>
              </div>
            </div>

            {fpError && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fpError}</AlertDescription>
              </Alert>
            )}

            <div className="p-4 bg-zinc-800/60 border border-zinc-700 rounded-xl">
              <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">Security Question</p>
              <p className="text-white font-medium">{securityQuestion}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Your Answer</Label>
              <Input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Enter your answer"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setStep("email"); setFpError("") }}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                ← Back
              </Button>
              <Button
                onClick={handleResetPassword}
                disabled={fpLoading}
                className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90 text-white font-semibold rounded-xl"
              >
                {fpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {fpLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-5 py-4">
            <div className="flex justify-center">
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-zinc-400 text-sm">Your password has been updated. You can now sign in with your new password.</p>
            </div>
            <Button
              onClick={onClose}
              className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white font-semibold py-3 rounded-xl"
            >
              Go to Sign In
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<'student' | 'teacher' | 'canteen'>('student')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Login failed')
        setIsLoading(false)
        return
      }
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('userRole', role)
      localStorage.setItem('currentUser', JSON.stringify(data))
      toast.success("Login successful")
      const dashboardUrls = {
        student: '/student/dashboard',
        teacher: '/teacher/dashboard',
        canteen: '/canteen/dashboard'
      }
      window.location.href = dashboardUrls[role]
    } catch (err) {
      setErrorMsg('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <AnimatePresence>
        {showForgotPassword && (
          <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
        )}
      </AnimatePresence>

      <Link
        href="/"
        className="absolute top-6 left-6 z-20 text-zinc-400 hover:text-[#e78a53] transition-colors duration-200 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Home</span>
      </Link>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-[#e78a53] font-bold tracking-tight text-2xl">Arc Campus</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-zinc-400">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8"
        >
          {errorMsg && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-zinc-300">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#e78a53]/50 focus:ring-[#e78a53]/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#e78a53]/50 focus:ring-[#e78a53]/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Account Type</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="canteen">Canteen Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-zinc-700 bg-zinc-800 text-[#e78a53] focus:ring-[#e78a53]/20"
                />
                <span className="text-zinc-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#e78a53] hover:text-[#e78a53]/80 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90 text-white font-medium py-3 rounded-xl transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-400">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#e78a53] hover:text-[#e78a53]/80 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Social Login */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-zinc-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.info("OAuth login is not configured for this hackathon demo. Please use the email/password sign-in above.")}
              className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5 mr-2 text-zinc-300 group-hover:text-black transition-colors duration-200"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.info("OAuth login is not configured for this hackathon demo. Please use the email/password sign-in above.")}
              className="bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all duration-200 group"
            >
              <svg
                className="w-5 h-5 mr-2 text-zinc-300 group-hover:text-black transition-colors duration-200"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
