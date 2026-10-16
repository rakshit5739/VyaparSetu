import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiTruck,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiInfo,
} from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/common/Spinner";
import "./Compare.css";

export default function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const isShopkeeper = user?.roles?.includes("shopkeeper") || user?.role === "shopkeeper";

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/my");
      if (response.data.success) {
        setOrders(response.data.orders || []);
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
    if (!window.confirm(`Are you sure you want to update order status to ${newStatus}?`)) {
      return;
    }

    setUpdatingId(orderId);
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus} successfully!`);
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
        <h2 style={{ fontSize: "2.2rem", fontWeight: "800", marginBottom: "2rem" }}>
          Procurement Orders
        </h2>

        {orders.length === 0 ? (
          <div className="no-data glass" style={{ padding: "4rem", textAlign: "center", background: "var(--bg-surface)", borderRadius: "16px" }}>
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
                Confirmed: { bg: "rgba(59, 130, 246, 0.15)", text: "var(--primary)" },
                Delivered: { bg: "rgba(16, 185, 129, 0.15)", text: "var(--accent-emerald)" },
                Cancelled: { bg: "rgba(239, 68, 68, 0.15)", text: "var(--accent-rose)" },
              };
              const color = statusColors[order.status] || statusColors.Pending;

              const customer = order.customer || order.customerId;
              const shopkeeper = order.shopkeeper || order.shopkeeperId;
              const quotation = order.quotation || order.quotationId;
              const purchaseRequest = order.purchaseRequest || order.requirementId;

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
                    {/* Status & Date */}
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

                    {/* Purchase Request Title */}
                    <h3 style={{ fontSize: "1.4rem", fontWeight: "800", marginBottom: "1rem" }}>
                      {purchaseRequest?.title || "Bulk Procurement Order"}
                    </h3>

                    {/* Items List Preview */}
                    {purchaseRequest?.items && purchaseRequest.items.length > 0 && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          marginBottom: "1.5rem",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                          Order Items:
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {purchaseRequest.items.map((it, idx) => (
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

                    {/* Parties info & quote summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", flexWrap: "wrap" }}>
                      {isShopkeeper ? (
                        <div>
                          <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                            Customer Information
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <FiUser /> <strong>{customer?.name || "Customer"}</strong>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <FiMail /> <span>{customer?.email}</span>
                            </div>
                            {customer?.city && (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <FiMapPin /> <span style={{ textTransform: "capitalize" }}>{customer.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                            Shopkeeper Information
                          </h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.9rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <FiUser /> <strong>{shopkeeper?.name || "Merchant"}</strong>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <FiMail /> <span>{shopkeeper?.email}</span>
                            </div>
                            {shopkeeper?.city && (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <FiMapPin /> <span style={{ textTransform: "capitalize" }}>{shopkeeper.city}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                          Quotation Agreed
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.9rem" }}>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Agreed Total: </span>
                            <strong style={{ color: "var(--accent-emerald)", fontSize: "1.2rem" }}>
                              ₹{Number(quotation?.estimatedPrice || 0).toLocaleString()}
                            </strong>
                          </div>
                          {quotation?.message && (
                            <p style={{ margin: 0, color: "var(--text-secondary)", fontStyle: "italic" }}>
                              "{quotation.message}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "10px", minWidth: "160px" }}>
                    {isShopkeeper ? (
                      <>
                        {order.status === "Pending" && (
                          <button
                            className="btn-primary"
                            disabled={updatingId === order._id}
                            onClick={() => handleUpdateStatus(order._id, "Confirmed")}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "10px" }}
                          >
                            <FiCheckCircle /> Confirm Order
                          </button>
                        )}
                        {order.status === "Confirmed" && (
                          <button
                            className="btn-primary"
                            disabled={updatingId === order._id}
                            onClick={() => handleUpdateStatus(order._id, "Delivered")}
                            style={{
                              background: "var(--accent-emerald)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              padding: "10px",
                            }}
                          >
                            <FiTruck /> Mark Delivered
                          </button>
                        )}
                        {order.status === "Delivered" && (
                          <span style={{ color: "var(--accent-emerald)", fontWeight: "700", textAlign: "center" }}>
                            ✓ Fulfilled
                          </span>
                        )}
                        {order.status === "Cancelled" && (
                          <span style={{ color: "var(--accent-rose)", fontWeight: "700", textAlign: "center" }}>
                            ✕ Order Cancelled
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {order.status === "Pending" && (
                          <button
                            style={{
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "var(--accent-rose)",
                              border: "1px solid rgba(239, 68, 68, 0.3)",
                              padding: "10px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                            disabled={updatingId === order._id}
                            onClick={() => handleUpdateStatus(order._id, "Cancelled")}
                          >
                            <FiXCircle /> Cancel Order
                          </button>
                        )}
                        {order.status !== "Pending" && (
                          <span style={{ textAlign: "center", color: color.text, fontWeight: "700" }}>
                            {order.status}
                          </span>
                        )}
                      </>
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
