
import database from "../infra/database";
import { NotFoundError, ValidationError } from "../infra/errors";

const SELECT_FIELDS = `
  id, name, cpf, address, phone, description, user_id,
  TO_CHAR(warranty_until, 'YYYY-MM-DD') AS warranty_until
`;
async function findAll() {
  const result = await database.query(
    `SELECT ${SELECT_FIELDS} FROM clients ORDER BY name;`,
  );
  return result.rows;
}

async function findOneById(id) {
  validateId(id);

  const result = await database.query({
    text: `SELECT ${SELECT_FIELDS} FROM clients WHERE id = $1,;`,
    values: [id],
    
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({ message: "Cliente não encontrado." });
  }

  return result.rows[0];
}

async function create(data) {
  const values = validateAndPrepare(data);

  const result = await database.query({
    text: `
      INSERT INTO clients (name, cpf, address, phone, warranty_until, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${SELECT_FIELDS};
    `,
    values,
  });

  return result.rows[0];
}

async function update(id, data) {
  validateId(id);
  const values = validateAndPrepare(data);

  const result = await database.query({
    text: `
      UPDATE clients
      SET name = $1, cpf = $2, address = $3, phone = $4, warranty_until = $5, description = $6
      WHERE id = $7
      RETURNING ${SELECT_FIELDS};
    `,
    values: [...values, id],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({ message: "Cliente não encontrado." });
  }

  return result.rows[0];
}

async function remove(id) {
  validateId(id);

  const result = await database.query({
    text: "DELETE FROM clients WHERE id = $1;",
    values: [id],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({ message: "Cliente não encontrado." });
  }
}

function validateAndPrepare({ name, cpf, address, phone, warranty_until, description } = {}) {
  if (!name || !name.trim()) {
    throw new ValidationError({
      message: "O nome é obrigatório.",
      action: "Preencha o nome do cliente.",
    });
  }

  const cpfDigits = cpf ? String(cpf).replace(/\D/g, "") : "";

  if (cpfDigits && !isValidCpf(cpfDigits)) {
    throw new ValidationError({
      message: "O CPF informado não é válido.",
      action: "Confira os números do CPF.",
    });
  }

  return [
    name.trim(),
    cpfDigits || null,
    address || null,
    phone || null,
    warranty_until || null,
    description || null,
  ];
}

function isValidCpf(digits) {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  for (let position = 9; position < 11; position++) {
    let sum = 0;

    for (let i = 0; i < position; i++) {
      sum += Number(digits[i]) * (position + 1 - i);
    }

    const checkDigit = ((sum * 10) % 11) % 10;

    if (checkDigit !== Number(digits[position])) {
      return false;
    }
  }

  return true;
}

function validateId(id) {
  const uuidPattern = /^[0-9a-f-]{36}$/i;

  if (!uuidPattern.test(id)) {
    throw new NotFoundError({ message: "Cliente não encontrado." });
  }
}
async function linkUser(clientId, userEmail) {
  validateId(clientId);

  const userResult = await database.query({
    text: "SELECT id FROM users WHERE LOWER(email) = LOWER($1);",
    values: [userEmail],
  });

  if (userResult.rowCount === 0) {
    throw new NotFoundError({
      message: "Nenhuma conta do site foi encontrada com esse e-mail.",
      action: "Peça para a pessoa criar a conta no site primeiro.",
    });
  }

  const result = await database.query({
    text: `
      UPDATE clients SET user_id = $1
      WHERE id = $2
      RETURNING ${SELECT_FIELDS};
    `,
    values: [userResult.rows[0].id, clientId],
  });

  if (result.rowCount === 0) {
    throw new NotFoundError({ message: "Cliente não encontrado." });
  }

  return result.rows[0];
}

const clients = {
  findAll,
  findOneById,
  create,
  update,
  remove,
  linkUser
};

export default clients;