import { useState } from "react";
import useSWR from "swr";
import styles from "./clientes.module.css";

const emptyForm = {
  name: "",
  address: "",
  phone: "",
  warranty_until: "",
  description: "",
};

async function fetchClients(url) {
  const response = await fetch(url);
  if (response.status === 401) return { unauthorized: true };
  if (response.status === 403) return { forbidden: true };

  const body = await response.json();
  if (!response.ok) return { error: body.message };

  return body;
}

function formatDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function isExpired(isoDate) {
  if (!isoDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return isoDate < today;
}

async function logout() {
  await fetch("/api/v1/sessions", { method: "DELETE" });
  window.location.href = "/";
}

function Layout({ children }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Clientes</h1>
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
      </header>
      <main className={styles.container}>{children}</main>
    </div>
  );
}

export default function ClientesPage() {
  const { data, mutate } = useSWR("/api/v1/clients", fetchClients);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");

  if (!data) return <Layout>Carregando...</Layout>;

  if (data.unauthorized) {
    return (
      <Layout>
        <div className={styles.card}>
          <p>Você precisa entrar para ver esta página.</p>
          <a href="/">Ir para o login</a>
        </div>
      </Layout>
    );
  }

  if (data.forbidden) {
    return (
      <Layout>
        <div className={styles.card}>
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </Layout>
    );
  }

  if (data.error) {
    return (
      <Layout>
        <div className={styles.card}>
          <p className={styles.error}>Não foi possível carregar os clientes: {data.error}</p>
        </div>
      </Layout>
    );
  }

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const url = editingId ? `/api/v1/clients/${editingId}` : "/api/v1/clients";
    const method = editingId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const body = await response.json();
      setErrorMessage(body.message);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    mutate();
  }

  function handleEdit(client) {
    setEditingId(client.id);
    setErrorMessage("");
    setForm({
      name: client.name || "",
      address: client.address || "",
      phone: client.phone || "",
      warranty_until: client.warranty_until || "",
      description: client.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(client) {
    if (!confirm(`Excluir ${client.name}?`)) return;

    await fetch(`/api/v1/clients/${client.id}`, { method: "DELETE" });
    mutate();
  }

  function handleCancel() {
    setForm(emptyForm);
    setEditingId(null);
    setErrorMessage("");
  }

  const filteredClients = data.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Layout>
      <section className={styles.card}>
        <h2>{editingId ? "Editar cliente" : "Novo cliente"}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Nome
            <input name="name" value={form.name} onChange={handleChange} required className={styles.input} />
          </label>

          <label className={styles.label}>
            Endereço
            <input name="address" value={form.address} onChange={handleChange} className={styles.input} />
          </label>

          <div className={styles.row}>
            <label className={styles.label}>
              Telefone
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} className={styles.input} />
            </label>

            <label className={styles.label}>
              Garantia até
              <input
                name="warranty_until"
                type="date"
                value={form.warranty_until}
                onChange={handleChange}
                className={styles.input}
              />
            </label>
          </div>

          <label className={styles.label}>
            Descrição
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Descreva o serviço, o aparelho, observações..."
            />
          </label>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.actions}>
            <button type="submit" className={`${styles.button} ${styles.primary}`}>
              {editingId ? "Salvar alterações" : "Cadastrar"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className={`${styles.button} ${styles.secondary}`}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <div className={styles.listHeader}>
        <h2>Clientes ({data.length})</h2>
        <input
          className={styles.search}
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 && (
        <p className={styles.empty}>
          {data.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}
        </p>
      )}

      {filteredClients.map((client) => (
        <article key={client.id} className={`${styles.card} ${styles.client}`}>
          <h3 className={styles.clientName}>{client.name}</h3>
          <p className={styles.info}>Endereço: {client.address || "—"}</p>
          <p className={styles.info}>Telefone: {client.phone || "—"}</p>
          <p className={styles.info}>
            Garantia:{" "}
            {client.warranty_until ? (
              <span className={`${styles.badge} ${isExpired(client.warranty_until) ? styles.expired : styles.valid}`}>
                {isExpired(client.warranty_until) ? "vencida em" : "até"} {formatDate(client.warranty_until)}
              </span>
            ) : (
              "—"
            )}
          </p>

          {client.description && <p className={styles.description}>{client.description}</p>}

          <div className={styles.actions}>
            <button onClick={() => handleEdit(client)} className={`${styles.button} ${styles.secondary}`}>
              Editar
            </button>
            <button onClick={() => handleDelete(client)} className={`${styles.button} ${styles.danger}`}>
              Excluir
            </button>
          </div>
        </article>
      ))}
    </Layout>
  );
}