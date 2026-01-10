import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);

  // ✅ Handle refresh - redirect if no order in state
  useEffect(() => {
    if (!order) {
      const storedOrder = sessionStorage.getItem("latestOrder");
      if (storedOrder) {
        setOrder(JSON.parse(storedOrder));
      } else {
        navigate("/products");
      }
    }
  }, [order, navigate]);

  // ✅ Save order to sessionStorage for reload persistence
  useEffect(() => {
    if (order) {
      sessionStorage.setItem("latestOrder", JSON.stringify(order));
    }
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#FAD0C4]">
          <CardContent className="p-8 text-center">
            <h2 className="text-lg font-black uppercase tracking-tighter italic mb-4">Order not detected</h2>
            <Link to="/products">
              <Button className="w-full bg-[#FF4E50] hover:bg-[#E75480] text-white rounded-full font-bold uppercase tracking-widest text-[10px]">
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deliveryDate = order?.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-[#FF4E50] selection:text-white">
      <Card className="w-full max-w-2xl shadow-2xl border-[#FAD0C4]/30 rounded-[2.5rem] overflow-hidden bg-white">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto w-20 h-20 bg-[#FFF5F7] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <CheckCircle className="h-10 w-10 text-[#FF4E50]" />
          </div>
          <CardTitle className="text-3xl text-[#333] font-black uppercase tracking-tighter italic">
            Order <span className="text-[#FF4E50]">Secured!</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* ✅ Order Info Box */}
          <div className="text-center p-6 bg-[#FFF9F0] rounded-2xl border border-[#FFD700]/20">
            <p className="text-[#E75480] font-black uppercase tracking-[0.2em] text-[10px] mb-2">Thank you for your purchase!</p>
            <p className="text-sm font-bold text-[#333]">
              Archive ID:{" "}
              <span className="font-mono font-black text-[#FF4E50] tracking-widest uppercase">
                {order.orderNumber || order._id}
              </span>
            </p>
            {order.totalAmount && (
              <p className="text-3xl font-black text-[#FF4E50] mt-4 tracking-tighter italic">
                {formatPrice(order.totalAmount)}
              </p>
            )}
          </div>

          {/* ✅ Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-[#FFF5F7] rounded-2xl border border-[#FAD0C4]/20">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                 <Package className="h-5 w-5 text-[#E75480]" />
              </div>
              <div>
                <div className="font-black text-xs uppercase tracking-tight text-[#333]">Confirmed</div>
                <div className="text-[10px] font-bold text-[#E75480]/60 uppercase leading-tight">
                  Preparing for shipment
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#FFF9F0] rounded-2xl border border-[#FFD700]/20">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                 <Truck className="h-5 w-5 text-[#FFB800]" />
              </div>
              <div>
                <div className="font-black text-xs uppercase tracking-tight text-[#333]">
                  Arrival Node
                </div>
                <div className="text-[10px] font-bold text-[#FFB800] uppercase italic">{deliveryDate}</div>
              </div>
            </div>
          </div>

          {/* ✅ Ordered Items List */}
          {order.items && order.items.length > 0 && (
            <div className="border border-zinc-100 rounded-2xl p-6 bg-zinc-50/50 shadow-inner">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 italic">Registry Manifest</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs border-b border-zinc-100 pb-2 last:border-none"
                  >
                    <span className="text-zinc-600 font-bold uppercase tracking-tight">
                      {item.product?.name || "Product"} <span className="text-[#FF4E50] ml-1">× {item.quantity}</span>
                    </span>
                    <span className="font-black text-[#333] italic">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/profile/orders" className="flex-1">
              <Button className="w-full h-14 bg-zinc-950 hover:bg-[#FF4E50] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl transition-all active:scale-95">
                Track Shipment
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-14 border-[#FAD0C4] text-[#E75480] hover:bg-[#FFF5F7] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Gallery
              </Button>
            </Link>
          </div>

          {/* ✅ Footer Note */}
          <div className="text-center pt-4">
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
              Digital receipt dispatched to your communication node.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}