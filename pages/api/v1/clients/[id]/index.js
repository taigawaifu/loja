import { createRouter } from "next-connect";
import controller from "../../../../../infra/controller";
import clients from "../../../../../models/clients";

const router = createRouter();

router.use(controller.requireAuthentication, controller.requireAdmin);

router.get(getHandler);
router.patch(patchHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const client = await clients.findOneById(request.query.id);
  return response.status(200).json(client);
}

async function patchHandler(request, response) {
  const updatedClient = await clients.update(request.query.id, request.body);
  return response.status(200).json(updatedClient);
}

async function deleteHandler(request, response) {
  await clients.remove(request.query.id);
  return response.status(200).json({ message: "Cliente excluído." });
}