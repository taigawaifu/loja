import useSWR from "swr";
import styles from "../clientes/clientes.module.css";

async function fetchMyClient(url) {
  const response = await fetch(url);
  if (response.status === 401) return { unauthorized: true };

  const body = await response.json();
  if (!response.ok) return { error: body.message, action: body.action };

  return body;
}

function formatDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function isExpired(isoDate) {
  if (!isoDate) return false;
  return isoDate < new Date().toISOString().slice(0, 10);
}

async function logout() {
  await fetch("/api/v1/sessions", { method: "DELETE" });
  window.location.href = "/";
}

function Layout({ children }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1>Meus serviços</h1>
          <nav className={styles.nav}>
            <a href="/">Início</a>
            <a
              href="/"
              onClick={(event) => {
                event.preventDefault();
                logout();
              }}
            >
              Sair
            </a>
          </nav>
        </div>
      </header>
      <main className={styles.container}>{children}</main>
    </div>
  );
}

export default function MeusServicosPage() {
  const { data } = useSWR("/api/v1/user/client", fetchMyClient);

  if (!data) return <Layout>Carregando...</Layout>;

  if (data.unauthorized) {
    return (
      <Layout>
        <div className={styles.card}>
          <p>Você precisa entrar para ver seus serviços.</p>
          <a href="/login">Ir para o login</a>
        </div>
      </Layout>
    );
  }

  if (data.error) {
    return (
      <Layout>
        <div className={styles.card}>
          <p>{data.error}</p>
          {data.action && <p>{data.action}</p>}
        </div>
      </Layout>
    );
  }

  const services = (data.description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const expired = isExpired(data.warranty_until);

  return (
    <Layout>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Olá, {data.name}!</h2>

        <p>
          <strong>Garantia: </strong>
          {data.warranty_until ? (
            <span className={`${styles.badge} ${expired ? styles.expired : styles.valid}`}>
              {expired ? "vencida em" : "válida até"} {formatDate(data.warranty_until)}
            </span>
          ) : (
            "sem garantia registrada"
          )}
        </p>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Serviços realizados ({services.length})</h2>

        {services.length === 0 ? (
          <p className={styles.empty}>Nenhum serviço registrado ainda.</p>
        ) : (
          <ul className={styles.servicesList}>
            {services.map((service, index) => (
              <li key={index}>{service}</li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}