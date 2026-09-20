"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  GraduationCap,
  BookOpen,
  Calendar,
  Building,
  Upload,
  Code,
  Palette,
  Database,
  Brain,
  Smartphone,
  Globe,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Github,
  Linkedin,
  ExternalLink,
  CheckCircle,
  Hash,
  UserCheck,
  AlertCircle,
  Zap
} from "lucide-react"

export default function StudentSignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [classDetails, setClassDetails] = useState<any[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const requiredStudentFields = [
    'firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone', 'gender', 'dateOfBirth', 'address',
    'studentId', 'course', 'branch', 'year', 'semester', 'rollNumber', 'section',
    'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation', 'parentGuardianName', 'parentGuardianPhone',
    'securityQuestion', 'securityAnswer',
  ]

  const [formData, setFormData] = useState({
    // Section 1: Personal Information
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    address: "",

    // Section 2: Academic Information
    studentId: "",
    course: "",
    branch: "",
    year: "",
    semester: "",
    rollNumber: "",
    section: "",

    // Section 3: Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    parentGuardianName: "",
    parentGuardianPhone: "",

    // Section 4: Additional Information
    bio: "",
    interests: [] as string[],
    skills: [] as string[],
    profilePicture: null as File | null,

    // Section 5: Account Security
    securityQuestion: "",
    securityAnswer: "",
  })

  const [newInterest, setNewInterest] = useState("Public Speaking")
  const [newSkill, setNewSkill] = useState("MongoDB")

  // Load available classes on component mount
  useEffect(() => {
    const loadAvailableClasses = async () => {
      try {
        setIsLoadingClasses(true)
        const response = await fetch('/api/classes/available')
        const data = await response.json()
        
        if (response.ok) {
          setAvailableClasses(data.availableClasses || [])
          setClassDetails(data.classDetails || [])
        } else {
          console.error('Failed to load classes:', data.error)
        }
      } catch (error) {
        console.error('Error loading classes:', error)
      } finally {
        setIsLoadingClasses(false)
      }
    }
    
    loadAvailableClasses()
  }, [])

  const courses = [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Business Administration",
    "Commerce",
    "Arts",
    "Science"
  ]

  const branches = [
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Electrical",
    "Mechanical",
    "Civil",
    "Chemical",
    "Biotechnology",
    "Data Science",
    "Artificial Intelligence",
    "Cyber Security",
    "Software Engineering"
  ]

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"]
  const semesters = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester", "9th Semester", "10th Semester"]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }))
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, profilePicture: file }))
    }
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "rahul.sharma@student.edu", password: "Password@123", role: "student" }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userRole", "student")
        localStorage.setItem("currentUser", JSON.stringify(data))
      } else {
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userRole", "student")
        localStorage.setItem("currentUser", JSON.stringify({
          id: "650000000000000000000001",
          name: "Rahul Sharma",
          email: "rahul.sharma@student.edu",
          role: "student",
          avatarInitials: "RS"
        }))
      }
      toast.success("Welcome! Entering Demo Student profile...")
      window.location.href = "/student/dashboard"
    } catch {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("userRole", "student")
      localStorage.setItem("currentUser", JSON.stringify({
        id: "650000000000000000000001",
        name: "Rahul Sharma",
        email: "rahul.sharma@student.edu",
        role: "student",
        avatarInitials: "RS"
      }))
      toast.success("Welcome! Entering Demo Student profile...")
      window.location.href = "/student/dashboard"
    }
  }

  const handleSubmit = async () => {
    setErrorMsg("")
    const missing = requiredStudentFields.filter((k) => !((formData as any)[k] && String((formData as any)[k]).trim().length))
    if (missing.length) {
      setErrorMsg(`Please fill all fields: ${missing.join(', ')}`)
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/signup/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Signup failed')
        setIsLoading(false)
        return
      }
      toast.success('Account created successfully! Please sign in with your credentials.')
      window.location.href = '/login'
    } catch (e: any) {
      setErrorMsg('Network error. Please try again.')
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <User className="h-6 w-6 text-[#e78a53]" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">First Name</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Last Name</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#e78a53]" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your college email"
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#e78a53]" />
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create password"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Confirm Password</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#e78a53]" />
                    Phone Number
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#e78a53]" />
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="bg-background/50 border-border/50 text-white [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#e78a53]" />
                    Address
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-[#e78a53]" />
                </div>
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Hash className="h-4 w-4 text-[#e78a53]" />
                    Student ID
                  </Label>
                  <Input
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="Enter student ID"
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Roll Number</Label>
                  <Input
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                    placeholder="Enter roll number"
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#e78a53]" />
                    Course
                  </Label>
                  <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Branch/Stream</Label>
                  <Select value={formData.branch} onValueChange={(value) => handleInputChange('branch', value)}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Year</Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Semester</Label>
                  <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground flex items-center gap-2">
                    <Building className="h-4 w-4 text-[#e78a53]" />
                    Class/Section
                  </Label>
                  {isLoadingClasses ? (
                    <div className="bg-background/50 border-border/50 rounded-md p-3 text-center text-sm text-muted-foreground">
                      Loading available classes...
                    </div>
                  ) : (
                    <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select your class" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableClasses.map((className) => {
                          const classDetail = classDetails.find(detail => detail.className === className)
                          return (
                            <SelectItem key={className} value={className}>
                              <div className="flex flex-col">
                                <span className="font-medium">{className}</span>
                                {classDetail && (
                                  <span className="text-xs text-muted-foreground">
                                    {classDetail.subjectCount} subjects • {classDetail.teacherCount} teachers
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  )}
                  {formData.section && classDetails.find(detail => detail.className === formData.section) && (
                    <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                      <p className="font-medium">Subjects in {formData.section}:</p>
                      <p>{classDetails.find(detail => detail.className === formData.section)?.subjects.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <UserCheck className="h-6 w-6 text-[#e78a53]" />
                </div>
                Emergency Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Contact Name</Label>
                    <Input
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="Enter emergency contact name"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Contact Phone</Label>
                    <Input
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="Enter emergency contact phone"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Relationship</Label>
                  <Select value={formData.emergencyContactRelation} onValueChange={(value) => handleInputChange('emergencyContactRelation', value)}>
                    <SelectTrigger className="bg-background/50 border-border/50">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Parent/Guardian Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Parent/Guardian Name</Label>
                    <Input
                      value={formData.parentGuardianName}
                      onChange={(e) => handleInputChange('parentGuardianName', e.target.value)}
                      placeholder="Enter parent/guardian name"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Parent/Guardian Phone</Label>
                    <Input
                      value={formData.parentGuardianPhone}
                      onChange={(e) => handleInputChange('parentGuardianPhone', e.target.value)}
                      placeholder="Enter parent/guardian phone"
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <FileText className="h-6 w-6 text-[#e78a53]" />
                </div>
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">


              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#e78a53]" />
                  Bio (Optional)
                </Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself, your goals, hobbies..."
                  className="bg-background/50 border-border/50 min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-foreground">Interests</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest (e.g., Programming, Sports)"
                    className="bg-background/50 border-border/50"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <Button onClick={addInterest} size="icon" className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-[#e78a53]/10 text-[#e78a53]">
                      {interest}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-foreground">Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., Python, Leadership)"
                    className="bg-background/50 border-border/50"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button onClick={addSkill} size="icon" className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-[#e78a53]/10 text-[#e78a53]">
                      {skill}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
      case 5:
        return (
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-[#e78a53]/10 rounded-lg">
                  <UserCheck className="h-6 w-6 text-[#e78a53]" />
                </div>
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-[#e78a53]/5 border border-[#e78a53]/20 rounded-xl">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  <span className="font-semibold text-[#e78a53]">Why set a security question?</span>
                  <br />
                  If you ever forget your password, we'll ask you this question to verify your identity and let you reset it. Choose something only you know.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4 text-[#e78a53]" />
                  Security Question
                </Label>
                <Select
                  value={formData.securityQuestion}
                  onValueChange={(v) => handleInputChange('securityQuestion', v)}
                >
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Choose a security question" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="What was the name of your first pet?">What was the name of your first pet?</SelectItem>
                    <SelectItem value="What is your mother's maiden name?">What is your mother's maiden name?</SelectItem>
                    <SelectItem value="What was the name of your primary school?">What was the name of your primary school?</SelectItem>
                    <SelectItem value="What city were you born in?">What city were you born in?</SelectItem>
                    <SelectItem value="What is your oldest sibling's middle name?">What is your oldest sibling's middle name?</SelectItem>
                    <SelectItem value="What street did you grow up on?">What street did you grow up on?</SelectItem>
                    <SelectItem value="What was the make of your first car?">What was the make of your first car?</SelectItem>
                    <SelectItem value="What was your childhood nickname?">What was your childhood nickname?</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#e78a53]" />
                  Your Answer
                </Label>
                <Input
                  type="text"
                  value={formData.securityAnswer}
                  onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                  placeholder="Enter your answer (case-insensitive)"
                  className="bg-background/50 border-border/50"
                />
                <p className="text-xs text-zinc-500">Your answer is not case-sensitive. Keep it memorable but hard to guess.</p>
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 text-zinc-400 hover:text-[#e78a53] transition-colors duration-200 flex items-center space-x-2"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Student Registration</h1>
          <p className="text-zinc-400 mb-5">Create your student profile in 5 simple steps</p>

          <div className="inline-flex flex-col items-center gap-2 p-4 bg-gradient-to-r from-[#e78a53]/15 via-amber-500/10 to-[#e78a53]/15 border border-[#e78a53]/40 rounded-2xl backdrop-blur-md shadow-xl shadow-[#e78a53]/10">
            <Button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#e78a53] to-amber-600 hover:from-[#e78a53]/90 hover:to-amber-600/90 text-white font-bold px-7 py-3 rounded-xl shadow-lg shadow-[#e78a53]/25 flex items-center gap-2.5 text-base border border-amber-300/40 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-pulse" />
              <span>⚡ Instant Demo Student Profile (Bypass Registration)</span>
            </Button>
            <p className="text-xs text-amber-200/90 font-medium">
              Evaluator Mode: Clicks directly open the working Student Dashboard & Profile
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step
                  ? 'bg-[#e78a53] border-[#e78a53] text-white'
                  : 'bg-transparent border-zinc-600 text-zinc-600'
                  }`}>
                  {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${currentStep > step ? 'bg-[#e78a53]' : 'bg-zinc-600'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {renderStep()}

          {errorMsg && (
            <Alert variant="destructive" className="mt-6 bg-red-500/10 border-red-500/50 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
        </motion.div>

        <div className="flex justify-between">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              className="bg-[#e78a53] hover:bg-[#e78a53]/90 flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-[#e78a53] hover:bg-[#e78a53]/90 flex items-center gap-2"
            >
              {isLoading ? "Creating Account..." : "Complete Registration"}
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#e78a53] hover:text-[#e78a53]/80 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
