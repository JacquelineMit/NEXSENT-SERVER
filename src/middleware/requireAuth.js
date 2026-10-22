export function requireAuth(req, res, next) {
  console.log(req.cookies.token);
  if (req.cookies.token) {
    next();
    return;
  }
  return res.status(401).json({ error: "Unauthorized" });
}
