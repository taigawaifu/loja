export const shorthands = undefined;

export const up = (pgm) => {
  pgm.addColumn("clients", {
    user_id: {
      type: "uuid",
      references: "users",
      onDelete: "SET NULL",
      unique: true,
    },
  });
};

export const down = false;
