import bcrypt from "bcryptjs";
import database from "../infra/database";
import { UnauthorizedError } from "../infra/errors";

async function getAuthenticatedUser(email, password) {
  const result = await database.query({
    text: "SELECT id, username, email, password FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;",
    values: [email],
  });

  const userFound = result.rows[0];
  const passwordMatches =
    userFound && (await bcrypt.compare(password, userFound.password));

  if (!passwordMatches) {
    throw new UnauthorizedError({
      message: "Dados de autenticação não conferem.",
      action: "Verifique se o e-mail e a senha estão corretos.",
    });
  }

  return {
    id: userFound.id,
    username: userFound.username,
    email: userFound.email,
  };
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;