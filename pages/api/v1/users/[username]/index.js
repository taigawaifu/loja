import { createRouter } from "next-connect";
import controller from "../../../../../infra/controller";
import user from "../../../../../models/users";
import { ForbiddenError } from "../../../../../infra/errors";

const router = createRouter();

router.get(getHandler);
router.patch(controller.requireAuthentication, patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
}

async function patchHandler(request, response) {
  const loggedUser = request.context.user;
  const username = request.query.username;

  if (loggedUser.username.toLowerCase() !== username.toLowerCase()) {
    throw new ForbiddenError({
      message: "Você só pode editar o seu próprio usuário.",
    });
  }

  return response.status(200).json(loggedUser);
}