/**
 * Product Form Utilities
 * Helper functions for product form validation and data processing
 */

export const validateProductForm = (formData, currentStep) => {
  const requirements = {
    0: {
      fields: ["name", "description", "category", "brand"],
      messages: {
        name: "Product name is required",
        description: "Product description is required",
        category: "Product category is required",
        brand: "Brand name is required",
      },
    },
    1: {
      fields: ["size", "color", "material"],
      messages: {
        size: "Size is required",
        color: "Color is required",
        material: "Material is required",
      },
    },
    2: {
      fields: ["price", "stock"],
      messages: {
        price: "Price is required and must be greater than 0",
        stock: "Stock quantity is required",
      },
    },
    3: {
      fields: ["weight"],
      messages: {
        weight: "Weight is required",
      },
    },
    4: {
      fields: ["manufacturerName"],
      messages: {
        manufacturerName: "Manufacturer name is required",
      },
    },
    5: {
      fields: [],
      messages: {},
    },
  }

  const stepRequirements = requirements[currentStep] || { fields: [], messages: {} }
  const errors = []

  stepRequirements.fields.forEach((field) => {
    const value = formData[field]
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.push(stepRequirements.messages[field] || `${field} is required`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const calculateDiscount = (originalPrice, sellingPrice) => {
  if (!originalPrice || !sellingPrice) return 0
  const discount = ((originalPrice - sellingPrice) / originalPrice) * 100
  return Math.round(discount)
}

export const formatProductData = (formData, images) => {
  const payload = new FormData()

  // Add text fields
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      payload.append(key, value)
    }
  })

  // Add images
  if (images.main && images.main.length > 0) {
    images.main.forEach((file) => {
      payload.append("images", file)
    })
  }

  // Add view-specific images
  const viewImages = ["front", "back", "side", "top"]
  viewImages.forEach((view) => {
    if (images[view]) {
      payload.append(`${view}ViewImage`, images[view])
    }
  })

  return payload
}

export const getSizeOptions = () => ["XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size"]

export const getMaterialOptions = () => [
  "Cotton",
  "Polyester",
  "Silk",
  "Wool",
  "Leather",
  "Denim",
  "Linen",
  "Synthetic",
  "Blended",
  "Rayon",
  "Lycra",
]

export const getClosureTypes = () => [
  "Snap",
  "Zipper",
  "Button",
  "Velcro",
  "Drawstring",
  "Magnetic",
  "Hook & Eye",
  "None",
]

export const getCategoryOptions = () => [
  "Fashion",
  "Electronics",
  "Toys",
  "Kids",
  "Beauty",
  "Sports",
  "Books",
  "Accessories",
  "Automotive",
]

export const getGSTRates = () => [
  { value: "0", label: "0% (Exempted)" },
  { value: "5", label: "5%" },
  { value: "12", label: "12%" },
  { value: "18", label: "18% (Standard)" },
  { value: "28", label: "28%" },
]

export const validatePrice = (price, originalPrice) => {
  const p = Number(price)
  const op = Number(originalPrice)

  if (isNaN(p) || p <= 0) return "Price must be greater than 0"
  if (op && op < p) return "Original price must be greater than selling price"
  return null
}

export const validateImages = (images) => {
  if (!images.main || images.main.length === 0) {
    return "Please upload at least one product image"
  }
  if (images.main.length > 5) {
    return "Maximum 5 images allowed"
  }
  return null
}

export const getImagePreview = (file) => {
  if (!file) return null
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file
}

export const formatPrice = (price) => {
  if (!price) return "₹0"
  return `₹${Number(price).toLocaleString("en-IN")}`
}

export const calculateGST = (price, gstRate) => {
  const rate = Number(gstRate) || 0
  return (Number(price) * rate) / 100
}

export const calculateFinalPrice = (price, discount, gst) => {
  const basePrice = Number(price) || 0
  const discountAmount = (basePrice * (Number(discount) || 0)) / 100
  const discountedPrice = basePrice - discountAmount
  const gstAmount = (discountedPrice * (Number(gst) || 0)) / 100
  return discountedPrice + gstAmount
}
