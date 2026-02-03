"use client"

import { useState } from "react"
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/useCart"
import { applyCoupon } from "@/lib/cart"
import { formatPrice } from "@/lib/utils"
import { Link } from "react-router-dom"

const IMAGE_ROOT_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace("/api", "") 
  : "http://localhost:5000";

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("http")) return imagePath;
  let cleaned = imagePath.replace(/\\/g, "/");
  if (!cleaned.startsWith("uploads/")) {
    cleaned = `uploads/${cleaned.replace(/^\/+/, "")}`;
  }
  return `${IMAGE_ROOT_URL.replace(/\/+$/, "")}/${cleaned}`;
};
const CartDrawer = ({ isOpen, onClose }) => {
  const {
    items,
    total,
    subtotal,
    discount: currentDiscount,
    shipping,
    tax,
    itemCount,
    removeItem,
    updateQuantity,
  } = useCart()

  const [couponCode, setCouponCode] = useState("")
  const [couponError, setCouponError] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const handleApplyCoupon = () => {
    setCouponError("")
    const discount = applyCoupon(couponCode, subtotal)
    if (discount > 0) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount })
      setCouponCode("")
    } else {
      setCouponError("Invalid coupon code")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[999] flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto h-full w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-left rounded-l-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Your Cart</h2>
            {itemCount > 0 && <Badge>{itemCount}</Badge>}
          </div>
          <Button variant="ghost" onClick={onClose} size="sm">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full p-10">
              <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="font-semibold text-lg">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mb-2">Start adding items!</p>
              <Button className="w-full mt-3" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product?._id || item.productId}
                className="flex gap-4 p-3 rounded-lg border shadow-sm bg-gray-50 hover:bg-gray-100 transition"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.product?._id || item.productId}`}
                  onClick={onClose}
                  className="h-20 w-20 rounded-md overflow-hidden bg-gray-200"
                >
                  <img
                    src={getFullImageUrl(item.product?.images?.[0])}
                    className="h-full w-full object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <Link
                    to={`/product/${item.product?._id || item.productId}`}
                    onClick={onClose}
                    className="font-medium text-sm line-clamp-2"
                  >
                    {item.product?.name || item.name}
                  </Link>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary">
                      ₹{item.price || item.product?.price}
                    </span>
                    {item.product?.discount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.product.discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                      <button
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(
                            item.product?._id || item.productId,
                            item.quantity - 1,
                            item.size,
                            item.color
                          )
                        }
                        className="px-2 py-1 hover:bg-gray-200 disabled:bg-gray-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>

                      <span className="px-3 font-semibold text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product?._id || item.productId,
                            item.quantity + 1,
                            item.size,
                            item.color
                          )
                        }
                        className="px-2 py-1 hover:bg-gray-200"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        removeItem(
                          item.product?._id || item.productId,
                          item.size,
                          item.color
                        )
                      }
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t bg-white shadow-inner space-y-4">

            {/* Summary */}
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Buttons */}
            <div className="space-y-2">
              <Link to="/cart" onClick={onClose}>
                <Button className="w-full">View Cart</Button>
              </Link>

              <Link to="/checkout" onClick={onClose}>
                <Button variant="outline" className="w-full">
                  Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartDrawer
