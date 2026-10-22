import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../infra/errors";

const EXPIRATION_IN_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function create(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: EXPIRATION_IN_SECONDS,
  });
}

function verify(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError({
      message: "Token inválido ou expirado.",
      action: "Faça o login novamente.",
      cause: error,
    });
  }
}

const token = {
  create,
  verify,
  EXPIRATION_IN_SECONDS,
};

export default token;