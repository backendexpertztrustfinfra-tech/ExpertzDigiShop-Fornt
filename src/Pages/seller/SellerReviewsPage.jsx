import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { Star, Search, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function SellerReviewsPage() {
  const { userToken, user } = useAuth()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,
  })

  useEffect(() => {
    if (!user?.isSeller) {
      navigate("/seller/setup")
      return
    }
    fetchSellerReviews()
  }, [userToken, user, navigate])

  const fetchSellerReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/reviews/seller`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })

      const data = await response.json()
      if (data.success) {
        setReviews(data.reviews || [])
        setStats(data.stats || stats)
      } else {
        toast.error(data.message || "Failed to load reviews")
      }
    } catch (error) {
      console.error("[v0] Error fetching reviews:", error)
      toast.error("Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review? This will remove it from your product.")) return

    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      })

      if (response.ok) {
        setReviews(reviews.filter((r) => r._id !== reviewId))
        toast.success("Review deleted")
        fetchSellerReviews()
      } else {
        toast.error("Failed to delete review")
      }
    } catch (error) {
      toast.error("Failed to delete review")
    }
  }

  const filteredReviews = reviews.filter((review) => {
    if (filterRating !== "all" && review.rating !== Number.parseInt(filterRating)) return false
    if (searchTerm && !review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/seller/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Product Reviews</h1>
            <p className="text-muted-foreground">Manage and track customer reviews</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{stats.avgRating || "0"}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(stats.avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalReviews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">5 Star Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.fiveStarCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">1 Star Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.oneStarCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Customer Reviews</CardTitle>
              <div className="flex gap-2 flex-col md:flex-row">
                <div className="relative flex-1 md:flex-none">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Search by product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
                  />
                </div>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  className="px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredReviews.length > 0 ? (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review._id} className="border border-border rounded-lg p-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{review.product?.name || "Product"}</p>
                        <p className="text-sm text-muted-foreground">By: {review.user?.name || "Anonymous"}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.rating}/5</span>
                    </div>

                    <h4 className="font-semibold text-sm mb-1">{review.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reviews found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
