import database from "../../../../infra/database"
async function status(request,response){
    const updateAt = new Date().toISOString("pt-BR");
    const resultado = await database.query("SELECT version();")
    console.log(resultado)
  response.status(200).json({
    updated_at:null,
  });
}
export default status