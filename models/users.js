import bcrypt from "bcryptjs";
import database from "../infra/database";

async function create({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await database.query({
    text: "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username;",
    values: [username, hashedPassword],
  });

  return result.rows[0];
}

const user = {
  create,
};

export default user;