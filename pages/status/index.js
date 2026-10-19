import useSWR from "swr";

async function fecthApi(key) {
    const response = await fetch(key)
    const responseBody = await response.json()
    return responseBody
}
export default function statusPage(){
    
    return (<div>
        <h1>statusPage</h1>
        <UpdatedAt/>
        <DatabaseStatus/>

    </div>)
    
}

function UpdatedAt(){
    const {isLoading,data} = useSWR("/api/v1/status",fecthApi,{
        refreshInterval:200
    })

     let UpdatedAtText = "carregando"
     if(!isLoading && data){
        UpdatedAtText = new Date(data.updated_at).toLocaleString("pt-br")
     }
    return <div>Ultima atualização:{UpdatedAtText}</div>
}


function DatabaseStatus() {
  const { isLoading, data } = useSWR("/api/v1/status", fecthApi, {
    refreshInterval: 2000,
  });
    console.log("data:", data);
  let databaseStatusInformation = "Carregando...";

  if (!isLoading && data) {
    databaseStatusInformation = (
      <>
        <div>Versão: {data.dependencies.database.version}</div>
        <div>Conexões abertas: {data.dependencies.database.opened_connections}</div>
        <div>Conexões máximas: {data.dependencies.database.max_connections}</div>
      </>
    );
  }

  return (
    <>
      <h2>daba</h2>
      <div>{databaseStatusInformation}</div>
    </>
  );
}