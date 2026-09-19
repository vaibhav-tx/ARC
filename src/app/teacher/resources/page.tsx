"use client"

import { useState, useEffect } from "react"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Upload, BookOpen, FileText, Presentation, ClipboardList,
  Search, Trash2, Download, Eye, Plus, Clock, Users,
  ChevronRight, CheckCircle, AlertCircle
} from "lucide-react"
import { toast } from "sonner"

interface Resource {
  _id: string
  title: string
  subject: string
  description: string
  content: string
  category: "notes" | "slides" | "assignment" | "reference"
  postedBy: string
  postedByName: string
  fileSize: string
  downloads: number
  createdAt: string
}

const categoryMeta = {
  notes:      { label: "Notes",      icon: BookOpen,      color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20"   },
  slides:     { label: "Slides",     icon: Presentation,  color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  assignment: { label: "Assignment", icon: ClipboardList, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  reference:  { label: "Reference",  icon: FileText,      color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
}



export default function TeacherResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("all")
  const [showForm, setShowForm] = useState(false)
  const [preview, setPreview] = useState<Resource | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [form, setForm] = useState({
    title: "", subject: "", description: "", content: "", category: "notes" as Resource["category"],
  })

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const u = localStorage.getItem("currentUser")
      if (u) {
        const parsed = JSON.parse(u)
        setCurrentUser(parsed)
        fetchResources(parsed._id || parsed.id)
      }
    } catch {}
  }, [])

  const fetchResources = async (tid?: string) => {
    setLoading(true)
    setError(null)
    const targetId = tid || currentUser?._id || currentUser?.id
    try {
      const res = await fetch(`/api/teacher/resources?teacherId=${targetId}`)
      if (!res.ok) throw new Error("Failed to load resources.")
      const data = await res.json()
      setResources(data.resources || [])
    } catch (err: any) {
      console.error("[FETCH_RESOURCES_ERROR]", err)
      setError("System outage. Failed to connect to backend resources server.")
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.subject || !form.content) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/teacher/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          postedBy: currentUser?._id || "teacher",
          postedByName: currentUser?.firstName || currentUser?.name || "Teacher",
        }),
      })
      if (res.ok) {
        setSuccess(true)
        toast.success("Resource created successfully")
        setForm({ title: "", subject: "", description: "", content: "", category: "notes" })
        fetchResources()
        setTimeout(() => { setSuccess(false); setShowForm(false) }, 1500)
      } else {
        toast.error("Failed to create resource")
      }
    } catch (error) {
      toast.error("Network error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/teacher/resources?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setResources(r => r.filter(x => x._id !== id))
        toast.success("Resource deleted successfully")
      } else {
        toast.error("Failed to delete resource")
      }
    } catch (err) {
      toast.error("Network error occurred")
    }
  }

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                        r.subject.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === "all" || r.category === catFilter
    return matchSearch && matchCat
  })

  const totalDownloads = resources.reduce((s, r) => s + r.downloads, 0)

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

  return (
    <div className="min-h-screen bg-black flex">
      <TeacherSidebar />
      <main className="flex-1 overflow-auto">

        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">My Resources</h1>
              <p className="text-zinc-500 text-sm mt-0.5">Post notes, slides & assignments for students</p>
            </div>
            <Button onClick={() => setShowForm(true)} className="bg-[#e78a53] hover:bg-[#e78a53]/90 gap-2">
              <Plus className="h-4 w-4" /> Post Resource
            </Button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">

          {error && (
            <div className="flex flex-col items-center justify-center py-12 bg-red-500/5 border border-red-500/20 rounded-xl">
               <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
               <h3 className="text-xl font-semibold text-red-400 mb-2">Failed to load data</h3>
               <p className="text-zinc-400">{error}</p>
               <Button onClick={() => fetchResources()} variant="outline" className="mt-6 border-zinc-700 text-zinc-300 hover:text-white">Retry Connection</Button>
            </div>
          )}

          {!error && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Posted",    value: resources.length,                                        color: "text-blue-400",   bg: "bg-blue-500/10",   icon: Upload    },
                  { label: "Notes",           value: resources.filter(r=>r.category==="notes").length,        color: "text-blue-400",   bg: "bg-blue-500/10",   icon: BookOpen  },
                  { label: "Assignments",     value: resources.filter(r=>r.category==="assignment").length,   color: "text-yellow-400", bg: "bg-yellow-500/10", icon: ClipboardList },
                  { label: "Total Downloads", value: totalDownloads,                                          color: "text-green-400",  bg: "bg-green-500/10",  icon: Download  },
                ].map(s => {
                  const Icon = s.icon
                  return (
                    <Card key={s.label} className="bg-zinc-900/60 border-zinc-800">
                      <CardContent className="p-5 flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
                        <div>
                          <p className="text-2xl font-bold text-white">{s.value}</p>
                          <p className="text-zinc-400 text-sm">{s.label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Search + Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="pl-10 bg-zinc-900/60 border-zinc-700 text-white placeholder-zinc-500" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", "notes", "slides", "assignment", "reference"].map(c => (
                    <button key={c} onClick={() => setCatFilter(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${catFilter === c ? "bg-[#e78a53]/20 text-[#e78a53] border border-[#e78a53]/30" : "bg-zinc-800/60 text-zinc-400 border border-zinc-700 hover:text-white"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resources grid */}
              {loading ? (
                <div className="text-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#e78a53] mx-auto" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400">No resources found</p>
                  <Button onClick={() => setShowForm(true)} className="mt-4 bg-[#e78a53] hover:bg-[#e78a53]/90 gap-1"><Plus className="h-4 w-4" /> Post first resource</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(r => {
                    const meta = categoryMeta[r.category]
                    const Icon = meta.icon
                    return (
                      <Card key={r._id} className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <Badge className={`${meta.bg} ${meta.color} ${meta.border} border text-xs gap-1`}>
                              <Icon className="h-3 w-3" />{meta.label}
                            </Badge>
                            <span className="text-zinc-600 text-[10px]">{fmt(r.createdAt)}</span>
                          </div>
                          <CardTitle className="text-white text-base leading-snug mt-2">{r.title}</CardTitle>
                          <p className="text-zinc-400 text-xs">{r.subject}</p>
                        </CardHeader>
                        <CardContent className="pt-0 flex-1 flex flex-col justify-between gap-3">
                          <p className="text-zinc-500 text-xs line-clamp-2">{r.description || "No description provided."}</p>
                          <div className="flex items-center justify-between text-xs text-zinc-500">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.postedByName}</span>
                            <span className="flex items-center gap-1"><Download className="h-3 w-3 text-green-400" />{r.downloads} downloads</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setPreview(r)} className="flex-1 border-zinc-700 text-zinc-300 hover:text-white text-xs gap-1">
                              <Eye className="h-3.5 w-3.5" /> Preview
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete(r._id)} className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs gap-1">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

        </div>
      </main>

      {/* ── Post Resource Dialog ── */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Upload className="h-5 w-5 text-[#e78a53]" /> Post New Resource</DialogTitle>
          </DialogHeader>
          {success ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <CheckCircle className="h-12 w-12 text-green-400" />
              <p className="text-white font-semibold">Resource posted successfully!</p>
              <p className="text-zinc-400 text-sm">Students can now access and download this resource.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 text-sm">Title *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Week 8 Notes" className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 text-sm">Subject *</Label>
                  <Input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} placeholder="e.g. CS301 — DSA" className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Category</Label>
                <div className="flex gap-2 flex-wrap">
                  {(["notes","slides","assignment","reference"] as const).map(c => {
                    const meta = categoryMeta[c]
                    const Icon = meta.icon
                    return (
                      <button key={c} onClick={() => setForm(f => ({...f, category: c}))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${form.category === c ? `${meta.bg} ${meta.color} ${meta.border}` : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"}`}>
                        <Icon className="h-3.5 w-3.5" />{meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief summary of this resource" className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-sm">Content * <span className="text-zinc-500 font-normal">(supports Markdown)</span></Label>
                <Textarea value={form.content} onChange={e => setForm(f => ({...f, content: e.target.value}))} placeholder="Paste your notes, assignment questions, or content here..." rows={10} className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 font-mono text-sm resize-none" />
              </div>
            </div>
          )}
          {!success && (
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="border-zinc-700 text-zinc-300">Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting || !form.title || !form.subject || !form.content} className="bg-[#e78a53] hover:bg-[#e78a53]/90 gap-2">
                {submitting ? <><div className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Posting...</> : <><Upload className="h-4 w-4" /> Post Resource</>}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Preview Dialog ── */}
      {preview && (
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="bg-zinc-900 border-zinc-700 max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${categoryMeta[preview.category].bg} ${categoryMeta[preview.category].color} border ${categoryMeta[preview.category].border} text-xs`}>
                  {categoryMeta[preview.category].label}
                </Badge>
                <span className="text-zinc-500 text-xs">{preview.subject}</span>
              </div>
              <DialogTitle className="text-white text-lg mt-1">{preview.title}</DialogTitle>
              <p className="text-zinc-500 text-xs flex items-center gap-3">
                <span>By {preview.postedByName}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fmt(preview.createdAt)}</span>
                <span className="flex items-center gap-1"><Download className="h-3 w-3 text-green-400" />{preview.downloads} downloads</span>
              </p>
            </DialogHeader>
            <div className="mt-2 bg-zinc-950 rounded-xl p-5 border border-zinc-800">
              <pre className="text-zinc-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">{preview.content}</pre>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreview(null)} className="border-zinc-700 text-zinc-300">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}