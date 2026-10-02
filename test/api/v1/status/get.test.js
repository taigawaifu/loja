import database from "infra/database.js"

async function get(response,request,){
  const result = await database.query('SELECT 1 + 1 as sum;')
  response.status(200).json({
    message:"servidor dando show",
    resultado:result.rows
  })
  database.end()
  console.log(result.rows)
}