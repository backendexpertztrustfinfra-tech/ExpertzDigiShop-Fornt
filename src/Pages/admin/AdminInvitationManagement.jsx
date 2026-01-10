import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import "../../Styles/admin-invitation-management.css"

const AdminInvitationManagement = () => {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(false)
  const [showNewInviteForm, setShowNewInviteForm] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    department: "support",
  })

  useEffect(() => {
    fetchPendingInvitations()
  }, [])

  const fetchPendingInvitations = async () => {
    setLoading(true)
    try {
      const response = await axios.get("/api/admin-auth/pending-invitations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })

      if (response.data.success) {
        setInvitations(response.data.invitations)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load invitations")
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async (e) => {
    e.preventDefault()

    try {
      if (!formData.email.endsWith("@digishop.com")) {
        toast.error("Only company email addresses (@digishop.com) can be invited")
        return
      }

      const response = await axios.post("/api/admin-auth/invite", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      })

      if (response.data.success) {
        toast.success("Invitation sent successfully!")
        setFormData({ email: "", department: "support" })
        setShowNewInviteForm(false)
        fetchPendingInvitations()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation")
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: "#FFA500", label: "Pending" },
      verified: { color: "#4CAF50", label: "Verified" },
      accepted: { color: "#2196F3", label: "Accepted" },
      expired: { color: "#f44336", label: "Expired" },
      rejected: { color: "#666", label: "Rejected" },
    }
    const statusInfo = statusMap[status] || { color: "#999", label: status }
    return (
      <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="invitation-management">
      <div className="management-header">
        <h2>Admin Invitations</h2>
        <button className="btn-primary" onClick={() => setShowNewInviteForm(!showNewInviteForm)}>
          {showNewInviteForm ? "Cancel" : "Send New Invitation"}
        </button>
      </div>

      {showNewInviteForm && (
        <form onSubmit={handleSendInvite} className="invite-form-card">
          <h3>Send Admin Invitation</h3>

          <div className="form-group">
            <label>Company Email</label>
            <input
              type="email"
              placeholder="employee@digishop.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="support">Support</option>
              <option value="operations">Operations</option>
              <option value="analytics">Analytics</option>
              <option value="management">Management</option>
            </select>
          </div>

          <button type="submit" className="btn-primary">
            Send Invitation
          </button>
        </form>
      )}

      <div className="invitations-list">
        <h3>Pending Invitations ({invitations.length})</h3>

        {loading ? (
          <p className="loading">Loading invitations...</p>
        ) : invitations.length === 0 ? (
          <p className="no-invitations">No pending invitations</p>
        ) : (
          <table className="invitations-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Department</th>
                <th>Status</th>
                <th>Invited By</th>
                <th>Sent On</th>
                <th>Expires On</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invite) => (
                <tr key={invite._id}>
                  <td>{invite.email}</td>
                  <td>{invite.department}</td>
                  <td>{getStatusBadge(invite.invitationStatus)}</td>
                  <td>{invite.invitedBy?.name || "Unknown"}</td>
                  <td>{new Date(invite.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(invite.expiresAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminInvitationManagement
