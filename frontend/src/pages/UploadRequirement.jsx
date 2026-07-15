import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiUploadCloud,
  FiCamera,
  FiFile,
  FiCalendar,
  FiMapPin,
  FiGrid,
  FiList,
  FiX,
  FiImage,
  FiFileText,
} from "react-icons/fi";
import api from "../services/api";
import "./AboutContact.css";

export default function UploadRequirement() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    city: "",
    description: "",
    deadline: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // Image preview URL
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Process selected or captured file
  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate size (10 MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10 MB limit.");
      return;
    }

    // Validate extension
    const allowedExts = [
      ".pdf", ".xlsx", ".xls", ".csv",
      ".png", ".jpg", ".jpeg", ".webp",
    ];
    const ext = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();
    if (!allowedExts.includes(ext)) {
      toast.error("Only PDF, Excel, and Image files are accepted.");
      return;
    }

    setFile(selectedFile);

    // Generate preview for images
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
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Drag and Drop handlers
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
    const { title, category, city, deadline } = formData;

    if (!title || !category || !city || !deadline) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const data = new FormData();
    data.append("title", title);
    data.append("category", category);
    data.append("city", city);
    data.append("description", formData.description);
    data.append("deadline", deadline);
    if (file) {
      data.append("requirementFile", file);
    }

    setSubmitting(true);
    try {
      const response = await api.post("/requirements/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        toast.success("Requirement list uploaded successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to upload requirement list."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to pick a nice icon for the file type
  const getFileIcon = () => {
    if (!file) return null;
    if (file.type.startsWith("image/")) return <FiImage />;
    if (file.type === "application/pdf") return <FiFileText />;
    return <FiFile />;
  };

  return (
    <div
      className="contact-page"
      style={{ background: "var(--bg-dark)", minHeight: "100vh", padding: "4rem 0" }}
    >
      <div className="container" style={{ maxWidth: "720px" }}>
        <div
          className="contact-card glass"
          style={{
            padding: "3rem",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
          }}
        >
          <div
            className="contact-header"
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
          >
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: "800",
                color: "var(--text-primary)",
              }}
            >
              Upload Requirement List
            </h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              Take a photo of your requirements, upload a PDF / Excel document,
              or type them manually to get bids from local vendors.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="contact-form"
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Requirement Title *</label>
              <div className="input-wrapper">
                <FiList className="input-icon" />
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Bulk Cement & TMT Steel Bars for Construction"
                  className="input-field auth-input"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{ paddingLeft: "45px" }}
                />
              </div>
            </div>

            {/* Category + City Grid */}
            <div
              className="form-group"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <div>
                <label className="form-label">Category *</label>
                <div className="input-wrapper">
                  <FiGrid className="input-icon" />
                  <select
                    name="category"
                    className="input-field auth-input"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={submitting}
                    style={{ paddingLeft: "45px" }}
                  >
                    <option value="">Select Category</option>
                    <option value="Construction Materials">
                      Construction Materials
                    </option>
                    <option value="Electrical Supplies">
                      Electrical Supplies
                    </option>
                    <option value="Plumbing & Hardware">
                      Plumbing &amp; Hardware
                    </option>
                    <option value="Paints & Decor">Paints &amp; Decor</option>
                    <option value="Agricultural Tools">
                      Agricultural Tools
                    </option>
                    <option value="Industrial Machinery">
                      Industrial Machinery
                    </option>
                    <option value="Borewell Equipment">
                      Borewell Equipment
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">City *</label>
                <div className="input-wrapper">
                  <FiMapPin className="input-icon" />
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Mumbai"
                    className="input-field auth-input"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={submitting}
                    style={{ paddingLeft: "45px" }}
                  />
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="form-group">
              <label className="form-label">Procurement Deadline *</label>
              <div className="input-wrapper">
                <FiCalendar className="input-icon" />
                <input
                  type="date"
                  name="deadline"
                  className="input-field auth-input"
                  value={formData.deadline}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{ paddingLeft: "45px" }}
                />
              </div>
            </div>

            {/* Description / Manual List */}
            <div className="form-group">
              <label className="form-label">
                Requirements Checklist Details / Remarks
              </label>
              <textarea
                name="description"
                placeholder="List items manually here or provide details about delivery terms, quality grades etc."
                className="input-field"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
                style={{ minHeight: "120px" }}
              />
            </div>

            {/* ======================================== */}
            {/* FILE UPLOAD + CAMERA CAPTURE SECTION     */}
            {/* ======================================== */}
            <div className="form-group">
              <label className="form-label">
                Upload Requirement Document or Take a Photo
              </label>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={submitting}
              />
              {/* Camera input — uses capture="environment" so mobile devices open the rear camera */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={submitting}
              />

              {/* If no file selected yet — show picker UI */}
              {!file ? (
                <>
                  {/* Drag-and-drop zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragActive ? "var(--accent-cyan)" : "var(--border-glass)"}`,
                      borderRadius: "12px",
                      padding: "2.5rem 1.5rem",
                      textAlign: "center",
                      background: dragActive
                        ? "rgba(22, 163, 74, 0.04)"
                        : "rgba(0, 0, 0, 0.02)",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <FiUploadCloud
                      style={{
                        fontSize: "2.8rem",
                        color: "var(--accent-cyan)",
                        marginBottom: "0.75rem",
                      }}
                    />
                    <p style={{ fontWeight: "700", fontSize: "1rem" }}>
                      Drag &amp; Drop or Click to Select File
                    </p>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginTop: "6px",
                      }}
                    >
                      PDF, XLSX, XLS, CSV, PNG, JPG, JPEG, WEBP — Max 10 MB
                    </p>
                  </div>

                  {/* OR divider */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      margin: "1rem 0",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background: "var(--border-glass)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      or
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background: "var(--border-glass)",
                      }}
                    />
                  </div>

                  {/* Camera capture button */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={submitting}
                    className="btn-secondary"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      padding: "14px",
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      border: "2px solid var(--accent-cyan)",
                      color: "var(--accent-cyan)",
                      borderRadius: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <FiCamera style={{ fontSize: "1.3rem" }} />
                    Take Photo with Camera
                  </button>
                </>
              ) : (
                /* File selected — show preview card */
                <div
                  style={{
                    border: "1px solid var(--border-glass)",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    background: "rgba(0, 0, 0, 0.02)",
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "center",
                  }}
                >
                  {/* Thumbnail or icon */}
                  {preview ? (
                    <img
                      src={preview}
                      alt="Requirement preview"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid var(--border-glass)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "10px",
                        background: "rgba(22, 163, 74, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        color: "var(--accent-cyan)",
                        flexShrink: 0,
                      }}
                    >
                      {getFileIcon()}
                    </div>
                  )}

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "0.95rem",
                        wordBreak: "break-all",
                      }}
                    >
                      {file.name}
                    </p>
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                        marginTop: "4px",
                      }}
                    >
                      {(file.size / 1024).toFixed(1)} KB •{" "}
                      {file.type || "Unknown type"}
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={removeFile}
                    title="Remove file"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px",
                      cursor: "pointer",
                      color: "var(--accent-rose)",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    <FiX />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{
                padding: "14px",
                marginTop: "1rem",
                fontSize: "1rem",
                width: "100%",
              }}
            >
              {submitting
                ? "Uploading Requirement..."
                : "Submit Requirement List"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
