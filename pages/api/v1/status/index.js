function status(request,response){
  response.status(200).json({chave: "Reposta servidor"});
}
export default status