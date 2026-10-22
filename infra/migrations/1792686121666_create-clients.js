export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("clients", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    name: {
      type: "varchar(120)",
      notNull: true,
    },
    address: {
      type: "varchar(255)",
    },
    phone: {
      type: "varchar(30)",
    },
    warranty_until: {
      type: "date",
    },
    description: {
      type: "text",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });
};

export const down = false;