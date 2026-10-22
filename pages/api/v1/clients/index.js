import { createRouter } from "next-connect";
import controller from "../../../../infra/controller";
import clients from "../../../../models/clients";

const router = createRouter();

router.use(controller.requireAuthentication, controller.requireAdmin);

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const allClients = await clients.findAll();
  return response.status(200).json(allClients);
}

async function postHandler(request, response) {
  const newClient = await clients.create(request.body);
  return response.status(201).json(newClient);
}