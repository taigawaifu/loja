import styles from "../pages/clientes/clientes.module.css";

async function logout() {
  await fetch("/api/v1/sessions", { method: "DELETE" });
  window.location.href = "/";
}

export default function ClientesLayout({ title, wide = false, children }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`${styles.headerInner} ${wide ? styles.wide : ""}`}>
          <h1>{title}</h1>
          <nav className={styles.nav}>
            <a href="/clientes">Clientes</a>
            <a href="/clientes/novo">Novo cliente</a>
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
      <main className={`${styles.container} ${wide ? styles.wide : ""}`}>{children}</main>
    </div>
  );
}

export function AccessMessage({ data }) {
  if (data.unauthorized) {
    return (
      <div className={styles.card}>
        <p>Você precisa entrar para ver esta página.</p>
        <a href="/login">Ir para o login</a>
      </div>
    );
  }

  if (data.forbidden) {
    return (
      <div className={styles.card}>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className={styles.error}>Não foi possível carregar: {data.error}</p>
    </div>
  );
}