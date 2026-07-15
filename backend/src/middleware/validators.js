/**
 * Validation Middleware
 * Validates request body fields for Shop and Product routes
 * before passing control to the respective controllers.
 */

/**
 * validateShop - Validates required shop fields
 * Required: shopName, ownerName, address, city, phone
 * Optional: email (validated for format if provided)
 * Phone must be exactly 10 digits
 */
const validateShop = (req, res, next) => {
  const { shopName, ownerName, address, city, phone, email } = req.body;

  // Check all required fields are present
  if (!shopName || !ownerName || !address || !city || !phone) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: shopName, ownerName, address, city, phone",
    });
  }

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }
  }

  // Validate phone is exactly 10 digits
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be exactly 10 digits",
    });
  }

  next();
};

/**
 * validateProduct - Validates required product fields
 * Required: productName, brand, category, price, shopId
 * price must be > 0, stock must be >= 0 if provided
 */
const validateProduct = (req, res, next) => {
  const { productName, brand, category, price, shopId, stock } = req.body;

  // Check all required fields are present
  if (!productName || !brand || !category || price === undefined || price === null || !shopId) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields: productName, brand, category, price, shopId",
    });
  }

  // Validate price is a positive number
  if (Number(price) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Price must be greater than 0",
    });
  }

  // Validate stock is non-negative if provided
  if (stock !== undefined && stock !== null && Number(stock) < 0) {
    return res.status(400).json({
      success: false,
      message: "Stock must be 0 or greater",
    });
  }

  next();
};

module.exports = { validateShop, validateProduct };
