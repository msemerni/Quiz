import { Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../types/global';
require('dotenv').config();

const protectAccess = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).send({ status: "error", message: "unauthorized user" });
  }

  req.user = user;
  next();
};

module.exports = protectAccess;
