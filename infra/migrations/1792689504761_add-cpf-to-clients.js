export const shorthands = undefined;

export const up = (pgm) => {
  pgm.addColumn("clients", {
    cpf: {
      type: "varchar(11)",
    },
  });
};

export const down = false;
