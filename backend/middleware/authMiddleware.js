import jwt from "jsonwebtoken";

export default function protect(req, res, next) {
  const header = req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : req.header("x-auth-token");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
