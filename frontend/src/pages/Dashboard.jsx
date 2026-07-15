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
  FiTrash2,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/common/Spinner";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Common/Customer State
  const [requirements, setRequirements] = useState([]);
  
  // Shopkeeper State
  const [incomingReqs, setIncomingReqs] = useState([]);
  const [cityFilter, setCityFilter] = useState(user?.city || "");
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [quoteFormData, setQuoteFormData] = useState({
    estimatedPrice: "",
    deliveryTime: "",
    remarks: "",
  });
  const [quoteFile, setQuoteFile] = useState(null);
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Admin State
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReqs, setAdminReqs] = useState([]);
  const [adminTab, setAdminTab] = useState("stats"); // stats | users | reqs

  const fetchCustomerData = async () => {
    try {
      const response = await api.get("/requirements/my");
      if (response.data.success) {
        setRequirements(response.data.requirements);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requirements.");
    }
  };

  const fetchShopkeeperData = async (cityVal = cityFilter) => {
    try {
      const response = await api.get(`/requirements/incoming?city=${cityVal}`);
      if (response.data.success) {
        setIncomingReqs(response.data.requirements);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load incoming requests.");
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
      if (reqsRes.data.success) setAdminReqs(reqsRes.data.requirements);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load administrative analytics.");
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    if (user?.role === "shopkeeper") {
      await fetchShopkeeperData();
    } else if (user?.role === "admin") {
      await fetchAdminData();
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

  const handleCityFilterChange = (e) => {
    setCityFilter(e.target.value);
  };

  const applyCityFilter = () => {
    fetchShopkeeperData(cityFilter);
  };

  const handleDeleteRequirement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this requirement list?")) {
      return;
    }
    try {
      const response = await api.delete(`/requirements/${id}`);
      if (response.data.success) {
        toast.success("Requirement list deleted successfully.");
        fetchCustomerData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete requirement.");
    }
  };

  // Submit Quotation Logic
  const openQuoteModal = (reqItem) => {
    setSelectedReq(reqItem);
    setQuoteFormData({ estimatedPrice: "", deliveryTime: "", remarks: "" });
    setQuoteFile(null);
    setQuoteModalOpen(true);
  };

  const handleQuoteInputChange = (e) => {
    setQuoteFormData({ ...quoteFormData, [e.target.name]: e.target.value });
  };

  const handleQuoteFileChange = (e) => {
    setQuoteFile(e.target.files[0]);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    const { estimatedPrice, deliveryTime } = quoteFormData;

    if (!estimatedPrice || !deliveryTime) {
      toast.error("Please enter price and delivery timeline.");
      return;
    }

    const data = new FormData();
    data.append("requestId", selectedReq._id);
    data.append("estimatedPrice", estimatedPrice);
    data.append("deliveryTime", deliveryTime);
    data.append("remarks", quoteFormData.remarks);
    if (quoteFile) {
      data.append("quotationFile", quoteFile);
    }

    setSubmittingQuote(true);
    try {
      const response = await api.post("/quotations/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

  // ==========================================
  // CUSTOMER DASHBOARD
  // ==========================================
  if (user?.role === "customer") {
    return (
      <div className="dashboard-page" style={{ background: "var(--bg-dark)", minHeight: "100vh", padding: "3rem 0" }}>
        <div className="container">
          {/* Welcome Banner */}
          <div className="customer-welcome-banner glass" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-glass)", padding: "2.5rem", borderRadius: "16px", marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text-primary)" }}>Welcome back, {user.name}! 👋</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "1.05rem" }}>
                Upload your requirements checklist and get direct quotation estimates from verified local vendors.
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <Link to="/requirements/upload" className="btn-primary">
                  <FiPlus /> Upload New Requirement List
                </Link>
                <Link to="/orders" className="btn-secondary">
                  Track Active Orders <FiArrowRight />
                </Link>
              </div>
            </div>
            <div className="welcome-badge" style={{ background: "rgba(22, 163, 74, 0.1)", border: "1px solid rgba(22, 163, 74, 0.25)", color: "var(--accent-cyan)", padding: "8px 18px", borderRadius: "30px", fontWeight: "700" }}>
              🛒 Procurement Account
            </div>
          </div>

          <h3 className="section-title" style={{ textAlign: "left", marginBottom: "1.5rem" }}>My Requirement Requests</h3>

          {requirements.length === 0 ? (
            <div className="no-data glass" style={{ padding: "4rem", textAlign: "center", background: "var(--bg-surface)" }}>
              <FiFileText style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                You haven't posted any requirements yet. Upload your first list to receive quotes!
              </p>
              <Link to="/requirements/upload" className="btn-primary" style={{ marginTop: "1rem" }}>
                Post Your First Requirement
              </Link>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
              {requirements.map((reqItem) => (
                <div
                  key={reqItem._id}
                  className="dash-card glass"
                  style={{
                    background: "var(--bg-surface)",
                    padding: "2rem",
                    borderRadius: "16px",
                    border: "1px solid var(--border-glass)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: "rgba(15, 23, 42, 0.05)",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {reqItem.category}
                      </span>
                      <button
                        onClick={() => handleDeleteRequirement(reqItem._id)}
                        className="btn-icon delete"
                        style={{ border: "none", background: "transparent", color: "var(--accent-rose)", cursor: "pointer" }}
                        title="Delete Request"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    <h4 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1rem" }}>{reqItem.title}</h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiMapPin /> <span>City Limits: <strong style={{ textTransform: "capitalize", color: "var(--text-primary)" }}>{reqItem.city}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiClock /> <span>Deadline: <strong style={{ color: "var(--text-primary)" }}>{new Date(reqItem.deadline).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                    <div>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Quotations Received</span>
                      <strong style={{ fontSize: "1.2rem", color: "var(--accent-cyan)" }}>
                        {reqItem.quotationsCount} Bids
                      </strong>
                    </div>

                    {reqItem.status === "Completed" ? (
                      <Link to="/orders" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                        View Order
                      </Link>
                    ) : (
                      <Link
                        to={`/compare/${reqItem._id}`}
                        className="btn-primary"
                        style={{ padding: "8px 16px", fontSize: "0.85rem", background: "var(--primary)" }}
                      >
                        Compare Bids
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // SHOPKEEPER DASHBOARD
  // ==========================================
  if (user?.role === "shopkeeper") {
    return (
      <div className="dashboard-page" style={{ background: "var(--bg-dark)", minHeight: "100vh", padding: "3rem 0" }}>
        <div className="container">
          {/* Welcome Banner */}
          <div className="customer-welcome-banner glass" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-glass)", padding: "2.5rem", borderRadius: "16px", marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text-primary)" }}>Shopkeeper Console 🏪</h2>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "1.05rem" }}>
                Review active bulk procurement requests in your area, download requirements, and submit quotations.
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <Link to="/orders" className="btn-primary" style={{ background: "var(--accent-cyan)" }}>
                  Manage Incoming Orders
                </Link>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="glass" style={{ background: "var(--bg-surface)", padding: "1.5rem 2rem", borderRadius: "12px", border: "1px solid var(--border-glass)", display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FiMapPin />
              <label style={{ fontWeight: "700" }}>Filter By City:</label>
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Mumbai"
              value={cityFilter}
              onChange={handleCityFilterChange}
              style={{ maxWidth: "250px", background: "rgba(0,0,0,0.02)" }}
            />
            <button className="btn-primary" onClick={applyCityFilter} style={{ padding: "10px 24px" }}>
              Search Requests
            </button>
          </div>

          <h3 className="section-title" style={{ textAlign: "left", marginBottom: "1.5rem" }}>
            Incoming Requirements ({incomingReqs.length} requests found)
          </h3>

          {incomingReqs.length === 0 ? (
            <div className="no-data glass" style={{ padding: "4rem", textAlign: "center", background: "var(--bg-surface)" }}>
              <FiFileText style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: "1rem" }} />
              <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                No active procurement requests in your city match at the moment. Try searching for a different city!
              </p>
            </div>
          ) : (
            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
              {incomingReqs.map((reqItem) => (
                <div
                  key={reqItem._id}
                  className="dash-card glass"
                  style={{
                    background: "var(--bg-surface)",
                    padding: "2rem",
                    borderRadius: "16px",
                    border: "1px solid var(--border-glass)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          background: "rgba(15, 23, 42, 0.05)",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          textTransform: "capitalize",
                        }}
                      >
                        {reqItem.category}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {reqItem.quotationsCount} Shop quotes
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>{reqItem.title}</h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                      Requested by: {reqItem.customerId?.name || "Customer"}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiMapPin /> <span>City Limits: <strong style={{ textTransform: "capitalize", color: "var(--text-primary)" }}>{reqItem.city}</strong></span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FiClock /> <span>Deadline: <strong style={{ color: "var(--text-primary)" }}>{new Date(reqItem.deadline).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "1rem", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                    {reqItem.uploadedFile ? (
                      <a
                        href={`http://localhost:8000${reqItem.uploadedFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ display: "inline-flex", width: "100%", justifyContent: "center", padding: "10px" }}
                      >
                        <FiDownload /> Download Requirement List File
                      </a>
                    ) : (
                      <div style={{ padding: "8px", background: "rgba(0,0,0,0.02)", fontSize: "0.8rem", color: "var(--text-secondary)", textAlign: "center", borderRadius: "8px" }}>
                        Checklist: see description on bid screen.
                      </div>
                    )}

                    <button
                      className="btn-primary"
                      onClick={() => openQuoteModal(reqItem)}
                      style={{ width: "100%", background: "var(--accent-cyan)", padding: "10px" }}
                    >
                      <FiSend /> Prepare & Submit Quotation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUOTATION FORM MODAL */}
        {quoteModalOpen && selectedReq && (
          <div className="modal-overlay">
            <div className="modal-content glass" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-glass)", padding: "2.5rem", width: "100%", maxWidth: "550px" }}>
              <button className="modal-close" onClick={() => setQuoteModalOpen(false)}>×</button>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "1.5rem" }}>Submit Procurement Quotation</h3>
              <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
                Submit a bid for: <strong>{selectedReq.title}</strong>
              </p>

              <form onSubmit={handleQuoteSubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label">Estimated Bid Price (₹) *</label>
                  <div className="input-wrapper">
                    <FiDollarSign className="input-icon" />
                    <input
                      type="number"
                      name="estimatedPrice"
                      placeholder="e.g. 150000"
                      className="input-field auth-input"
                      value={quoteFormData.estimatedPrice}
                      onChange={handleQuoteInputChange}
                      style={{ paddingLeft: "45px" }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Timeline (Days) *</label>
                  <div className="input-wrapper">
                    <FiClock className="input-icon" />
                    <input
                      type="number"
                      name="deliveryTime"
                      placeholder="e.g. 3"
                      className="input-field auth-input"
                      value={quoteFormData.deliveryTime}
                      onChange={handleQuoteInputChange}
                      style={{ paddingLeft: "45px" }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Quotation Remarks / Catalog Details</label>
                  <textarea
                    name="remarks"
                    placeholder="Provide details about quality grades, brands, transport charges etc."
                    className="input-field"
                    value={quoteFormData.remarks}
                    onChange={handleQuoteInputChange}
                    style={{ minHeight: "100px" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Quotation Estimate (PDF - Optional)</label>
                  <input
                    type="file"
                    onChange={handleQuoteFileChange}
                    className="input-field"
                    accept=".pdf"
                  />
                </div>

                <div className="modal-buttons" style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                  <button type="button" className="btn-secondary" onClick={() => setQuoteModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submittingQuote} style={{ background: "var(--accent-cyan)" }}>
                    {submittingQuote ? "Submitting..." : "Submit Quotation Bid"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================
  if (user?.role === "admin") {
    return (
      <div className="dashboard-page" style={{ background: "var(--bg-dark)", minHeight: "100vh", padding: "3rem 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "2rem" }}>Admin Console 🛡️</h2>

          {/* Admin Tabs */}
          <div className="dashboard-tabs" style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-glass)" }}>
            <button className={`tab-btn ${adminTab === "stats" ? "active" : ""}`} onClick={() => setAdminTab("stats")}>
              <FiGrid /> Analytics Dashboard
            </button>
            <button className={`tab-btn ${adminTab === "users" ? "active" : ""}`} onClick={() => setAdminTab("users")}>
              <FiUsers /> Registered Users ({adminUsers.length})
            </button>
            <button className={`tab-btn ${adminTab === "reqs" ? "active" : ""}`} onClick={() => setAdminTab("reqs")}>
              <FiFileText /> Requirement Requests ({adminReqs.length})
            </button>
          </div>

          {/* Stats Analytics */}
          {adminTab === "stats" && adminStats && (
            <div>
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "3rem" }}>
                <div className="stat-card glass" style={{ background: "var(--bg-surface)", padding: "1.5rem 2rem", borderRadius: "12px" }}>
                  <FiUsers className="stat-icon" style={{ fontSize: "2rem", color: "var(--accent-cyan)", background: "rgba(22,163,74,0.1)", padding: "10px", borderRadius: "8px" }} />
                  <div className="stat-info" style={{ marginLeft: "15px" }}>
                    <h3>{adminStats.totalCustomers + adminStats.totalShopkeepers}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Registrations</p>
                  </div>
                </div>
                <div className="stat-card glass" style={{ background: "var(--bg-surface)", padding: "1.5rem 2rem", borderRadius: "12px" }}>
                  <FiFileText className="stat-icon" style={{ fontSize: "2rem", color: "var(--accent-cyan)", background: "rgba(22,163,74,0.1)", padding: "10px", borderRadius: "8px" }} />
                  <div className="stat-info" style={{ marginLeft: "15px" }}>
                    <h3>{adminStats.totalRequirements}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Procurement Checklists</p>
                  </div>
                </div>
                <div className="stat-card glass" style={{ background: "var(--bg-surface)", padding: "1.5rem 2rem", borderRadius: "12px" }}>
                  <FiPackage className="stat-icon" style={{ fontSize: "2rem", color: "var(--accent-cyan)", background: "rgba(22,163,74,0.1)", padding: "10px", borderRadius: "8px" }} />
                  <div className="stat-info" style={{ marginLeft: "15px" }}>
                    <h3>{adminStats.totalOrders}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Completed Orders</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div className="glass" style={{ background: "var(--bg-surface)", padding: "2rem", borderRadius: "16px" }}>
                  <h4 style={{ fontWeight: "800", marginBottom: "1.5rem" }}>Platform Users Distribution</h4>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <li style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "rgba(0,0,0,0.02)" }}>
                      <span>Customers</span>
                      <strong>{adminStats.totalCustomers}</strong>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "rgba(0,0,0,0.02)" }}>
                      <span>Shopkeepers</span>
                      <strong>{adminStats.totalShopkeepers}</strong>
                    </li>
                  </ul>
                </div>

                <div className="glass" style={{ background: "var(--bg-surface)", padding: "2rem", borderRadius: "16px" }}>
                  <h4 style={{ fontWeight: "800", marginBottom: "1.5rem" }}>Quotation Pipeline Activity</h4>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <li style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "rgba(0,0,0,0.02)" }}>
                      <span>Total Submitted Quotations</span>
                      <strong>{adminStats.totalQuotations}</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Registered Users */}
          {adminTab === "users" && (
            <div className="glass" style={{ background: "var(--bg-surface)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-glass)", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-glass)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px" }}>Name</th>
                    <th style={{ padding: "12px" }}>Email</th>
                    <th style={{ padding: "12px" }}>Role</th>
                    <th style={{ padding: "12px" }}>Phone</th>
                    <th style={{ padding: "12px" }}>City</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                      <td style={{ padding: "12px", fontWeight: "700" }}>{u.name}</td>
                      <td style={{ padding: "12px" }}>{u.email}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ fontSize: "0.8rem", padding: "2px 8px", background: u.role === "admin" ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.04)", textTransform: "capitalize", borderRadius: "4px" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>{u.phone || "N/A"}</td>
                      <td style={{ padding: "12px", textTransform: "capitalize" }}>{u.city || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Requirement Lists */}
          {adminTab === "reqs" && (
            <div className="glass" style={{ background: "var(--bg-surface)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-glass)", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.95rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-glass)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "12px" }}>Title</th>
                    <th style={{ padding: "12px" }}>Category</th>
                    <th style={{ padding: "12px" }}>City</th>
                    <th style={{ padding: "12px" }}>Customer</th>
                    <th style={{ padding: "12px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminReqs.map((r) => (
                    <tr key={r._id} style={{ borderBottom: "1px solid var(--border-glass)" }}>
                      <td style={{ padding: "12px", fontWeight: "700" }}>{r.title}</td>
                      <td style={{ padding: "12px" }}>{r.category}</td>
                      <td style={{ padding: "12px", textTransform: "capitalize" }}>{r.city}</td>
                      <td style={{ padding: "12px" }}>{r.customerId?.name || "N/A"}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ fontSize: "0.8rem", padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", background: r.status === "Completed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: r.status === "Completed" ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                          {r.status}
                        </span>
                      </td>
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

  return null;
}
