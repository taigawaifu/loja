import { createRouter } from "next-connect";
import controller from "../../../../infra/controller";
import authentication from "../../../../models/authentication";
import session from "../../../../models/session";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { email, password } = request.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(email, password);

  const newSession = await session.create(authenticatedUser.id);
  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(authenticatedUser);
}

async function deleteHandler(request, response) {
  const token = request.cookies.session_id;
  const sessionFound = await session.findOneValidByToken(token);

  await session.expireById(sessionFound.id);
  controller.clearSessionCookie(response);

  return response.status(200).json({ message: "Sessão encerrada." });
}