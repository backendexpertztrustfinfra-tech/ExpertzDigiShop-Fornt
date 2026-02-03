

"use client"

import { useState, useEffect } from "react"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import api from "../../lib/api"
import { toast } from "react-toastify"
import "../../../src/Styles/admin-payment-management.css"

export default function AdminPaymentManagement() {
  const { userToken } = useContext(AuthContext)
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [transactionId, setTransactionId] = useState("")
  const [page, setPage] = useState(1)
  const [totalPending, setTotalPending] = useState(0)

  useEffect(() => {
    fetchPayouts()
  }, [page])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin-payment/payouts/pending?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${userToken}` },
      })

      setPayouts(response.data.data)
      setTotalPending(response.data.totalPendingAmount)
    } catch (error) {
      toast.error("Failed to fetch payouts")
    } finally {
      setLoading(false)
    }
  }

  const releasePayout = async (payoutId) => {
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID")
      return
    }

    try {
      await api.put(
        `/admin-payment/payouts/release/${payoutId}`,
        { transactionId },
        { headers: { Authorization: `Bearer ${userToken}` } },
      )

      toast.success("Payout released successfully")
      setSelectedPayout(null)
      setTransactionId("")
      fetchPayouts()
    } catch (error) {
      toast.error("Failed to release payout")
    }
  }

  return (
    <div className="admin-payment-container">
      <div className="payment-header">
        <h1>Payment & Settlement</h1>
        <p>Manage seller payouts and commissions</p>
        <div className="total-pending">
          <span className="label">Total Pending Payouts</span>
          <span className="amount">₹{totalPending.toLocaleString()}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading payouts...</div>
      ) : (
        <div className="payouts-table">
          <table>
            <thead>
              <tr>
                <th>Payout ID</th>
                <th>Seller</th>
                <th>Amount</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout._id}>
                  <td>{payout.payoutId}</td>
                  <td>{payout.seller?.name}</td>
                  <td>₹{payout.totalAmount}</td>
                  <td>₹{payout.commission}</td>
                  <td>
                    <span className="status-badge">{payout.status}</span>
                  </td>
                  <td>
                    <button className="btn-action" onClick={() => setSelectedPayout(payout)}>
                      Release
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPayout && (
        <div className="modal-overlay" onClick={() => setSelectedPayout(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedPayout(null)}>
              ×
            </button>

            <div className="payout-detail">
              <h2>Release Payout</h2>

              <div className="detail-section">
                <p>
                  <strong>Seller:</strong> {selectedPayout.seller?.name}
                </p>
                <p>
                  <strong>Payout Amount:</strong> ₹{selectedPayout.payoutAmount}
                </p>
                <p>
                  <strong>Bank Account:</strong> {selectedPayout.bankDetails?.accountNumber}
                </p>
              </div>

              <div className="form-group">
                <label>Transaction ID</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter bank transaction ID"
                />
              </div>

              <button className="btn-release" onClick={() => releasePayout(selectedPayout._id)}>
                Release Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}