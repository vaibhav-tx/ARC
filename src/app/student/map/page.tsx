"use client"

import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import { Bell, MapPin, Navigation, Building, Phone, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const campusLocations = [
  { name: "Main Academic Block", code: "Block A", type: "Academic", floor: "G + 3", description: "Lecture halls, faculty rooms, exam hall", color: "bg-blue-500/20 border-blue-500/30 text-blue-400" },
  { name: "Computer Science Department", code: "Block B", type: "Academic", floor: "G + 2", description: "CS labs, server room, project rooms", color: "bg-purple-500/20 border-purple-500/30 text-purple-400" },
  { name: "Library & Resource Centre", code: "Block C", type: "Library", floor: "G + 1", description: "Library, digital resource center, reading rooms", color: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" },
  { name: "Main Canteen", code: "Canteen 1", type: "Food", floor: "Ground", description: "Campus cafe, multi-cuisine dining", color: "bg-orange-500/20 border-orange-500/30 text-orange-400" },
  { name: "Sports Complex", code: "Block D", type: "Sports", floor: "Ground", description: "Indoor games, gym, basketball court", color: "bg-green-500/20 border-green-500/30 text-green-400" },
  { name: "Admin & Exam Cell", code: "Block E", type: "Admin", floor: "G + 1", description: "Administration, exam cell, accounts", color: "bg-red-500/20 border-red-500/30 text-red-400" },
  { name: "Parking Zone A (Bikes)", code: "Zone A", type: "Parking", floor: "Open", description: "Two-wheeler parking — 200 slots", color: "bg-zinc-500/20 border-zinc-500/30 text-zinc-400" },
  { name: "Parking Zone B (Cars)", code: "Zone B", type: "Parking", floor: "Open", description: "Four-wheeler faculty parking — 80 slots", color: "bg-zinc-500/20 border-zinc-500/30 text-zinc-400" },
  { name: "Hostel Block (Boys)", code: "Hostel H1", type: "Hostel", floor: "G + 4", description: "Boys hostel, warden room, visitor lobby", color: "bg-teal-500/20 border-teal-500/30 text-teal-400" },
  { name: "Hostel Block (Girls)", code: "Hostel H2", type: "Hostel", floor: "G + 4", description: "Girls hostel, warden room, visitor lobby", color: "bg-pink-500/20 border-pink-500/30 text-pink-400" },
]

const emergencyContacts = [
  { label: "Campus Security", number: "+91-20-2765-0001" },
  { label: "Medical / First Aid", number: "+91-20-2765-0002" },
  { label: "Admin Office", number: "+91-20-2765-0010" },
  { label: "Canteen", number: "+91-20-2765-0050" },
]

export default function CampusMapPage() {
  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-zinc-400 text-sm">Student Portal</p>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Navigation className="h-7 w-7 text-[#e78a53]" />
                Campus Map & Directory
              </h1>
              <p className="text-zinc-500 text-sm mt-1">Find buildings, labs, facilities and emergency contacts</p>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-zinc-400 cursor-pointer hover:text-white transition-colors" />
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Campus Layout Visual */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#e78a53]" />
                Campus Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {/* Visual grid of campus blocks */}
                {[
                  { code: "Block A", label: "Academic", color: "bg-blue-500/20 border-blue-500/40 text-blue-300" },
                  { code: "Block B", label: "CS Dept", color: "bg-purple-500/20 border-purple-500/40 text-purple-300" },
                  { code: "Block C", label: "Library", color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300" },
                  { code: "Block D", label: "Sports", color: "bg-green-500/20 border-green-500/40 text-green-300" },
                  { code: "Block E", label: "Admin", color: "bg-red-500/20 border-red-500/40 text-red-300" },
                  { code: "Canteen", label: "Food", color: "bg-orange-500/20 border-orange-500/40 text-orange-300" },
                  { code: "Zone A", label: "Bike Park", color: "bg-zinc-700/40 border-zinc-600 text-zinc-300" },
                  { code: "Zone B", label: "Car Park", color: "bg-zinc-700/40 border-zinc-600 text-zinc-300" },
                  { code: "H1 Boys", label: "Hostel", color: "bg-teal-500/20 border-teal-500/40 text-teal-300" },
                  { code: "H2 Girls", label: "Hostel", color: "bg-pink-500/20 border-pink-500/40 text-pink-300" },
                ].map((b) => (
                  <div key={b.code} className={`border rounded-xl p-3 text-center ${b.color} transition-all hover:scale-105 cursor-default`}>
                    <p className="font-bold text-sm">{b.code}</p>
                    <p className="text-xs opacity-75 mt-0.5">{b.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-zinc-500 text-xs mt-3 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Interactive map integration coming soon. Use the directory below to find any location.
              </p>
            </CardContent>
          </Card>

          {/* Location Directory */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-[#e78a53]" />
              Building Directory
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campusLocations.map((loc) => (
                <div key={loc.code} className={`border rounded-xl p-4 ${loc.color} bg-opacity-10`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white text-sm">{loc.name}</p>
                      <p className="text-xs opacity-75 mt-0.5">{loc.description}</p>
                    </div>
                    <Badge className="text-xs ml-2 shrink-0 bg-zinc-800/60 border-zinc-700 text-zinc-300">{loc.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs opacity-60">
                    <span>📍 {loc.code}</span>
                    <span>🏢 {loc.floor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-400" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {emergencyContacts.map((c) => (
                  <a key={c.label} href={`tel:${c.number}`} className="flex flex-col items-center p-4 bg-zinc-800/60 border border-zinc-700 rounded-xl hover:border-red-500/40 hover:bg-red-500/5 transition-all group text-center">
                    <Phone className="h-5 w-5 text-zinc-400 group-hover:text-red-400 mb-2 transition-colors" />
                    <p className="text-white font-semibold text-sm">{c.label}</p>
                    <p className="text-zinc-400 text-xs mt-1">{c.number}</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}