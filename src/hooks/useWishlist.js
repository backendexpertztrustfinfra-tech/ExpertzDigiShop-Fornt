"use client"

import { useState, useCallback, useEffect } from "react"
import { wishlistAPI } from "../lib/api"
import { toast } from "react-toastify"
import { useAuth } from "../context/AuthContext"

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState({ items: [] }) // keep object shape
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    } else {
      setWishlist({ items: [] })
    }
  }, [isAuthenticated])

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist({ items: [] })
      return
    }

    setIsLoading(true)
    try {
      const response = await wishlistAPI.getWishlist()
      // handle success shape: response.wishlist or response.data
      if (response && response.success && response.wishlist) {
        setWishlist(response.wishlist)
      } else if (response && response.wishlist) {
        setWishlist(response.wishlist)
      } else {
        // fallback if API returns items directly
        setWishlist({ items: response.items || [] })
      }
    } catch (error) {
      console.error("[v0] Error fetching wishlist:", error.message || error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const addToWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        toast.error("Please login to save items")
        return
      }

      try {
        const response = await wishlistAPI.addToWishlist(productId)
        if (response && response.success && response.wishlist) {
          setWishlist(response.wishlist)
          toast.success("Added to wishlist!")
        }
      } catch (error) {
        console.error("[v0] Error adding to wishlist:", error.message || error)
        toast.error("Failed to add to wishlist")
      }
    },
    [isAuthenticated],
  )

  const removeFromWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        return
      }

      try {
        const response = await wishlistAPI.removeFromWishlist(productId)
        if (response && response.success && response.wishlist) {
          setWishlist(response.wishlist)
          toast.success("Removed from wishlist")
        }
      } catch (error) {
        console.error("[v0] Error removing from wishlist:", error.message || error)
        toast.error("Failed to remove from wishlist")
      }
    },
    [isAuthenticated],
  )

  const isInWishlist = useCallback(
    (productId) => {
      const items = wishlist?.items || []
      return items.some((item) => {
        const itemId = item.product?._id || item.product
        return itemId === productId
      })
    },
    [wishlist],
  )

  return {
    wishlist,
    isLoading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }
}
