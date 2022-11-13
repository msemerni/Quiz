const protectAccess = async (req, res, next) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).send({ status: "exception", message: "unauthorized user" });
  }
  req.user = user;
  next();
};

module.exports = protectAccess;
