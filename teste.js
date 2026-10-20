class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

function salvarUsuario(input) {
  if (!input) {
    throw new ValidationError("É necessário enviar o 'input'");
  }
  if (!input.username) {
    throw new ValidationError("error-name-undefined");
  }
  if (!input.age) {
    throw new ValidationError("gorilada");
  }
}

try {
  salvarUsuario({
    nome:"paulo"
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.statusCode, error.message);
  } else {
    console.log("erro desconhecido");
    console.log(error.stack);
  }
}