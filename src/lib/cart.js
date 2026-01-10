// Sample coupon codes
export const COUPON_CODES = {
  WELCOME10: {
    code: "WELCOME10",
    discount: 10,
    type: "percentage",
    minAmount: 500,
    maxDiscount: 200,
    isValid: true,
  },
  FLAT50: {
    code: "FLAT50",
    discount: 50,
    type: "fixed",
    minAmount: 299,
    isValid: true,
  },
  SAVE20: {
    code: "SAVE20",
    discount: 20,
    type: "percentage",
    minAmount: 1000,
    maxDiscount: 500,
    isValid: true,
  },
}

export const calculateCartTotal = (items, couponDiscount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 499 ? 0 : 40
  const tax = Math.round(subtotal * 0.18) // 18% GST
  const discount = couponDiscount
  const total = subtotal + shipping + tax - discount
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    items,
    subtotal,
    shipping,
    tax,
    discount,
    total: Math.max(0, total),
    itemCount,
  }
}

export const applyCoupon = (code, subtotal) => {
  const coupon = COUPON_CODES[code.toUpperCase()]
  if (!coupon || !coupon.isValid || subtotal < coupon.minAmount) {
    return 0
  }

  if (coupon.type === "percentage") {
    const discount = (subtotal * coupon.discount) / 100
    return coupon.maxDiscount ? Math.min(discount, coupon.maxDiscount) : discount
  } else {
    return coupon.discount
  }
}
