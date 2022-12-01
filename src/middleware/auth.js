import { NextFunction, Request, Response } from 'express';
import { IGetUserAuthInfoRequest } from "../types/global"

const protectAccess = async (req, res, next) => {
  const { user } = req.session;

  if (!user) {
    return res.status(401).send({ status: "error", message: "unauthorized user" });
  }
  req.user = user;
  next();
};

module.exports = protectAccess;
