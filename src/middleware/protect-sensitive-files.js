const path = require("path");

const protectedFiles = ["php.ini"];
function protectSensitiveFiles() {
    return (req, res, next) => {
        const fileName = path.basename(req.path);
        const match = req.path.match(/\/web\/manage\/([^/]+)/);

        if (!match) {
            return next();
        }

        if (protectedFiles.includes(fileName)) {
            console.log("[MIDDLEWARE] BLOCKED (Sensitive File):", fileName);
            return res
                .status(403)
                .send(
                    "Error 403 - Access Denied. It is an error on your side, don't make an issue report on github.",
                );
        }
        next();
    };
}

module.exports = { protectSensitiveFiles };
