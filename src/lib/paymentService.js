const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const initiateRazorpayPayment = async (amount, orderData, userToken) => {
  const isScriptLoaded = await loadRazorpayScript()
  if (!isScriptLoaded) {
    throw new Error("Failed to load Razorpay")
  }

  try {
    // Create Razorpay order
    const response = await fetch(`${API_BASE_URL}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ amount, orderData }),
    })

    const orderRes = await response.json()
    if (!orderRes.success) {
      throw new Error(orderRes.message || "Failed to create Razorpay order")
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "DigiShop",
        description: "Order Payment",
        order_id: orderRes.id,
        prefill: {
          name: orderRes.userDetails?.name,
          email: orderRes.userDetails?.email,
          contact: orderRes.userDetails?.contact,
        },
        handler: async (paymentResponse) => {
          try {
            // Verify payment
            const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
              },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                orderData,
              }),
            })

            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              resolve(verifyData)
            } else {
              reject(new Error(verifyData.message || "Payment verification failed"))
            }
          } catch (error) {
            reject(error)
          }
        },
        theme: { color: "#7c3aed" },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      razorpay.on("payment.failed", (error) => {
        reject(new Error(error.error.description || "Payment failed"))
      })
    })
  } catch (error) {
    throw error
  }
}
