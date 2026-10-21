import { createRouter } from "next-connect";
import controller from "../../../../infra/controller";
import user from "../../../../models/users";
const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const newUser = await user.create(request.body);
  return response.status(201).json(newUser);
}
