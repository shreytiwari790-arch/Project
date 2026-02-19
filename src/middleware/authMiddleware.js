const jwt = require("jsonwebtoken");
const UserModal = require("../modals/UserModal");

module.exports = async function (req, res, next) {
  console.log("===== AUTH MIDDLEWARE HIT =====");

  const authHeader = req.headers.authorization;
  console.log("AUTH HEADER:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Login First");
  }

  const token = authHeader.split(" ")[1];
  console.log("TOKEN EXTRACTED:", token);

  try {
    const decoded = jwt.verify(token, process.env.MY_SECRET);
    console.log("DECODED:", decoded);

    const user = await UserModal.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).send("Invalid Token");
  }
};
