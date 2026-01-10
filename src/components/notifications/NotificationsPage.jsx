"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Trash2, CheckCircle2, AlertCircle, Package, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { userToken } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!userToken) {
      navigate("/login")
      return
    }
    fetchNotifications()
  }, [userToken, navigate])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching notifications:", error)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userToken}` },
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      toast.error("Failed to update notification")
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      })

      if (response.ok) {
        toast.success("Notification deleted")
        fetchNotifications()
      }
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "return":
      case "exchange":
        return <Package className="h-6 w-6 text-blue-600" />
      case "approval":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />
      case "rejection":
        return <AlertCircle className="h-6 w-6 text-red-600" />
      default:
        return <Bell className="h-6 w-6" />
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead
    if (filter === "returns") return ["return", "exchange", "approval", "rejection"].includes(n.type)
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with your orders</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "unread" ? "default" : "outline"} onClick={() => setFilter("unread")}>
            Unread
          </Button>
          <Button variant={filter === "returns" ? "default" : "outline"} onClick={() => setFilter("returns")}>
            Returns & Exchanges
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full mx-auto mb-2"></div>
              <p>Loading notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card key={notification._id} className={notification.isRead ? "" : "border-l-4 border-l-blue-600"}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{notification.title}</h3>
                          <p className="text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        {!notification.isRead && <Badge className="bg-blue-600">New</Badge>}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button size="sm" variant="outline" onClick={() => markAsRead(notification._id)}>
                              Mark as Read
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
