// middleware/loginActivity.js
const db = require("../../db.js");
const useragent = require("useragent");

function loginActivity(userId, activity, req) {
  return (res, next) => {
    try {
      const agent = useragent.parse(req.headers["user-agent"]);
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.connection.remoteAddress;

      db.run(
        `INSERT INTO users_activity (user_id, activity, browser, ip, os) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, activity, agent.family, ip, agent.os.toString()],
        (err) => {
          if (err) console.error("Erreur loginActivity:", err.message);
        }
      );
    } catch (e) {
      console.error("Erreur middleware loginActivity:", e.message);
    }
    next();
  };
}

module.exports = { loginActivity };
