import { createRouter } from "next-connect";
import controller from "../../../../infra/controller";
import session from "../../../../models/session";
import user from "../../../../models/users";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const token = request.cookies.session_id;
  const sessionFound = await session.findOneValidByToken(token);
  const userFound = await user.findOneById(sessionFound.user_id);

  return response.status(200).json(userFound);
}