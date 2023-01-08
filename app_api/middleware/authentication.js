var jwt = require("jsonwebtoken");
secret = "sEcReT KeY"

module.exports = function (req, res, next) {
  try {
    decoded = jwt.verify(req.headers.authorization.split(" ")[1], secret);
    req.decodedToken = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Authentication failed",
    });
    res.end();
  }
};
