import { useState } from "react";
import useSWR from "swr";
import styles from "./clientes.module.css";

const emptyForm = {
  name: "",
  cpf: "",
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

function onlyDigits(value) {
  return (value || "").replace(/\D/g, "");
}

function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatDate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function getWarrantyStatus(isoDate) {
  if (!isoDate) return "none";

  const today = new Date().toISOString().slice(0, 10);
  const inThirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  if (isoDate < today) return "expired";
  if (isoDate <= inThirtyDays) return "soon";
  return "valid";
}

const warrantyLabels = {
  valid: "Em dia",
  soon: "Vence em breve",
  expired: "Vencida",
  none: "Sem garantia",
};

async function logout() {
  await fetch("/api/v1/sessions", { method: "DELETE" });
  window.location.href = "/";
}

function Layout({ children }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
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
        </div>
      </header>
      <main className={styles.container}>{children}</main>
    </div>
  );
}

function Stats({ clients }) {
  const counts = { valid: 0, soon: 0, expired: 0 };

  clients.forEach((client) => {
    const status = getWarrantyStatus(client.warranty_until);
    if (counts[status] !== undefined) counts[status] += 1;
  });

  return (
    <section className={styles.stats}>
      <div className={styles.stat}>
        <div className={styles.statValue}>{clients.length}</div>
        <div className={styles.statLabel}>Clientes cadastrados</div>
      </div>
      <div className={`${styles.stat} ${styles.statValid}`}>
        <div className={styles.statValue}>{counts.valid}</div>
        <div className={styles.statLabel}>Garantias em dia</div>
      </div>
      <div className={`${styles.stat} ${styles.statSoon}`}>
        <div className={styles.statValue}>{counts.soon}</div>
        <div className={styles.statLabel}>Vencem em 30 dias</div>
      </div>
      <div className={`${styles.stat} ${styles.statExpired}`}>
        <div className={styles.statValue}>{counts.expired}</div>
        <div className={styles.statLabel}>Garantias vencidas</div>
      </div>
    </section>
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
          <a href="/login">Ir para o login</a>
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
    const { name, value } = event.target;
    setForm({ ...form, [name]: name === "cpf" ? formatCpf(value) : value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const url = editingId ? `/api/v1/clients/${editingId}` : "/api/v1/clients";
    const method = editingId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cpf: onlyDigits(form.cpf) }),
    });

    if (!response.ok) {
      const body = await response.json();
      setErrorMessage(body.message);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setSearch("");
    mutate();
  }

  function handleEdit(client) {
    setEditingId(client.id);
    setErrorMessage("");
    setForm({
      name: client.name || "",
      cpf: formatCpf(client.cpf),
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

  const term = search.trim().toLowerCase();
  const termDigits = onlyDigits(search);

  const filteredClients = data.filter((client) => {
    if (!term) return true;

    const textMatch = [client.name, client.address]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));

    const digitsMatch =
      termDigits.length > 0 &&
      [client.cpf, client.phone]
        .filter(Boolean)
        .some((value) => onlyDigits(value).includes(termDigits));

    return textMatch || digitsMatch;
  });

  return (
    <Layout>
      <Stats clients={data} />

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{editingId ? "Editar cliente" : "Novo cliente"}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <label className={styles.label}>
              Nome
              <input name="name" value={form.name} onChange={handleChange} required className={styles.input} />
            </label>

            <label className={styles.label}>
              CPF
              <input
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                inputMode="numeric"
                placeholder="000.000.000-00"
                className={styles.input}
              />
            </label>
          </div>

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
              {editingId ? "Salvar alterações" : "Cadastrar cliente"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className={`${styles.button} ${styles.secondary}`}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <div className={styles.toolbar}>
        <h2>
          {term ? `${filteredClients.length} de ${data.length} clientes` : `${data.length} clientes`}
        </h2>
        <input
          className={styles.search}
          placeholder="Buscar por nome, CPF, telefone ou endereço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredClients.length === 0 && (
        <p className={styles.empty}>
          {data.length === 0 ? "Nenhum cliente cadastrado ainda." : "Nenhum cliente encontrado."}
        </p>
      )}

      <div className={styles.list}>
        {filteredClients.map((client) => {
          const status = getWarrantyStatus(client.warranty_until);

          return (
            <article key={client.id} className={styles.client}>
              <div className={styles.clientTop}>
                <div className={styles.avatar}>{client.name.charAt(0).toUpperCase()}</div>
                <div>
                  <h3 className={styles.clientName}>{client.name}</h3>
                  <span className={`${styles.badge} ${styles[status]}`}>
                    {warrantyLabels[status]}
                    {client.warranty_until && ` · ${formatDate(client.warranty_until)}`}
                  </span>
                </div>
              </div>

              <div className={styles.details}>
                <div><strong>CPF:</strong> {client.cpf ? formatCpf(client.cpf) : "—"}</div>
                <div><strong>Telefone:</strong> {client.phone || "—"}</div>
                <div><strong>Endereço:</strong> {client.address || "—"}</div>
              </div>

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
          );
        })}
      </div>
    </Layout>
  );
}