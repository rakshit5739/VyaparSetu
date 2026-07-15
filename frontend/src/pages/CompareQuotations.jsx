import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiDownload, FiCheck, FiTruck, FiClock, FiDollarSign, FiMessageSquare } from "react-icons/fi";
import api from "../services/api";
import Spinner from "../components/common/Spinner";
import "./Compare.css";

export default function CompareQuotations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchData = async () => {
    try {
      const [reqResponse, quotesResponse] = await Promise.all([
        api.get(`/requirements/${id}`),
        api.get(`/quotations/requirement/${id}`),
      ]);

      if (reqResponse.data.success) {
        setRequirement(reqResponse.data.requirement);
      }
      if (quotesResponse.data.success) {
        setQuotations(quotesResponse.data.quotations);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quotations comparison.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAcceptQuotation = async (quoteId) => {
    if (!window.confirm("Are you sure you want to accept this quotation? This will reject all other bids and create an order.")) {
      return;
    }

    setAcceptingId(quoteId);
    try {
      const response = await api.put(`/quotations/${quoteId}/accept`);
      if (response.data.success) {
        toast.success("Quotation accepted! Procurement order created.");
        navigate("/orders");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to accept quotation.");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!requirement) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h2>Requirement details not found</h2>
      </div>
    );
  }

  // Find the lowest quotation price to highlight
  const lowestPrice = quotations.length > 0
    ? Math.min(...quotations.map((q) => q.estimatedPrice))
    : null;

  return (
    <div className="compare-page" style={{ padding: "3rem 0", background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div className="container">
        {/* Header Details */}
        <div className="compare-header glass" style={{ padding: "2.5rem", marginBottom: "3rem", background: "var(--bg-surface)" }}>
          <span style={{ textTransform: "uppercase", fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: "bold" }}>
            Category: {requirement.category}
          </span>
          <h2 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "4px", marginBottom: "1rem" }}>
            {requirement.title}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.6" }}>
            {requirement.description || "No manual description provided."}
          </p>

          <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>City Limit</span>
              <strong style={{ fontSize: "1rem", textTransform: "capitalize" }}>{requirement.city}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Deadline Date</span>
              <strong style={{ fontSize: "1rem" }}>{new Date(requirement.deadline).toLocaleDateString()}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Status</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  background:
                    requirement.status === "Completed"
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  color: requirement.status === "Completed" ? "var(--accent-emerald)" : "var(--accent-amber)",
                }}
              >
                {requirement.status}
              </span>
            </div>
          </div>

          {requirement.uploadedFile && (
            <a
              href={`http://localhost:8000${requirement.uploadedFile}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ marginTop: "1.5rem", width: "fit-content", display: "inline-flex" }}
            >
              <FiDownload /> Download Requirement List File
            </a>
          )}
        </div>

        {/* Quotations List */}
        <h3 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "2rem" }}>
          Quotations Comparison ({quotations.length} Vendor bids)
        </h3>

        {quotations.length === 0 ? (
          <div className="no-data glass" style={{ padding: "4rem", textAlign: "center", background: "var(--bg-surface)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              No shopkeepers have prepared quotations for this requirement yet.
            </p>
          </div>
        ) : (
          <div className="compare-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }}>
            {quotations.map((quote) => {
              const isLowest = quote.estimatedPrice === lowestPrice;
              const isAccepted = quote.status === "Accepted";

              return (
                <div
                  key={quote._id}
                  className={`compare-card glass ${isLowest ? "lowest-price-active" : ""}`}
                  style={{
                    position: "relative",
                    background: "var(--bg-surface)",
                    padding: "2rem",
                    border: isLowest ? "2px solid var(--accent-cyan)" : "1px solid var(--border-glass)",
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: isLowest ? "0 10px 25px rgba(22, 163, 74, 0.1)" : "none",
                  }}
                >
                  {isLowest && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-15px",
                        left: "20px",
                        background: "var(--accent-cyan)",
                        color: "white",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        textTransform: "uppercase",
                      }}
                    >
                      ★ Best Price (Lowest)
                    </div>
                  )}

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                      <div>
                        <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>{quote.shopName}</h4>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          Quoted on {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Est. Price</span>
                        <strong style={{ fontSize: "1.4rem", color: "var(--accent-cyan)" }}>
                          ₹{quote.estimatedPrice.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.95rem" }}>
                        <FiTruck style={{ color: "var(--text-muted)" }} />
                        <span>Delivery within: <strong>{quote.deliveryTime} Days</strong></span>
                      </div>
                      {quote.remarks && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.95rem" }}>
                          <FiMessageSquare style={{ color: "var(--text-muted)", marginTop: "4px" }} />
                          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                            <em>"{quote.remarks}"</em>
                          </p>
                        </div>
                      )}
                    </div>

                    {quote.quotationFile && (
                      <a
                        href={`http://localhost:8000${quote.quotationFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ display: "inline-flex", width: "100%", justifyContent: "center", padding: "10px", fontSize: "0.85rem", marginBottom: "1rem" }}
                      >
                        <FiDownload /> View Estimate PDF
                      </a>
                    )}
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    {isAccepted ? (
                      <button
                        className="btn-primary"
                        disabled
                        style={{ width: "100%", background: "var(--accent-emerald)" }}
                      >
                        <FiCheck /> Accepted Quotation
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        disabled={acceptingId !== null || requirement.status === "Completed"}
                        onClick={() => handleAcceptQuotation(quote._id)}
                        style={{ width: "100%", background: isLowest ? "var(--accent-cyan)" : "var(--primary)" }}
                      >
                        {acceptingId === quote._id ? "Accepting..." : "Accept Quotation"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
