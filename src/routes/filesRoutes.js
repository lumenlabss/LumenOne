const express = require("express");
const router = express.Router();
const filesController = require("../controllers/filesController.js");
const { isAuthenticated } = require("../middleware/auth.js");
const {
    protectSensitiveFiles,
} = require("../middleware/protect-sensitive-files.js");
const path = require("path");

const getVolumesDir = () => path.join(__dirname, "../../storage/volumes");

router.get(
    "/web/manage/:id/edit/:file",
    isAuthenticated,
    protectSensitiveFiles(),
    filesController.getEditFile,
);

router.post(
    "/web/manage/:id/edit/:file",
    isAuthenticated,
    protectSensitiveFiles(),
    filesController.saveFile,
);

router.get(
    "/web/manage/:id/size",
    isAuthenticated,
    protectSensitiveFiles(),
    filesController.getFolderSize,
);

module.exports = router;
