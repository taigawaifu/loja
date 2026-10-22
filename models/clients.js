import database from "../infra/database";
import { NotFoundError, ValidationError } from "../infra/errors";

const SELECT_FIELDS = `
  id, name, address, phone, description,
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
    text: `SELECT ${SELECT_FIELDS} FROM clients WHERE id = $1;`,
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
      INSERT INTO clients (name, address, phone, warranty_until, description)
      VALUES ($1, $2, $3, $4, $5)
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
      SET name = $1, address = $2, phone = $3, warranty_until = $4, description = $5
      WHERE id = $6
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

function validateAndPrepare({ name, address, phone, warranty_until, description } = {}) {
  if (!name || !name.trim()) {
    throw new ValidationError({
      message: "O nome é obrigatório.",
      action: "Preencha o nome do cliente.",
    });
  }

  return [
    name.trim(),
    address || null,
    phone || null,
    warranty_until || null,
    description || null,
  ];
}

function validateId(id) {
  const uuidPattern = /^[0-9a-f-]{36}$/i;

  if (!uuidPattern.test(id)) {
    throw new NotFoundError({ message: "Cliente não encontrado." });
  }
}

const clients = {
  findAll,
  findOneById,
  create,
  update,
  remove,
};

export default clients;