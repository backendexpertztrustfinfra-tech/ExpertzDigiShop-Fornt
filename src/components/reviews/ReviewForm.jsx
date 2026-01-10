import { useState } from "react"
import { Star, Camera, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ReviewForm({ productId, productName, productImage, onSubmit, onCancel, canReview = true, reviewMessage = "" }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [images, setImages] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canReview) return
    
    onSubmit({
      productId,
      rating,
      title,
      comment,
      images,
    })
  }

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            disabled={!canReview}
            onMouseEnter={() => canReview && setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => canReview && setRating(star)}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              } ${!canReview ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        {!canReview && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">{reviewMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="relative h-16 w-16 rounded overflow-hidden">
              <img
                src={productImage || "/placeholder.svg"}
                alt={productName}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-medium">{productName}</h3>
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label className="text-base font-medium">Overall Rating *</Label>
            <div className="mt-2">
              {renderStars()}
              <p className="text-sm text-gray-500 mt-1">
                {!canReview && "You must purchase this product to review"}
                {canReview && rating === 0 && "Click to rate"}
                {canReview && rating === 1 && "Poor"}
                {canReview && rating === 2 && "Fair"}
                {canReview && rating === 3 && "Good"}
                {canReview && rating === 4 && "Very Good"}
                {canReview && rating === 5 && "Excellent"}
              </p>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              disabled={!canReview}
              required
            />
          </div>

          {/* Review Comment */}
          <div>
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this product..."
              rows={5}
              disabled={!canReview}
              required
            />
            <p className="text-sm text-gray-500 mt-1">Minimum 10 characters ({comment.length}/10)</p>
          </div>

          {/* Photo Upload */}
          <div>
            <Label>Add Photos (Optional)</Label>
            <div className="mt-2">
              <div className={`border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ${!canReview ? "opacity-50" : ""}`}>
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Add photos to help others see what you received
                </p>
                <Button type="button" variant="outline" size="sm" disabled={!canReview}>
                  Choose Photos
                </Button>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <div className="relative h-20 w-20 rounded overflow-hidden border">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Review image ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        disabled={!canReview}
                        onClick={() => canReview && setImages(images.filter((_, i) => i !== index))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!canReview || rating === 0 || title.length === 0 || comment.length < 10}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
