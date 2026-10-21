import { password } from "pg/lib/defaults";

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },
    password:{
     type: "varchar(60)",
     notNull: true,
    }
  });
};

export const down = false;