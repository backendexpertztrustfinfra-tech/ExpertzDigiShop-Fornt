"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle2, AlertCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "react-router-dom"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function NotificationBell({ userToken }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userToken])

  const fetchNotifications = async () => {
    if (!userToken) return
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("[v0] Error fetching notifications:", error)
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
      console.error("[v0] Error marking notification as read:", error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "return":
      case "exchange":
        return <Package className="h-5 w-5 text-blue-600" />
      case "approval":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "rejection":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id)
    if (notification.orderId) {
      navigate(`/profile/orders/${notification.orderId}`)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Button variant="ghost" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs bg-red-600">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white shadow-lg border rounded-lg z-50">
          <div className="p-4 border-b flex justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto opacity-50 mb-2" />
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    n.isRead ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <div className="flex gap-3">
                    {getNotificationIcon(n.type)}
                    <div>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-muted-foreground text-xs">{n.message}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                navigate("/notifications")
                setIsOpen(false)
              }}
            >
              View All Notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
