import useSWR from "swr";
import styles from "./index.module.css";

const store = {
  name: "Loja",
  headline: "Conserto e assistência com garantia",
  subtitle: "Atendimento de confiança, peças de qualidade e garantia em todos os serviços.",
  services: [
    { title: "Consertos", text: "Diagnóstico e reparo com orçamento antes de começar." },
    { title: "Peças", text: "Peças de qualidade, com procedência e garantia." },
    { title: "Garantia", text: "Todo serviço sai com garantia registrada no nosso sistema." },
  ],
  address: "Rua Exemplo, 123 - Centro",
  phone: "(51) 99999-9999",
  hours: "Segunda a sexta, das 9h às 18h",
};

async function fetchUser(url) {
  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
}

function UserMenu() {
  const { data: user, isLoading, mutate } = useSWR("/api/v1/user", fetchUser);

  async function handleLogout() {
    await fetch("/api/v1/sessions", { method: "DELETE" });
    mutate(null);
  }

  if (isLoading) return null;

  if (!user) {
    return (
      <div className={styles.menu}>
        <a href="/login" className={styles.link}>
          Entrar
        </a>
        <a href="/cadastro" className={`${styles.button} ${styles.primary}`}>
          Cadastrar
        </a>
      </div>
    );
  }

  return (
    <div className={styles.menu}>
      <span className={styles.greeting}>Olá, {user.username}</span>
      {user.is_admin && (
        <a href="/clientes" className={`${styles.button} ${styles.primary}`}>
          Gerenciar clientes
        </a>
      )}
      <button onClick={handleLogout} className={`${styles.button} ${styles.outline}`}>
        Sair
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.logo}>
            {store.name}
          </a>
          <UserMenu />
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>{store.headline}</h1>
          <p>{store.subtitle}</p>
          <a href="#contato" className={`${styles.button} ${styles.heroButton}`}>
            Fale com a gente
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <h2>O que fazemos</h2>
        <div className={styles.grid}>
          {store.services.map((service) => (
            <div key={service.title} className={styles.serviceCard}>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contato" className={styles.contact}>
        <div className={styles.section}>
          <h2>Contato</h2>
          <ul className={styles.contactList}>
            <li>Av.italia 2230:</li>
            <li>51 999741-4445:</li>
            <li>09:00-12:00-14:00-18:00</li>
          </ul>
        </div>
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} {store.name}. Todos os direitos reservados.
      </footer>
    </div>
  );
}