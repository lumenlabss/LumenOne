const express = require("express");
const router = express.Router();
const adminCustomerController = require("../controllers/adminCustomerController.js");
const adminSubscriptionController = require("../controllers/adminSubscriptionController.js");
const adminController = require("../controllers/adminController.js");
const adminNodeController = require("../controllers/adminNodeController.js");
const { isAuthenticated } = require("../middleware/auth-admin.js");

// Nodes
router.get(
    "/web/admin/nodes/create",
    isAuthenticated,
    adminNodeController.getCreateNode,
);
router.post(
    "/web/admin/nodes/create",
    isAuthenticated,
    adminNodeController.createNode,
);
router.get(
    "/web/admin/nodes/delete/:id",
    isAuthenticated,
    adminNodeController.deleteNode,
);
router.get(
    "/web/admin/nodes/edit/:id",
    isAuthenticated,
    adminNodeController.getEditNode,
);
router.post(
    "/web/admin/nodes/edit/:id",
    isAuthenticated,
    adminNodeController.updateNode,
);

// Customers
router.get(
    "/web/admin/customers",
    isAuthenticated,
    adminCustomerController.getCustomers,
);
router.get(
    "/web/admin/customers/delete/:id",
    isAuthenticated,
    adminCustomerController.deleteCustomer,
);
router.get(
    "/web/admin/customers/edit/:id",
    isAuthenticated,
    adminCustomerController.getEditCustomer,
);
router.post(
    "/web/admin/customers/edit/:id",
    isAuthenticated,
    adminCustomerController.updateCustomer,
);
router.get(
    "/web/admin/customers/create",
    isAuthenticated,
    adminCustomerController.getCreateCustomer,
);
router.post(
    "/web/admin/customers/create",
    isAuthenticated,
    adminCustomerController.createCustomer,
);

// Subscriptions
router.get(
    "/web/admin/subscriptions",
    isAuthenticated,
    adminSubscriptionController.getSubscriptions,
);
router.get(
    "/web/admin/subscriptions/delete/:uuid",
    isAuthenticated,
    adminSubscriptionController.deleteSubscription,
);
router.get(
    "/web/admin/subscriptions/create",
    isAuthenticated,
    adminSubscriptionController.getCreateSubscription,
);
router.post(
    "/web/admin/subscriptions/create",
    isAuthenticated,
    adminSubscriptionController.createSubscription,
);

// General Admin
router.get(
    "/web/admin/information",
    isAuthenticated,
    adminController.getInformation,
);
router.get("/web/admin/settings", isAuthenticated, adminController.getSettings);
router.get("/web/admin/modules", isAuthenticated, adminController.getModules);

module.exports = router;
