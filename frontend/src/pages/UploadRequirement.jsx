import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiUploadCloud,
  FiFile,
  FiCalendar,
  FiMapPin,
  FiGrid,
  FiList,
  FiX,
  FiPlus,
  FiTrash2,
  FiImage,
  FiFileText,
} from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AboutContact.css";

const CATEGORIES = [
  "Construction",
  "Electrical",
  "Paint",
  "Plumbing",
  "Hardware",
  "Agriculture",
  "Others",
];

const COMMON_UNITS = ["Pieces", "Bags", "Kg", "Quintal", "Tons", "Meters", "Boxes", "Liters", "Trucks"];

export default function UploadRequirement() {
  const { user, isShopkeeper } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isShopkeeper) {
      toast.info("Material purchase requests are submitted by customer accounts. Redirected to Shopkeeper Portal.");
      navigate("/dashboard", { replace: true });
    }
  }, [isShopkeeper, navigate]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: user?.city || "",
    deadline: "",
    categories: [],
  });

  const [items, setItems] = useState([
    { itemName: "", quantity: 1, unit: "Pieces" },
  ]);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      const updated = exists
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: updated };
    });
  };

  // Dynamic Item List Handlers
  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      return copy;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { itemName: "", quantity: 1, unit: "Pieces" }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1 && !file) {
      toast.info("Please keep at least one item or attach a requirement document.");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // File Handling
  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10 MB limit.");
      return;
    }

    const allowedExts = [
      ".pdf", ".xlsx", ".xls", ".csv", ".doc", ".docx",
      ".png", ".jpg", ".jpeg", ".webp",
    ];
    const ext = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();
    if (!allowedExts.includes(ext)) {
      toast.error("Only PDF, Excel, Document, and Image files are accepted.");
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, city, deadline, categories } = formData;

    if (!title.trim()) {
      toast.error("Please enter a title for the purchase request.");
      return;
    }

    if (categories.length === 0) {
      toast.error("Please select at least one material category.");
      return;
    }

    if (!city.trim()) {
      toast.error("City is required for local shopkeeper matching.");
      return;
    }

    if (!deadline) {
      toast.error("Please choose a quotation deadline date.");
      return;
    }

    const validItems = items.filter(
      (item) => item.itemName.trim() && Number(item.quantity) > 0 && item.unit.trim()
    );

    if (validItems.length === 0 && !file) {
      toast.error("Please list at least one required item or upload an itemized document.");
      return;
    }

    const data = new FormData();
    data.append("title", title.trim());
    data.append("description", description.trim() || title.trim());
    data.append("city", city.trim().toLowerCase());
    data.append("deadline", deadline);
    data.append("categories", JSON.stringify(categories));
    data.append("items", JSON.stringify(validItems));

    if (file) {
      data.append("file", file);
    }

    setSubmitting(true);
    try {
      const response = await api.post("/purchase-requests", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Purchase request submitted successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to submit purchase request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="contact-page"
      style={{ background: "var(--bg-dark)", minHeight: "100vh", padding: "4rem 0" }}
    >
      <div className="container" style={{ maxWidth: "800px" }}>
        <div
          className="contact-card glass"
          style={{
            padding: "3rem",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
          }}
        >
          <div className="contact-header" style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--text-primary)" }}>
              Submit Bulk Purchase Request
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              List your materials or upload a quotation sheet to get competitive bids from local shopkeepers.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Request Title */}
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Request Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Construction Materials for 2-Storey House"
                className="input-field"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Category Selector */}
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">
                <FiGrid style={{ marginRight: "6px" }} />
                Product Categories * (Select all relevant)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = formData.categories.includes(cat);
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: isSelected ? "1px solid var(--primary, #3b82f6)" : "1px solid rgba(255,255,255,0.15)",
                        background: isSelected ? "var(--primary, #3b82f6)" : "rgba(255,255,255,0.05)",
                        color: isSelected ? "#ffffff" : "var(--text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                        transition: "all 0.2s",
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* City & Deadline */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <div className="form-group">
                <label className="form-label">
                  <FiMapPin style={{ marginRight: "6px" }} />
                  Target City *
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Mumbai, Pune, Jaipur"
                  className="input-field"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiCalendar style={{ marginRight: "6px" }} />
                  Quotation Deadline *
                </label>
                <input
                  type="date"
                  name="deadline"
                  className="input-field"
                  value={formData.deadline}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Materials List */}
            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <FiList style={{ marginRight: "6px" }} />
                  Material / Item Specifications
                </label>
                <button
                  type="button"
                  onClick={addItemRow}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "var(--primary, #3b82f6)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    padding: "4px 12px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  <FiPlus /> Add Material Row
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3fr 1.5fr 2fr auto",
                      gap: "10px",
                      alignItems: "center",
                      background: "rgba(255,255,255,0.03)",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Item name (e.g. UltraTech Cement)"
                      className="input-field"
                      style={{ padding: "8px 12px" }}
                      value={item.itemName}
                      onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      className="input-field"
                      style={{ padding: "8px 12px" }}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    />
                    <select
                      className="input-field"
                      style={{ padding: "8px 12px" }}
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                    >
                      {COMMON_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-rose, #ef4444)",
                        cursor: "pointer",
                        padding: "6px",
                      }}
                      title="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Document Upload */}
            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label className="form-label">
                <FiUploadCloud style={{ marginRight: "6px" }} />
                Optional Document or Image Attachment
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                style={{
                  border: dragActive ? "2px dashed var(--primary)" : "2px dashed rgba(255,255,255,0.2)",
                  background: dragActive ? "rgba(59, 130, 246, 0.05)" : "rgba(255,255,255,0.02)",
                  borderRadius: "12px",
                  padding: "2rem",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,image/*"
                />
                <FiUploadCloud style={{ fontSize: "2.5rem", color: "var(--primary)", marginBottom: "8px" }} />
                <p style={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "4px" }}>
                  Click to browse or drag & drop requirement document / photo
                </p>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Supports PDF, Excel, Word, PNG, JPG (Max 10 MB)
                </span>
              </div>

              {file && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    marginTop: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      <FiFileText style={{ fontSize: "1.5rem", color: "var(--primary)" }} />
                    )}
                    <div>
                      <strong style={{ fontSize: "0.9rem", display: "block" }}>{file.name}</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer" }}
                  >
                    <FiX style={{ fontSize: "1.2rem" }} />
                  </button>
                </div>
              )}
            </div>

            {/* Additional Remarks */}
            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label className="form-label">Additional Instructions / Description</label>
              <textarea
                name="description"
                rows="3"
                placeholder="Specify preferred brands, site delivery requirements, unloading help needed, etc."
                className="input-field"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: "100%", padding: "14px", fontSize: "1.1rem", fontWeight: "700" }}
            >
              {submitting ? "Submitting Request..." : "Submit Purchase Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
