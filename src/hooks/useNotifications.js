import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function useWishlist(userToken) {
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchWishlist = useCallback(
    async (signal) => {
      if (!userToken) {
        setWishlistCount(0);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/wishlist`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          signal,
        });

        if (!res.ok) {
          setWishlistCount(0);
          return;
        }

        const data = await res.json();
        const items = Array.isArray(data) ? data : data.items || [];
        setWishlistCount(items.length);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("useWishlist fetch error:", err);
        setWishlistCount(0);
      }
    },
    [userToken]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchWishlist(controller.signal);
    return () => controller.abort();
  }, [fetchWishlist]);

  useEffect(() => {
    const onUpdate = () => {
      const controller = new AbortController();
      fetchWishlist(controller.signal);
    };
    window.addEventListener("wishlistUpdated", onUpdate);
    return () => window.removeEventListener("wishlistUpdated", onUpdate);
  }, [fetchWishlist]);

  return { wishlistCount, fetchWishlist };
}
