import { createRouter } from "next-connect";
import controller from "../../../../infra/controller";
import authentication from "../../../../models/authentication";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const { email, password } = request.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(email, password);

  return response.status(201).json(authenticatedUser);
}