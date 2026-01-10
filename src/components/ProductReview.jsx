"use client"

import { useState } from "react"
import { Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "react-toastify"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export default function ProductReview({ productId, userToken }) {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
    images: [],
  })

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error("[v0] Fetch reviews error:", error)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.comment) {
      toast.error("Please fill in all review fields")
      return
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("productId", productId)
      formDataToSend.append("rating", formData.rating)
      formDataToSend.append("title", formData.title)
      formDataToSend.append("comment", formData.comment)

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append("images", image)
        })
      }

      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        toast.success("Review submitted successfully!")
        setFormData({ rating: 5, title: "", comment: "", images: [] })
        setShowReviewForm(false)
        fetchReviews()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to submit review")
      }
    } catch (error) {
      toast.error("Error submitting review")
      console.error("[v0] Submit review error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })

      if (response.ok) {
        toast.success("Review deleted successfully!")
        fetchReviews()
      } else {
        toast.error("Failed to delete review")
      }
    } catch (error) {
      toast.error("Error deleting review")
      console.error("[v0] Delete review error:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? "Cancel" : "Write a Review"}
          </Button>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="border rounded-lg p-4 space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Review Title</Label>
                <Input
                  id="title"
                  placeholder="Summarize your review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="comment">Your Review</Label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this product"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review._id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.user?.profileImage || "/placeholder.svg"} />
                          <AvatarFallback>{review.user?.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{review.user?.name}</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="font-semibold mt-2">{review.title}</h4>
                    <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
