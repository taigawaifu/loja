import bcrypt from "bcryptjs";
import database from "../infra/database";
import { NotFoundError, ValidationError } from "../infra/errors";

const PUBLIC_FIELDS = "id, username, email, is_admin";

async function create({ username, email, password }) {
  validateEmailFormat(email);
  await validateUniqueEmail(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await database.query({
    text: `
      INSERT INTO users (username, email, password)
      VALUES ($1, $2, $3)
      RETURNING ${PUBLIC_FIELDS};
    `,
    values: [username, email.toLowerCase(), hashedPassword],
  });

  return result.rows[0];
}

async function findOneByUsername(username) {
  const result = await database.query({
    text: `SELECT ${PUBLIC_FIELDS} FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1;`,
    values: [username],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username está digitado corretamente.",
    });
  }

  return result.rows[0];
}

async function findOneById(id) {
  const result = await database.query({
    text: `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1 LIMIT 1;`,
    values: [id],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({ message: "Usuário não encontrado." });
  }

  return result.rows[0];
}

function validateEmailFormat(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailPattern.test(email)) {
    throw new ValidationError({
      message: "O e-mail informado não é válido.",
      action: "Envie um e-mail no formato nome@dominio.com.",
    });
  }
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: "SELECT email FROM users WHERE LOWER(email) = LOWER($1);",
    values: [email],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O e-mail informado já está sendo utilizado.",
      action: "Utilize outro e-mail para realizar o cadastro.",
    });
  }
}

const user = {
  create,
  findOneByUsername,
  findOneById,
};

export default user;