"use client"

import React, { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Car, CheckCircle, Clock, Search, Shield, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { redirectIfNotAuthenticatedAdmin } from '@/lib/auth-middleware'

interface ParkingRequest {
  _id: string
  user: string
  role: string
  vehicle: string
  zone: string
  requestedSlot: string
  timeSlot: string
  status: string
}

interface ParkingSlot {
  zone: string
  total: number
  occupied: number
}

export default function AdminParkingPage() {
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [requests, setRequests] = useState<ParkingRequest[]>([])
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!redirectIfNotAuthenticatedAdmin()) {
      return
    }
    loadParkingData()
    setIsPageLoading(false)
  }, [])

  const loadParkingData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/admin/parking')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load parking data')
      }

      setRequests(data.requests || [])
      setSlots(data.slots || [])
    } catch (err: any) {
      setError(err.message || 'Failed to connect to parking service')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/admin/parking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update request')
      }

      toast.success(`Request ${status} successfully`)
      loadParkingData() // reload
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const filteredRequests = requests.filter(req => 
    req.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#e78a53]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Parking Management</h1>
              <p className="text-zinc-400 mt-2">Approve requests and monitor parking capacity</p>
            </div>
            <Badge className="bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]">
              <Shield className="h-4 w-4 mr-1" />
              Admin Control
            </Badge>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <Card key={slot.zone} className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{slot.zone}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{slot.occupied}/{slot.total}</p>
                  <p className="text-zinc-400 text-sm">Occupied Slots</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#e78a53]" />
                  Parking Requests
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="Search by user/vehicle..." 
                    className="w-64 bg-zinc-800/50 border-zinc-700 text-white" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    className="border-zinc-700 text-zinc-300"
                    onClick={loadParkingData}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
                    Search
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No parking requests found
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request._id} className="p-4 bg-zinc-800/40 rounded-lg flex items-center justify-between">
                    <div>
                    <p className="text-white font-medium">{request.user} <span className="text-zinc-500 text-sm">({request.role})</span></p>
                    <p className="text-zinc-400 text-sm">{request.vehicle} - {request.zone}</p>
                    <p className="text-zinc-500 text-xs">Slot: {request.requestedSlot} | Time: {request.timeSlot}</p>
                  </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        request.status === "approved" ? "bg-green-500/10 text-green-400 border-green-500/30" : 
                        request.status === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                        "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      }>
                        {request.status}
                      </Badge>
                      {request.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                            onClick={() => handleUpdateStatus(request._id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleUpdateStatus(request._id, 'rejected')}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                </div>
              ))
            )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
