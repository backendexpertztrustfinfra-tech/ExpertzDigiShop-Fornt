"use client";

import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

const IMAGE_ROOT_URL = "http://localhost:5000";

const getFullImageUrl = (imagePath) => {
  if (imagePath && typeof imagePath === "string") {
    const cleaned = imagePath.replace(/\\/g, "/");
    const finalPath = cleaned.startsWith("uploads/")
      ? cleaned
      : `uploads/${cleaned}`;
    return `${IMAGE_ROOT_URL}/${finalPath.replace(/^\/+/, "")}`;
  }
  return "/placeholder.svg";
};

const CartPage = () => {
  const {
    items,
    subtotal,
    total,
    discount,
    shipping,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4 md:p-8">
      {/* HEADER */}
      <h1 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2 text-gray-900">
        <ShoppingCart className="h-7 w-7 text-orange-600" />
        My Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20">
          <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mt-1 mb-5">
            Add some products to continue shopping!
          </p>
          <Link to="/">
            <Button          className="
      w-full py-6 text-base 
      bg-gradient-to-r from-orange-500 to-yellow-500 
      text-white 
      rounded-xl 
      shadow-md hover:shadow-lg 
      transition
    ">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product?._id || item.productId}
                className="flex gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300"
              >
                {/* IMAGE */}
                <div className="h-28 w-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-inner">
                  <img
                    src={getFullImageUrl(item.product?.images?.[0])}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* DETAILS */}
                <div className="flex-1 flex flex-col justify-between">
                  <h3 className="font-semibold text-base md:text-lg text-gray-900 line-clamp-2">
                    {item.product?.name || item.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-orange-600 font-bold text-xl">
                      ₹{item.price || item.product?.price}
                    </span>

                    {item.product?.discount > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700 border border-green-300"
                      >
                        {item.product.discount}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* QUANTITY + REMOVE */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border rounded-full bg-gray-100 shadow-sm overflow-hidden">
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
                        className="px-3 py-2 hover:bg-gray-200 disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="px-4 py-2 font-semibold">
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
                        className="px-3 py-2 hover:bg-gray-200"
                      >
                        <Plus className="h-4 w-4" />
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
                      className="text-red-500 hover:text-red-700 transition p-2"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY BOX */}
          <div className="bg-white shadow-xl rounded-xl border border-gray-200 p-6 h-fit sticky top-20 space-y-4">
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              Order Summary
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-bold">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-orange-600">{formatPrice(total)}</span>
              </div>
            </div>
            <br />
            <Link to="/checkout" className="mt-4 block">
              <Button
                className="
      w-full py-6 text-base 
      bg-gradient-to-r from-orange-500 to-yellow-500 
      text-white 
      rounded-xl 
      shadow-md hover:shadow-lg 
      transition
    "
              >
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* MOBILE STICKY CHECKOUT BAR */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 flex justify-between items-center lg:hidden">
          <div>
            <p className="text-sm text-gray-600 font-medium">Total</p>
            <p className="text-xl font-bold text-orange-600">
              {formatPrice(total)}
            </p>
          </div>

          <Link to="/checkout" className="w-1/2">
            <Button className="w-full py-4 text-base bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-md">
              Checkout
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
