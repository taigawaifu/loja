import { InternalServerError, MethodNotAllowedError,ForbiddenError } from "./errors";
import session from "../models/session";
import user from "../models/users";

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

async function requireAuthentication(request, response, next) {
  const token = request.cookies.session_id;
  const sessionFound = await session.findOneValidByToken(token);
  const userFound = await user.findOneById(sessionFound.user_id);

  request.context = { user: userFound };

  return next();
}
async function requireAdmin(request, response, next) {
  if (!request.context?.user?.is_admin) {
    throw new ForbiddenError({
      message: "Você não possui permissão para acessar esta área.",
    });
  }

  return next();
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  requireAuthentication,
  requireAdmin
};

export default controller;