const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
