import { createRouter } from "next-connect";
import controller from "../../../../../infra/controller";
import clients from "../../../../../models/clients";

const router = createRouter();

router.use(controller.requireAuthentication, controller.requireAdmin);

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const updatedClient = await clients.linkUser(request.query.id, request.body.email);
  return response.status(200).json(updatedClient);
}