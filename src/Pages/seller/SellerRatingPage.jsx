import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Star, ArrowLeft, Users, MessageSquare } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const UPLOAD_BASE_URL = "http://localhost:5000"

export default function SellerRatingPage() {
    const navigate = useNavigate()
    const { userToken } = useAuth()
    const [analytics, setAnalytics] = useState({
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      reviews: [],
    })
    const [isLoading, setIsLoading] = useState(true)

    const fetchRatingData = useCallback(async () => {
        if (!userToken) {
            navigate("/login")
            return
        }
        try {
            const response = await fetch(`${API_BASE_URL}/sellers/analytics/ratings`, {
                headers: { Authorization: `Bearer ${userToken}` },
            })

            if (response.ok) {
                const data = await response.json()
                setAnalytics(data.analytics)
            } else {
                toast.error("Failed to load rating data.")
            }
        } catch (error) {
            console.error("[v0] Error fetching rating analytics:", error)
            toast.error("Error fetching rating analytics.")
        } finally {
            setIsLoading(false)
        }
    }, [userToken, navigate])

    useEffect(() => {
        fetchRatingData()
    }, [fetchRatingData])

    const getRatingPercentage = (stars) => {
      return analytics.totalReviews > 0 ? ((analytics.ratingDistribution[stars] / analytics.totalReviews) * 100).toFixed(1) : 0
    }

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
                        <Star className="h-7 w-7 text-yellow-600"/> Customer Feedback & Ratings
                    </h1>
                    <Button variant="outline" onClick={() => navigate("/seller/dashboard")}>
                        <ArrowLeft className="h-4 w-4 mr-2"/> Back to Dashboard
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Average Product Rating</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-4xl font-bold flex items-center gap-2 text-yellow-600">
                                {Number(analytics.averageRating).toFixed(1)}
                                <Star className="h-7 w-7 fill-yellow-500 text-yellow-500"/>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Overall score across all products.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Total Reviews</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="text-4xl font-bold text-gray-700">
                                {analytics.totalReviews}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Total feedback received.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rating Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="space-y-1">
                              {[5, 4, 3, 2, 1].map((stars) => (
                                <div key={stars} className="flex justify-between text-sm">
                                  <span>{stars}★ ({analytics.ratingDistribution[stars]})</span>
                                  <span className="text-yellow-600 font-medium">{getRatingPercentage(stars)}%</span>
                                </div>
                              ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6"/> Recent Customer Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.reviews.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No reviews yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {analytics.reviews.slice(0, 20).map((review) => (
                            <div key={review._id} className="pb-4 border-b last:border-b-0">
                              <div className="flex items-center gap-3 mb-2">
                                {review.user?.profileImage ? (
                                  <img
                                    src={`${UPLOAD_BASE_URL}/${review.user.profileImage.replace(/\\/g, "/")}`}
                                    alt={review.user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-sm font-bold">
                                    {review.user?.name?.[0] || "U"}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{review.user?.name || "Anonymous"}</p>
                                  <p className="text-xs text-gray-500">Reviewed: {review.productName}</p>
                                </div>
                                <Badge variant="outline" className="bg-yellow-50">
                                  {review.rating}★
                                </Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">{review.title}</p>
                              <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
