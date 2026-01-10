import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { TrendingUp, ArrowLeft, LineChartIcon, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", }).format(price)
}

const generateChartData = (monthlyRevenue) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = date.toISOString().slice(0, 7)
        const month = months[date.getMonth()]
        data.push({
            month,
            revenue: monthlyRevenue[key] || 0,
        })
    }
    return data
}

const exportRevenueData = (chartData, totalRevenue) => {
    if (!chartData || chartData.length === 0) {
        toast.warning("No data available to export")
        return
    }

    let csvContent = "Month,Revenue\n"
    chartData.forEach(item => {
        csvContent += `${item.month},${item.revenue}\n`
    })
    csvContent += `\nTotal Lifetime Revenue,${totalRevenue}`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    toast.success("Revenue data exported successfully")
}

export default function SellerRevenuePage() {
    const navigate = useNavigate()
    const { userToken } = useAuth()
    const [totalRevenue, setTotalRevenue] = useState(0)
    const [chartData, setChartData] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchRevenueData = useCallback(async () => {
        if (!userToken) {
            navigate("/login")
            return
        }
        try {
            const response = await fetch(`${API_BASE_URL}/sellers/dashboard`, {
                headers: { Authorization: `Bearer ${userToken}` },
            })

            if (response.ok) {
                const data = await response.json()
                const dashboard = data.dashboard || {}
                setTotalRevenue(dashboard.totalRevenue || 0)
                if (dashboard.monthlyRevenue) {
                    setChartData(generateChartData(dashboard.monthlyRevenue))
                }
            } else {
                toast.error("Failed to load revenue data.")
            }
        } catch (error) {
            console.error("[v0] Error fetching revenue:", error)
            toast.error("Error fetching revenue analytics.")
        } finally {
            setIsLoading(false)
        }
    }, [userToken, navigate])

    useEffect(() => {
        fetchRevenueData()
    }, [fetchRevenueData])


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <TrendingUp className="h-7 w-7 text-green-600"/> Revenue Management
                    </h1>
                    <Button variant="outline" onClick={() => navigate("/seller/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2"/> Back to Dashboard
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Total Lifetime Revenue</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-4xl font-bold text-green-600">
                                {formatPrice(totalRevenue)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">All-time sales before commissions.</p>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                         <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Sales Trend (Last 12 Months)
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => exportRevenueData(chartData, totalRevenue)}
                                >
                                    <Download className="h-4 w-4 mr-2"/> Export Data
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value) => formatPrice(value).split('.')[0]}/>
                                        <Tooltip formatter={(value) => [formatPrice(value)]}/>
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-muted-foreground text-center py-12">No detailed monthly revenue data available.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
