import { InternalServerError, MethodNotAllowedError } from "./errors";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (error.statusCode && error.statusCode < 500) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({ cause: error });
  console.error(publicErrorObject);
  response.status(500).json(publicErrorObject);
}
import session from "../models/session";

function setSessionCookie(token, response) {
  const maxAgeInSeconds = session.EXPIRATION_IN_MILLISECONDS / 1000;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  response.setHeader(
    "Set-Cookie",
    `session_id=${token}; Max-Age=${maxAgeInSeconds}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  );
}

function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    "session_id=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
  );
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
