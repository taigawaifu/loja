# loja

TEC-SAT — Sistema da loja

Site e sistema de gestão da TEC-SAT, a loja de assistência de antenas e aparelhos do meu avô.

O projeto nasceu para resolver uma necessidade real da loja: organizar o cadastro de clientes, acompanhar as garantias dos serviços e dar à loja uma presença na internet, com contato direto pelo WhatsApp.

Também foi a forma que encontrei de colocar em prática o que venho estudando de JavaScript e Node.js, usando o Next.js e aprendendo, no caminho, conceitos novos para mim, como migrations, testes automatizados com Jest, sessões com cookies e deploy em nuvem.

Funcionalidades

Para os visitantes

Página inicial com a apresentação da loja, fotos e os serviços oferecidos
Botão de contato que abre uma conversa no WhatsApp com a mensagem já escrita
Cadastro e login de usuários

Para o administrador (área restrita)

Cadastro, edição e exclusão de clientes (CRUD)
Registro de nome, CPF, endereço, telefone, data de garantia e serviços realizados
Validação de CPF pelos dígitos verificadores
Busca por nome, CPF, telefone ou endereço
Resumo com o total de clientes e a situação das garantias (em dia, vencendo em 30 dias e vencidas)
Vínculo entre o cadastro do cliente e a conta dele no site

Segurança

Senhas armazenadas com hash (bcrypt), nunca em texto puro
Sessões guardadas no banco e enviadas em cookie HttpOnly
Rotas protegidas por autenticação (401) e por permissão de administrador (403)
Consultas SQL parametrizadas, protegendo contra SQL injection
Erros padronizados, sem expor detalhes internos do servidor
Tecnologias
Área	Tecnologia
Front-end	Next.js (Pages Router), React, SWR, CSS Modules
Back-end	Node.js, rotas de API do Next.js, next-connect
Banco de dados	PostgreSQL, node-pg-migrate
Autenticação	bcryptjs, sessões com cookies
E-mail	Nodemailer (Mailpit em desenvolvimento)
Testes	Jest (testes de integração)
Infraestrutura	Docker, Vercel, Neon
Estrutura do projeto
├── components/       Componentes React reaproveitáveis
├── infra/
│   ├── migrations/   Histórico de alterações do banco
│   ├── scripts/      Scripts auxiliares (ex.: aguardar o Postgres)
│   ├── compose.yaml  Serviços do Docker (Postgres e Mailpit)
│   ├── controller.js Tratamento de erros e autenticação das rotas
│   ├── database.js   Conexão com o banco
│   ├── email.js      Envio de e-mails
│   └── errors.js     Classes de erro personalizadas
├── models/           Regras de negócio e consultas ao banco
├── pages/
│   ├── api/v1/       Rotas da API
│   └── ...           Páginas do site
├── public/           Imagens e arquivos estáticos
├── styles/           Estilos compartilhados
└── test/             Testes de integração

A organização separa as responsabilidades: as rotas recebem a requisição e respondem, os models concentram as regras e as consultas, e a infra cuida de banco, erros e autenticação.

Como rodar localmente
Pré-requisitos
Node.js (versão LTS)
Docker
Passo a passo
Instale as dependências:
bash
   npm install
Crie o arquivo .env.development na raiz do projeto:
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=local_user
   POSTGRES_DB=local_db
   POSTGRES_PASSWORD=local_password
   DATABASE_URL=postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

   EMAIL_SMTP_HOST=localhost
   EMAIL_SMTP_PORT=1025
   EMAIL_FROM=Loja <contato@loja.local>
   WEBSERVER_URL=http://localhost:3000
Suba os serviços e o servidor:
bash
   npm run dev:full
Aplique as migrations:
bash
   npm run migration:up
Acesse http://localhost:3000. Os e-mails enviados em desenvolvimento aparecem em http://localhost:8025.
Tornando um usuário administrador

Por segurança, não existe rota para virar administrador. Depois de criar a conta pelo site, a permissão é dada direto no banco:

sql
UPDATE users SET is_admin = true WHERE email = 'email@exemplo.com';
Scripts
Comando	O que faz
npm run dev:full	Sobe o Docker, aguarda o Postgres e inicia o Next.js
npm run test	Roda todos os testes
npm run test:watch	Roda os testes a cada alteração
npm run migration:create nome	Cria um novo arquivo de migration
npm run migration:up	Aplica as migrations pendentes
npm run build	Gera a versão de produção
API
Método	Rota	Acesso	Descrição
GET	/api/v1/status	Público	Situação do sistema e do banco
GET / POST	/api/v1/migrations	—	Lista ou aplica migrations pendentes
POST	/api/v1/users	Público	Cria um usuário
GET	/api/v1/users/[username]	Público	Busca um usuário pelo nome
POST	/api/v1/sessions	Público	Faz login
DELETE	/api/v1/sessions	Logado	Faz logout
GET	/api/v1/user	Logado	Dados do usuário logado
GET / POST	/api/v1/clients	Admin	Lista ou cadastra clientes
GET / PATCH / DELETE	/api/v1/clients/[id]	Admin	Consulta, edita ou exclui um cliente
POST	/api/v1/clients/[id]/link	Admin	Vincula um cliente à conta do site
Deploy
Hospedagem: Vercel, com deploy automático a cada push. A branch main vai para produção, e as demais geram deploys de Preview.
Banco de dados: Neon (PostgreSQL), com bancos separados para produção e Preview.
Migrations em produção: após o deploy, são aplicadas com um POST em /api/v1/migrations.
O que aprendi
Estruturar uma aplicação em camadas (rotas, models e infraestrutura)
Versionar o banco de dados com migrations
Escrever testes de integração e preparar o banco para cada execução
Implementar autenticação com sessões, cookies e hash de senha
Diferenciar autenticação (quem é você) de autorização (o que você pode fazer)
Tratar erros de forma padronizada, com status HTTP corretos
Usar variáveis de ambiente diferentes para desenvolvimento, Preview e produção
Rodar o banco em Docker e publicar a aplicação na Vercel
Próximos passos
 Confirmação de e-mail no cadastro
 Tabela de serviços, com data e garantia para cada serviço
 Área "Meus serviços" para o cliente consultar o próprio histórico
 Recuperação de senha ("Esqueci minha senha")
 Testes para as rotas de clientes
