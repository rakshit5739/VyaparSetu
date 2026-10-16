import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiFileText,
  FiMapPin,
  FiClock,
  FiDownload,
  FiSend,
  FiGrid,
  FiUsers,
  FiPackage,
  FiShield,
  FiDollarSign,
  FiArrowRight,
  FiXCircle,
  FiList,
  FiCheck,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/common/Spinner";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const isShopkeeper = user?.roles?.includes("shopkeeper") || user?.role === "shopkeeper";
  const isAdmin = user?.roles?.includes("admin") || user?.role === "admin";

  // Customer State
  const [purchaseRequests, setPurchaseRequests] = useState([]);

  // Shopkeeper State
  const [matchingRequests, setMatchingRequests] = useState([]);
  const [myQuotations, setMyQuotations] = useState([]);
  const [shopkeeperTab, setShopkeeperTab] = useState("incoming"); // "incoming" | "my-quotes"
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [quoteFormData, setQuoteFormData] = useState({
    estimatedPrice: "",
    message: "",
  });
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Admin State
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReqs, setAdminReqs] = useState([]);
  const [adminTab, setAdminTab] = useState("stats"); // stats | users | reqs

  const fetchCustomerData = async () => {
    try {
      const response = await api.get("/purchase-requests/my");
      if (response.data.success) {
        setPurchaseRequests(response.data.purchaseRequests || response.data.requirements || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load purchase requests.");
    }
  };

  const fetchShopkeeperData = async () => {
    try {
      const [matchingRes, quotesRes] = await Promise.all([
        api.get("/purchase-requests/matching"),
        api.get("/quotations/my"),
      ]);

      if (matchingRes.data.success) {
        setMatchingRequests(matchingRes.data.purchaseRequests || matchingRes.data.requirements || []);
      }
      if (quotesRes.data.success) {
        setMyQuotations(quotesRes.data.quotations || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shopkeeper request data.");
    }
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, reqsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/requirements"),
      ]);

      if (statsRes.data.success) setAdminStats(statsRes.data.stats);
      if (usersRes.data.success) setAdminUsers(usersRes.data.users);
      if (reqsRes.data.success) setAdminReqs(reqsRes.data.purchaseRequests || reqsRes.data.requirements || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load administrative analytics.");
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    if (isAdmin) {
      await fetchAdminData();
    } else if (isShopkeeper) {
      await fetchShopkeeperData();
    } else {
      await fetchCustomerData();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const handleCancelRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this purchase request?")) {
      return;
    }
    try {
      const response = await api.put(`/purchase-requests/${id}/cancel`);
      if (response.data.success) {
        toast.success("Purchase request cancelled successfully.");
        fetchCustomerData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel request.");
    }
  };

  // Submit Quotation Logic
  const openQuoteModal = (reqItem) => {
    setSelectedReq(reqItem);
    setQuoteFormData({ estimatedPrice: "", message: "" });
    setQuoteModalOpen(true);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const { estimatedPrice, message } = quoteFormData;

    if (!estimatedPrice || Number(estimatedPrice) <= 0) {
      toast.error("Please enter a valid estimated price.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please include a brief message or delivery details.");
      return;
    }

    setSubmittingQuote(true);
    try {
      const payload = {
        purchaseRequest: selectedReq._id,
        estimatedPrice: Number(estimatedPrice),
        message: message.trim(),
      };

      const response = await api.post("/quotations", payload);
      if (response.data.success) {
        toast.success("Quotation submitted successfully!");
        setQuoteModalOpen(false);
        fetchShopkeeperData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit quotation.");
    } finally {
      setSubmittingQuote(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  // --- ADMIN VIEW ---
  if (isAdmin) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="dashboard-header glass">
            <div>
              <span className="badge-role">System Administrator</span>
              <h2>Administrative Console</h2>
              <p>Platform metrics and data management</p>
            </div>
          </div>

          <div className="admin-tabs">
            <button
              className={`tab-btn ${adminTab === "stats" ? "active" : ""}`}
              onClick={() => setAdminTab("stats")}
            >
              <FiGrid /> Platform Stats
            </button>
            <button
              className={`tab-btn ${adminTab === "users" ? "active" : ""}`}
              onClick={() => setAdminTab("users")}
            >
              <FiUsers /> Registered Users ({adminUsers.length})
            </button>
            <button
              className={`tab-btn ${adminTab === "reqs" ? "active" : ""}`}
              onClick={() => setAdminTab("reqs")}
            >
              <FiFileText /> Purchase Requests ({adminReqs.length})
            </button>
          </div>

          {adminTab === "stats" && adminStats && (
            <div className="stats-grid">
              <div className="stat-card glass">
                <FiUsers className="stat-icon" />
                <h3>{adminStats.totalCustomers || 0}</h3>
                <p>Total Customers</p>
              </div>
              <div className="stat-card glass">
                <FiPackage className="stat-icon" />
                <h3>{adminStats.totalShopkeepers || 0}</h3>
                <p>Total Shopkeepers</p>
              </div>
              <div className="stat-card glass">
                <FiFileText className="stat-icon" />
                <h3>{adminStats.totalPurchaseRequests || adminStats.totalRequirements || 0}</h3>
                <p>Purchase Requests</p>
              </div>
              <div className="stat-card glass">
                <FiDollarSign className="stat-icon" />
                <h3>{adminStats.totalQuotations || 0}</h3>
                <p>Quotations Submitted</p>
              </div>
              <div className="stat-card glass">
                <FiCheck className="stat-icon" />
                <h3>{adminStats.totalOrders || 0}</h3>
                <p>Procurement Orders</p>
              </div>
            </div>
          )}

          {adminTab === "users" && (
            <div className="glass table-container" style={{ padding: "1.5rem", borderRadius: "12px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-glass)", textAlign: "left" }}>
                    <th style={{ padding: "12px" }}>Name</th>
                    <th style={{ padding: "12px" }}>Email</th>
                    <th style={{ padding: "12px" }}>Role</th>
                    <th style={{ padding: "12px" }}>City</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "12px" }}>{u.name}</td>
                      <td style={{ padding: "12px" }}>{u.email}</td>
                      <td style={{ padding: "12px" }}>{u.roles?.join(", ") || u.role}</td>
                      <td style={{ padding: "12px", textTransform: "capitalize" }}>{u.city || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminTab === "reqs" && (
            <div className="glass table-container" style={{ padding: "1.5rem", borderRadius: "12px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-glass)", textAlign: "left" }}>
                    <th style={{ padding: "12px" }}>Title</th>
                    <th style={{ padding: "12px" }}>Customer</th>
                    <th style={{ padding: "12px" }}>City</th>
                    <th style={{ padding: "12px" }}>Categories</th>
                    <th style={{ padding: "12px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminReqs.map((r) => (
                    <tr key={r._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "12px" }}>{r.title}</td>
                      <td style={{ padding: "12px" }}>{r.customer?.name || "Customer"}</td>
                      <td style={{ padding: "12px", textTransform: "capitalize" }}>{r.city}</td>
                      <td style={{ padding: "12px" }}>{r.categories?.join(", ") || r.category}</td>
                      <td style={{ padding: "12px" }}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- SHOPKEEPER VIEW ---
  if (isShopkeeper) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="dashboard-header glass">
            <div>
              <span className="badge-role">Shopkeeper Portal</span>
              <h2>Welcome, {user.name}</h2>
              <p>
                City: <strong style={{ textTransform: "capitalize" }}>{user.city}</strong> | Categories:{" "}
                <strong>{user.businessCategories?.join(", ") || "General"}</strong>
              </p>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Link to="/orders" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FiPackage /> View Orders
              </Link>
            </div>
          </div>

          {/* Shopkeeper Tab Switcher */}
          <div className="admin-tabs" style={{ marginBottom: "2rem" }}>
            <button
              className={`tab-btn ${shopkeeperTab === "incoming" ? "active" : ""}`}
              onClick={() => setShopkeeperTab("incoming")}
            >
              <FiFileText /> Matching Open Requests ({matchingRequests.length})
            </button>
            <button
              className={`tab-btn ${shopkeeperTab === "my-quotes" ? "active" : ""}`}
              onClick={() => setShopkeeperTab("my-quotes")}
            >
              <FiDollarSign /> My Submitted Quotations ({myQuotations.length})
            </button>
          </div>

          {shopkeeperTab === "incoming" && (
            <div>
              {matchingRequests.length === 0 ? (
                <div className="no-data glass" style={{ padding: "3rem", textAlign: "center" }}>
                  <p style={{ color: "var(--text-secondary)" }}>
                    No open purchase requests found matching your city ({user.city}) and categories at this time.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                  {matchingRequests.map((reqItem) => (
                    <div
                      key={reqItem._id}
                      className="glass"
                      style={{
                        padding: "1.8rem",
                        borderRadius: "14px",
                        border: "1px solid var(--border-glass)",
                        background: "var(--bg-surface)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <div style={{ display: "flex", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                            {(reqItem.categories || [reqItem.category]).map((c) => (
                              <span
                                key={c}
                                style={{
                                  fontSize: "0.75rem",
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  background: "rgba(59, 130, 246, 0.2)",
                                  color: "var(--primary)",
                                  fontWeight: "700",
                                }}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                          <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "6px" }}>
                            {reqItem.title}
                          </h3>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "12px" }}>
                            {reqItem.description}
                          </p>
                        </div>

                        <button
                          onClick={() => openQuoteModal(reqItem)}
                          className="btn-primary"
                          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
                        >
                          <FiSend /> Send Quotation
                        </button>
                      </div>

                      {/* Items List Preview */}
                      {reqItem.items && reqItem.items.length > 0 && (
                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", margin: "12px 0" }}>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontWeight: "600" }}>
                            Requested Materials:
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                            {reqItem.items.map((it, idx) => (
                              <span
                                key={idx}
                                style={{
                                  background: "rgba(255,255,255,0.06)",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {it.itemName}: <strong>{it.quantity} {it.unit}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Attachment Link */}
                      {reqItem.uploadedFile?.fileUrl && (
                        <div style={{ marginTop: "10px" }}>
                          <a
                            href={`http://localhost:8000${reqItem.uploadedFile.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "var(--accent-cyan)",
                              fontSize: "0.85rem",
                              textDecoration: "underline",
                            }}
                          >
                            <FiDownload /> View Customer's Attachment ({reqItem.uploadedFile.fileName || "Document"})
                          </a>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "20px", marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span>
                          <FiMapPin /> {reqItem.city}
                        </span>
                        <span>
                          <FiClock /> Deadline: {new Date(reqItem.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {shopkeeperTab === "my-quotes" && (
            <div>
              {myQuotations.length === 0 ? (
                <div className="no-data glass" style={{ padding: "3rem", textAlign: "center" }}>
                  <p style={{ color: "var(--text-secondary)" }}>You have not submitted any quotations yet.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  {myQuotations.map((quote) => (
                    <div
                      key={quote._id}
                      className="glass"
                      style={{
                        padding: "1.5rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border-glass)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "4px" }}>
                          {quote.purchaseRequest?.title || "Bulk Procurement Request"}
                        </h4>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                          Message: {quote.message}
                        </p>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          Submitted: {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--accent-emerald)", display: "block" }}>
                          ₹{Number(quote.estimatedPrice).toLocaleString()}
                        </span>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            marginTop: "4px",
                            background:
                              quote.status === "Accepted"
                                ? "rgba(16, 185, 129, 0.2)"
                                : quote.status === "Rejected"
                                ? "rgba(239, 68, 68, 0.2)"
                                : "rgba(245, 158, 11, 0.2)",
                            color:
                              quote.status === "Accepted"
                                ? "var(--accent-emerald)"
                                : quote.status === "Rejected"
                                ? "var(--accent-rose)"
                                : "var(--accent-amber)",
                          }}
                        >
                          Status: {quote.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quotation Submission Modal */}
          {quoteModalOpen && selectedReq && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
              }}
            >
              <div
                className="glass"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-glass)",
                  padding: "2.5rem",
                  borderRadius: "16px",
                  maxWidth: "540px",
                  width: "100%",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "8px" }}>
                  Submit Quotation
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  For: <strong>{selectedReq.title}</strong>
                </p>

                <form onSubmit={handleQuoteSubmit}>
                  <div className="form-group" style={{ marginBottom: "1.2rem" }}>
                    <label className="form-label">Total Estimated Price (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 45000"
                      min="1"
                      className="input-field"
                      value={quoteFormData.estimatedPrice}
                      onChange={(e) =>
                        setQuoteFormData({ ...quoteFormData, estimatedPrice: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                    <label className="form-label">Message / Delivery Terms *</label>
                    <textarea
                      rows="3"
                      placeholder="Specify material brands, delivery schedule, payment terms, etc."
                      className="input-field"
                      value={quoteFormData.message}
                      onChange={(e) =>
                        setQuoteFormData({ ...quoteFormData, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setQuoteModalOpen(false)}
                      disabled={submittingQuote}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={submittingQuote}>
                      {submittingQuote ? "Submitting..." : "Send Quotation"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- CUSTOMER VIEW ---
  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header glass">
          <div>
            <span className="badge-role">Customer Dashboard</span>
            <h2>Welcome, {user.name}</h2>
            <p>Track your bulk purchase requests, review quotations, and place orders directly with local stores.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link to="/requirements/upload" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FiPlus /> New Purchase Request
            </Link>
            <Link to="/orders" className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <FiPackage /> My Orders
            </Link>
          </div>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "1.5rem" }}>
            My Purchase Requests ({purchaseRequests.length})
          </h3>

          {purchaseRequests.length === 0 ? (
            <div className="no-data glass" style={{ padding: "4rem", textAlign: "center", background: "var(--bg-surface)" }}>
              <FiFileText style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                You have not submitted any bulk procurement requests yet.
              </p>
              <Link to="/requirements/upload" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <FiPlus /> Post Your First Request
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              {purchaseRequests.map((reqItem) => (
                <div
                  key={reqItem._id}
                  className="glass"
                  style={{
                    padding: "2rem",
                    borderRadius: "16px",
                    border: "1px solid var(--border-glass)",
                    background: "var(--bg-surface)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                        {(reqItem.categories || [reqItem.category]).map((c) => (
                          <span
                            key={c}
                            style={{
                              fontSize: "0.75rem",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: "rgba(59, 130, 246, 0.2)",
                              color: "var(--primary)",
                              fontWeight: "700",
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <h4 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "6px" }}>
                        {reqItem.title}
                      </h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "12px" }}>
                        {reqItem.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <Link
                        to={`/compare/${reqItem._id}`}
                        className="btn-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 18px" }}
                      >
                        <FiDollarSign /> Compare Quotations
                      </Link>
                      {["Pending", "Quoted"].includes(reqItem.status) && (
                        <button
                          onClick={() => handleCancelRequest(reqItem._id)}
                          style={{
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "var(--accent-rose)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <FiXCircle /> Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items Preview */}
                  {reqItem.items && reqItem.items.length > 0 && (
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", margin: "14px 0" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontWeight: "600" }}>
                        Items Required:
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {reqItem.items.map((it, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                            }}
                          >
                            {it.itemName}: <strong>{it.quantity} {it.unit}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachment Link */}
                  {reqItem.uploadedFile?.fileUrl && (
                    <div style={{ marginTop: "10px" }}>
                      <a
                        href={`http://localhost:8000${reqItem.uploadedFile.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "var(--accent-cyan)",
                          fontSize: "0.85rem",
                          textDecoration: "underline",
                        }}
                      >
                        <FiDownload /> Attached File ({reqItem.uploadedFile.fileName || "Download"})
                      </a>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "20px", marginTop: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <span>
                      <FiMapPin /> {reqItem.city}
                    </span>
                    <span>
                      <FiClock /> Deadline: {new Date(reqItem.deadline).toLocaleDateString()}
                    </span>
                    <span
                      style={{
                        color:
                          reqItem.status === "Accepted"
                            ? "var(--accent-emerald)"
                            : reqItem.status === "Cancelled"
                            ? "var(--accent-rose)"
                            : "var(--accent-amber)",
                        fontWeight: "700",
                      }}
                    >
                      Status: {reqItem.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
