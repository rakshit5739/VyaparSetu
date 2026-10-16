const Order = require("../models/Order");

/**
 * Get orders belonging to the logged-in customer/shopkeeper
 * GET /api/orders/my
 */
const getMyOrders = async (req, res) => {
    try {
        let filter = {};

        if (req.user.roles.includes("admin")) {
            // Admin sees all
        } else if (req.user.roles.includes("shopkeeper") && !req.user.roles.includes("customer")) {
            filter.shopkeeper = req.user._id;
        } else if (req.user.roles.includes("customer")) {
            filter.customer = req.user._id;
        } else {
            filter.shopkeeper = req.user._id;
        }

        const orders = await Order.find(filter)
            .populate("customer", "name email phone city")
            .populate("shopkeeper", "name email city businessCategories")
            .populate("quotation", "estimatedPrice message status")
            .populate(
                "purchaseRequest",
                "title description categories items uploadedFile city status"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Get My Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

/**
 * Get a single order
 * GET /api/orders/:id
 */
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customer", "name email phone city")
            .populate("shopkeeper", "name email city businessCategories")
            .populate("quotation", "estimatedPrice message status")
            .populate(
                "purchaseRequest",
                "title description categories items uploadedFile city status"
            );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const customerId = order.customer?._id
            ? order.customer._id.toString()
            : order.customer?.toString();
        const shopkeeperId = order.shopkeeper?._id
            ? order.shopkeeper._id.toString()
            : order.shopkeeper?.toString();
        const userId = req.user._id.toString();
        const isAdmin = req.user.roles && req.user.roles.includes("admin");

        if (userId !== customerId && userId !== shopkeeperId && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this order",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Get Order By ID Error:", error);
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

/**
 * Update order status
 * PUT /api/orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Please provide a status value",
            });
        }

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Delivered",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        const customerId = order.customer.toString();
        const shopkeeperId = order.shopkeeper.toString();
        const userId = req.user._id.toString();
        const isCustomer = userId === customerId;
        const isShopkeeper = userId === shopkeeperId;
        const isAdmin = req.user.roles && req.user.roles.includes("admin");

        if (!isCustomer && !isShopkeeper && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this order",
            });
        }

        if (!isAdmin) {
            // Customer can only cancel
            if (isCustomer && status !== "Cancelled") {
                return res.status(403).json({
                    success: false,
                    message: "Customer can only cancel an order",
                });
            }

            // Shopkeeper cannot cancel
            if (isShopkeeper && !isCustomer && status === "Cancelled") {
                return res.status(403).json({
                    success: false,
                    message: "Shopkeeper cannot cancel an order",
                });
            }

            // Shopkeeper can confirm pending orders
            if (
                isShopkeeper &&
                status === "Confirmed" &&
                order.status !== "Pending"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Only pending orders can be confirmed",
                });
            }

            // Shopkeeper can mark confirmed orders as delivered
            if (
                isShopkeeper &&
                status === "Delivered" &&
                order.status !== "Confirmed"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Only confirmed orders can be marked as delivered",
                });
            }
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status} successfully`,
            order,
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

module.exports = {
    getMyOrders,
    getOrderById,
    updateOrderStatus,
};
