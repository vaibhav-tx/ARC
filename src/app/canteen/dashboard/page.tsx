"use client"

import { useState, useEffect } from "react"
import { ArcChatbot } from "@/components/arc-chatbot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CanteenDemandCard } from "@/components/canteen-demand-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CanteenSidebar } from "@/components/canteen-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  IndianRupee,
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Bell
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CanteenDashboard() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  useEffect(() => {
    try {
      const u = localStorage.getItem("currentUser")
      if (u) setCurrentUser(JSON.parse(u))
    } catch {}
  }, [])
  const userId = currentUser?.id ?? null
  const userName = currentUser?.name ?? ""
  const isDummyUser = currentUser?.email === "sanjay.canteen@campus.in"

  const [todaysStats, setTodaysStats] = useState({ revenue: 0, orders: 0, customers: 0, avgOrderValue: 0 })
  const [weeklyStats, setWeeklyStats] = useState({ revenue: 0, orders: 0, customers: 0, avgOrderValue: 0 })
  const [monthlyStats, setMonthlyStats] = useState({ revenue: 0, orders: 0, customers: 0, avgOrderValue: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [lowStockItems, setLowStockItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchDashboardData()
    }
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const [ordersRes, stocksRes] = await Promise.all([
        fetch(`/api/orders?canteenId=${userId}&limit=10`),
        fetch(`/api/canteen/stocks?canteenId=${userId}&status=critical`)
      ])
      
      if (!ordersRes.ok || !stocksRes.ok) throw new Error("Failed to fetch dashboard data")
      
      const ordersData = await ordersRes.json()
      const stocksData = await stocksRes.json()

      const orders = ordersData.data || []
      
      // Calculate basic stats for today
      const today = new Date().setHours(0, 0, 0, 0)
      const todayOrders = orders.filter((o: any) => new Date(o.orderDate).setHours(0, 0, 0, 0) === today)
      
      const todayRevenue = todayOrders.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0)
      setTodaysStats({
        revenue: todayRevenue,
        orders: todayOrders.length,
        customers: new Set(todayOrders.map((o: any) => o.customerId)).size,
        avgOrderValue: todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0
      })
      
      setRecentOrders(orders.slice(0, 5).map((o: any) => ({
        id: o.orderId,
        customer: o.customerName,
        amount: o.totalAmount,
        status: o.status,
        time: "Just now", // Demo simplified
        items: o.items.map((i: any) => i.name)
      })))

      setLowStockItems(stocksData.data || [])
      setError(null)
    } catch (err) {
      console.error(err)
      setError("Failed to load live data. The backend might be unreachable.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]",
      preparing: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      cancelled: "bg-red-500/10 border-red-500/30 text-red-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getStockStatusColor = (status: string) => {
    const colors = {
      critical: "bg-red-500/10 border-red-500/30 text-red-400",
      low: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      good: "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  return (
    <div className="min-h-screen bg-black flex">
      <CanteenSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Canteen Dashboard</h1>
                <p className="text-zinc-400">Monitor sales, orders, and inventory in real-time</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/50 text-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Today's Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Today's Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <IndianRupee className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">₹{todaysStats.revenue.toLocaleString()}</p>
                      <p className="text-zinc-400 text-sm">Today's Revenue</p>
                      <div className="flex items-center gap-1 text-[#e78a53] text-xs mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>{isDummyUser ? "+12.5%" : "0%"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <ShoppingCart className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{todaysStats.orders}</p>
                      <p className="text-zinc-400 text-sm">Orders Today</p>
                      <div className="flex items-center gap-1 text-[#e78a53] text-xs mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>{isDummyUser ? "+8.2%" : "0%"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <Users className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{todaysStats.customers}</p>
                      <p className="text-zinc-400 text-sm">Unique Customers</p>
                      <div className="flex items-center gap-1 text-[#e78a53] text-xs mt-1">
                        <ArrowUp className="h-3 w-3" />
                        <span>{isDummyUser ? "+5.7%" : "0%"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">₹{todaysStats.avgOrderValue}</p>
                      <p className="text-zinc-400 text-sm">Avg Order Value</p>
                      <div className={`flex items-center gap-1 text-xs mt-1 ${isDummyUser ? "text-red-400" : "text-zinc-400"}`}>
                        {isDummyUser ? <ArrowDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        <span>{isDummyUser ? "-2.1%" : "0%"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Period Comparison */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Revenue</span>
                      <span className="text-white font-semibold">₹{weeklyStats.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Orders</span>
                      <span className="text-white font-semibold">{weeklyStats.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Customers</span>
                      <span className="text-white font-semibold">{weeklyStats.customers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Avg Order</span>
                      <span className="text-white font-semibold">₹{weeklyStats.avgOrderValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Revenue</span>
                      <span className="text-white font-semibold">₹{monthlyStats.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Orders</span>
                      <span className="text-white font-semibold">{monthlyStats.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Customers</span>
                      <span className="text-white font-semibold">{monthlyStats.customers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Avg Order</span>
                      <span className="text-white font-semibold">₹{monthlyStats.avgOrderValue}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full bg-[#e78a53] hover:bg-[#e78a53]/90">
                      <Package className="h-4 w-4 mr-2" />
                      Check Inventory
                    </Button>
                    <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                      <Clock className="h-4 w-4 mr-2" />
                      View Active Orders
                    </Button>
                    <Button variant="outline" className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      Daily Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="p-4 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">{order.id}</p>
                            <p className="text-zinc-400 text-sm">{order.customer}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-zinc-300 text-sm">
                              {order.items.join(", ")}
                            </p>
                            <p className="text-zinc-500 text-xs">{order.time}</p>
                          </div>
                          <p className="text-[#e78a53] font-semibold">₹{order.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400">No recent orders</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockItems.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockItems.map((item, index) => (
                      <div key={index} className="p-4 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-zinc-400 text-sm">Current: {item.current}</p>
                          </div>
                          <Badge className={getStockStatusColor(item.status)}>
                            {item.status === 'critical' ? (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            ) : (
                              <Package className="h-3 w-3 mr-1" />
                            )}
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-zinc-500 text-sm">Minimum: {item.minimum}</p>
                          <Button size="sm" className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                            Re-stock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400">All stock levels look good!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Demand Forecast */}
            <CanteenDemandCard
              orders={recentOrders.flatMap((o) =>
                o.items.map((item) => ({ item, quantity: 1, time: "12:00" }))
              )}
            />
          </div>
        </div>
      </main>
      <ArcChatbot userRole="canteen" />
    </div>
  )
}
