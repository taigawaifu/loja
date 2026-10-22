import { createRouter } from "next-connect";
import controller from "../../../../infra/controller";
import user from "../../../../models/users";
import email from "../../../../infra/email";
const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const newUser = await user.create(request.body);
  return response.status(201).json(newUser);
}


async function postHandler(request, response) {
  const newUser = await user.create(request.body);

  await email.send({
    to: newUser.email,
    subject: "Bem-vindo à Loja",
    text: `Olá, ${newUser.username}! Seu cadastro foi recebido.`,
  });

  return response.status(201).json(newUser);
}