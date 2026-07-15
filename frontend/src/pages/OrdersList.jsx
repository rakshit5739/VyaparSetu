import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiCheckCircle, FiXCircle, FiPackage, FiTruck, FiPhone, FiMail, FiMapPin, FiUser, FiInfo } from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import "./Compare.css"; // Reuse card layout styling

export default function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my");
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change order status to ${newStatus}?`)) {
      return;
    }

    setUpdatingId(orderId);
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="orders-page" style={{ padding: "3rem 0", background: "var(--bg-dark)", minHeight: "100vh" }}>
      <div className="container">
        <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "2rem" }}>Procurement Orders</h2>

        {orders.length === 0 ? (
          <div className="no-data glass" style={{ padding: "4rem", textAlign: "center", background: "var(--bg-surface)" }}>
            <FiPackage style={{ fontSize: "3rem", color: "var(--text-muted)", marginBottom: "1rem" }} />
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
              No orders have been placed or received yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {orders.map((order) => {
              const statusColors = {
                Pending: { bg: "rgba(245, 158, 11, 0.15)", text: "var(--accent-amber)" },
                Confirmed: { bg: "rgba(59, 130, 246, 0.15)", text: "var(--primary-light)" },
                Delivered: { bg: "rgba(16, 185, 129, 0.15)", text: "var(--accent-emerald)" },
                Cancelled: { bg: "rgba(239, 68, 68, 0.15)", text: "var(--accent-rose)" },
              };
              const color = statusColors[order.status] || statusColors.Pending;

              return (
                <div
                  key={order._id}
                  className="glass order-item-card"
                  style={{
                    background: "var(--bg-surface)",
                    padding: "2rem",
                    borderRadius: "16px",
                    border: "1px solid var(--border-glass)",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "2rem",
                  }}
                >
                  <div>
                    {/* Upper Details */}
                    <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "1rem", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "800",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          background: color.bg,
                          color: color.text,
                          textTransform: "uppercase",
                        }}
                      >
                        {order.status}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Requirement details */}
                    <h3 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "1.5rem" }}>
                      {order.requirementId?.title || "Requirement details deleted"}
                    </h3>

                    {/* Customer vs Shopkeeper Details columns */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", flexWrap: "wrap" }}>
                      {user.role === "shopkeeper" ? (
                        /* Customer Details shown to shopkeeper */
                        <div>
                          <h4 style={{ fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                            Customer Details
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FiUser /> <strong>{order.customerId?.name}</strong>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FiPhone /> <span>{order.customerId?.phone || "N/A"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FiMail /> <span>{order.customerId?.email}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FiMapPin /> <span>{order.customerId?.address}, {order.customerId?.city}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Shopkeeper Details shown to customer */
                        <div>
                          <h4 style={{ fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                            Shopkeeper Details
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FiUser /> <strong>{order.shopkeeperId?.name} ({order.quotationId?.shopName})</strong>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FiPhone /> <span>{order.shopkeeperId?.phone || "N/A"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FiMail /> <span>{order.shopkeeperId?.email}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FiMapPin /> <span>{order.shopkeeperId?.address}, {order.shopkeeperId?.city}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quotation details column */}
                      <div>
                        <h4 style={{ fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                          Quotation Details
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <FiInfo /> <span>Quoted Price: <strong style={{ color: "var(--accent-cyan)", fontSize: "1.1rem" }}>₹{order.quotationId?.estimatedPrice.toLocaleString()}</strong></span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <FiTruck /> <span>Delivery Timeline: <strong>{order.quotationId?.deliveryTime} Days</strong></span>
                          </div>
                          {order.quotationId?.remarks && (
                            <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                              <em>Remarks: "{order.quotationId.remarks}"</em>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", minWidth: "180px" }}>
                    {user.role === "shopkeeper" && order.status === "Pending" && (
                      <button
                        className="btn-primary"
                        onClick={() => handleUpdateStatus(order._id, "Confirmed")}
                        disabled={updatingId !== null}
                        style={{ width: "100%", background: "var(--accent-cyan)" }}
                      >
                        Confirm Order
                      </button>
                    )}

                    {user.role === "shopkeeper" && order.status === "Confirmed" && (
                      <button
                        className="btn-primary"
                        onClick={() => handleUpdateStatus(order._id, "Delivered")}
                        disabled={updatingId !== null}
                        style={{ width: "100%", background: "var(--accent-emerald)" }}
                      >
                        Mark Delivered
                      </button>
                    )}

                    {(order.status === "Pending" || order.status === "Confirmed") && (
                      <button
                        className="btn-secondary"
                        onClick={() => handleUpdateStatus(order._id, "Cancelled")}
                        disabled={updatingId !== null}
                        style={{ width: "100%", borderColor: "var(--accent-rose)", color: "var(--accent-rose)" }}
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.status === "Delivered" && (
                      <div style={{ textAlign: "center", color: "var(--accent-emerald)", fontWeight: "600", fontSize: "0.95rem" }}>
                        <FiCheckCircle style={{ fontSize: "1.5rem", marginBottom: "4px" }} />
                        <span style={{ display: "block" }}>Order Delivered</span>
                      </div>
                    )}

                    {order.status === "Cancelled" && (
                      <div style={{ textAlign: "center", color: "var(--accent-rose)", fontWeight: "600", fontSize: "0.95rem" }}>
                        <FiXCircle style={{ fontSize: "1.5rem", marginBottom: "4px" }} />
                        <span style={{ display: "block" }}>Order Cancelled</span>
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
