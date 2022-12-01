import { NextFunction, Request, Response } from 'express';

const protectAccess = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).send({ status: "error", message: "unauthorized user" });
  }
  req.user = user;
  next();
};

module.exports = protectAccess;
