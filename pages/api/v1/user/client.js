import { createRouter } from "next-connect";
import controller from "../../../../infra/controller";
import clients from "../../../../models/clients";

const router = createRouter();

router.get(controller.requireAuthentication, getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const client = await clients.findOneByUserId(request.context.user.id);
  return response.status(200).json(client);
}