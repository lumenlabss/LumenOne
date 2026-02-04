const express = require("express");
const router = express.Router();
const websiteController = require("../controllers/websiteController.js");
const { isAuthenticated } = require("../middleware/auth.js");
const {
    protectSensitiveFiles,
} = require("../middleware/protect-sensitive-files.js");
const path = require("path");

const getVolumesDir = () => path.join(__dirname, "../../storage/volumes");

router.get(
    "/web/manage/:id",
    isAuthenticated,
    websiteController.getManageWebsite,
);
router.post(
    "/web/manage/:id/create-file",
    isAuthenticated,
    websiteController.createFile,
);
router.get(
    "/web/manage/:id/delete/:file",
    isAuthenticated,
    protectSensitiveFiles(),
    websiteController.deleteFile,
);

router.get(
    "/web/manage/:id/reset",
    isAuthenticated,
    websiteController.resetWebsite,
);

module.exports = router;
