module.exports = function (req, res, next) {
  if (req.decodedToken.email == "admin@admin.ad") {
    next();
    return;
  }

  res.status(401).json({
    message: "Route only available via administrator access",
  });
  res.end();
};
