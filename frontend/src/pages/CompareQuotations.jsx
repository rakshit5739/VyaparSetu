import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiDownload,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiMessageSquare,
  FiMapPin,
  FiPackage,
  FiUser,
} from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import "./Compare.css";

export default function CompareQuotations() {
  const { isCustomer } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchaseRequest, setPurchaseRequest] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchData = async () => {
    try {
      const [reqResponse, quotesResponse] = await Promise.all([
        api.get(`/purchase-requests/${id}`),
        api.get(`/quotations/request/${id}`),
      ]);

      if (reqResponse.data.success) {
        setPurchaseRequest(
          reqResponse.data.purchaseRequest || reqResponse.data.requirement
        );
      }
      if (quotesResponse.data.success) {
        setQuotations(quotesResponse.data.quotations || []);
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
    if (
      !window.confirm(
        "Are you sure you want to accept this quotation? This will create your official procurement order."
      )
    ) {
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

  if (!purchaseRequest) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <h2>Purchase request details not found</h2>
      </div>
    );
  }

  // Find lowest price
  const lowestPrice =
    quotations.length > 0
      ? Math.min(...quotations.map((q) => q.estimatedPrice))
      : null;

  const categories = purchaseRequest.categories || (purchaseRequest.category ? [purchaseRequest.category] : []);

  return (
    <div
      className="compare-page"
      style={{ padding: "3rem 0", background: "var(--bg-dark)", minHeight: "100vh" }}
    >
      <div className="container">
        {/* Header Details */}
        <div
          className="compare-header glass"
          style={{
            padding: "2.5rem",
            marginBottom: "3rem",
            background: "var(--bg-surface)",
            borderRadius: "16px",
            border: "1px solid var(--border-glass)",
          }}
        >
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
            {categories.map((c) => (
              <span
                key={c}
                style={{
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  color: "var(--primary)",
                  background: "rgba(59, 130, 246, 0.15)",
                  padding: "2px 10px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                }}
              >
                {c}
              </span>
            ))}
          </div>

          <h2 style={{ fontSize: "2.2rem", fontWeight: "800", margin: "4px 0 1rem" }}>
            {purchaseRequest.title}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: "1.6" }}>
            {purchaseRequest.description || "No manual description provided."}
          </p>

          {/* Requested Items Preview */}
          {purchaseRequest.items && purchaseRequest.items.length > 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                padding: "16px",
                borderRadius: "10px",
                margin: "1.5rem 0",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)", display: "block", marginBottom: "8px" }}>
                Requested Materials List:
              </strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {purchaseRequest.items.map((it, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {it.itemName}: <strong>{it.quantity} {it.unit}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "2rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>City Limit</span>
              <strong style={{ fontSize: "1rem", textTransform: "capitalize" }}>{purchaseRequest.city}</strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Deadline Date</span>
              <strong style={{ fontSize: "1rem" }}>
                {new Date(purchaseRequest.deadline).toLocaleDateString()}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Status</span>
              <span
                style={{
                  fontSize: "0.85rem",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontWeight: "bold",
                  background:
                    purchaseRequest.status === "Accepted"
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(245, 158, 11, 0.15)",
                  color:
                    purchaseRequest.status === "Accepted"
                      ? "var(--accent-emerald)"
                      : "var(--accent-amber)",
                }}
              >
                {purchaseRequest.status}
              </span>
            </div>
          </div>

          {purchaseRequest.uploadedFile?.fileUrl && (
            <a
              href={`http://localhost:8000${purchaseRequest.uploadedFile.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ marginTop: "1.5rem", width: "fit-content", display: "inline-flex", gap: "6px" }}
            >
              <FiDownload /> Download Attached List ({purchaseRequest.uploadedFile.fileName || "File"})
            </a>
          )}
        </div>

        {/* Quotations List */}
        <h3 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "2rem" }}>
          Quotations Comparison ({quotations.length} Received Bids)
        </h3>

        {quotations.length === 0 ? (
          <div
            className="no-data glass"
            style={{ padding: "4rem", textAlign: "center", background: "var(--bg-surface)", borderRadius: "16px" }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              No shopkeepers have prepared quotations for this request yet. Check back soon!
            </p>
          </div>
        ) : (
          <div
            className="compare-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "24px",
            }}
          >
            {quotations.map((quote) => {
              const isLowest = quote.estimatedPrice === lowestPrice;
              const isAccepted = quote.status === "Accepted";
              const isRequestAccepted = ["Accepted", "Completed"].includes(purchaseRequest.status);

              return (
                <div
                  key={quote._id}
                  className={`compare-card glass ${isLowest ? "lowest-price-active" : ""}`}
                  style={{
                    position: "relative",
                    background: "var(--bg-surface)",
                    padding: "2rem",
                    border: isLowest ? "2px solid var(--primary)" : "1px solid var(--border-glass)",
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {isLowest && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-14px",
                        left: "20px",
                        background: "var(--primary, #3b82f6)",
                        color: "white",
                        padding: "3px 12px",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "800",
                        textTransform: "uppercase",
                      }}
                    >
                      ★ Best Price (Lowest Bid)
                    </div>
                  )}

                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1.2rem",
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: "1.25rem", fontWeight: "800" }}>
                          {quote.shopkeeper?.name || quote.shopName || "Local Merchant"}
                        </h4>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          Quoted on {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                        {quote.shopkeeper?.city && (
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            <FiMapPin style={{ marginRight: "4px" }} />
                            <span style={{ textTransform: "capitalize" }}>{quote.shopkeeper.city}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                          Estimated Total
                        </span>
                        <strong style={{ fontSize: "1.5rem", color: "var(--accent-emerald, #10b981)" }}>
                          ₹{Number(quote.estimatedPrice).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.95rem" }}>
                        <FiMessageSquare style={{ color: "var(--text-muted)", marginTop: "4px" }} />
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontStyle: "italic" }}>
                          "{quote.message || quote.remarks || "No specific message provided."}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    {isAccepted ? (
                      <button
                        className="btn-primary"
                        disabled
                        style={{
                          width: "100%",
                          background: "var(--accent-emerald)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <FiCheck /> Accepted Quotation
                      </button>
                    ) : isCustomer ? (
                      <button
                        className="btn-primary"
                        disabled={acceptingId !== null || isRequestAccepted}
                        onClick={() => handleAcceptQuotation(quote._id)}
                        style={{
                          width: "100%",
                          background: isLowest ? "var(--primary)" : "rgba(255,255,255,0.1)",
                        }}
                      >
                        {acceptingId === quote._id
                          ? "Accepting..."
                          : isRequestAccepted
                          ? "Another Bid Accepted"
                          : "Accept This Quotation"}
                      </button>
                    ) : (
                      <div style={{ textAlign: "center", padding: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Customer Action Only
                      </div>
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
