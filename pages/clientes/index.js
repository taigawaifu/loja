import { useState } from "react";
import useSWR from "swr";
import ClientesLayout, { AccessMessage } from "../../components/clientesLayout";
import styles from "./clientes.module.css";
import { fetchJson, formatCpf, formatDate, getWarrantyStatus, onlyDigits } from "../../lib/clientes";

const columns = [
  { key: "name", label: "Nome" },
  { key: "cpf", label: "CPF" },
  { key: "phone", label: "Telefone" },
  { key: "address", label: "Endereço" },
  { key: "warranty_until", label: "Garantia até" },
  { key: "description", label: "Serviços / observações" },
];

function displayValue(client, field) {
  if (field === "cpf") return client.cpf ? formatCpf(client.cpf) : "";

  if (field === "warranty_until") {
    if (!client.warranty_until) return "";
    const status = getWarrantyStatus(client.warranty_until);
    return <span className={`${styles.badge} ${styles[status]}`}>{formatDate(client.warranty_until)}</span>;
  }

  if (field === "description") {
    return (client.description || "").split("\n").filter(Boolean).join(" · ");
  }

  return client[field];
}

function EditableCell({ client, field, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const original = client[field] || "";

  function startEditing() {
    setValue(field === "cpf" ? formatCpf(original) : original);
    setEditing(true);
  }

  async function finishEditing() {
    setEditing(false);

    const newValue = field === "cpf" ? onlyDigits(value) : value;
    if (newValue === original) return;

    setSaving(true);
    await onSave(client, field, newValue);
    setSaving(false);
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setEditing(false);
      return;
    }

    if (event.key === "Enter" && field !== "description") {
      event.preventDefault();
      event.target.blur();
    }
  }

  if (editing) {
    const inputProps = {
      autoFocus: true,
      value,
      onChange: (event) => setValue(field === "cpf" ? formatCpf(event.target.value) : event.target.value),
      onBlur: finishEditing,
      onKeyDown: handleKeyDown,
    };

    if (field === "description") {
      return <textarea {...inputProps} className={`${styles.cellInput} ${styles.cellTextarea}`} />;
    }

    return (
      <input
        {...inputProps}
        type={field === "warranty_until" ? "date" : "text"}
        className={styles.cellInput}
      />
    );
  }

  const shown = displayValue(client, field);

  return (
    <div
      className={`${styles.cell} ${saving ? styles.saving : ""}`}
      onClick={startEditing}
      title="Clique para editar"
    >
      {shown || <span className={styles.placeholder}>—</span>}
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
  const { data, mutate } = useSWR("/api/v1/clients", fetchJson);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  if (!data) return <ClientesLayout title="Clientes" wide>Carregando...</ClientesLayout>;

  if (data.unauthorized || data.forbidden || data.error) {
    return (
      <ClientesLayout title="Clientes" wide>
        <AccessMessage data={data} />
      </ClientesLayout>
    );
  }

  async function handleSave(client, field, value) {
    const payload = {
      name: client.name,
      cpf: client.cpf || "",
      address: client.address || "",
      phone: client.phone || "",
      warranty_until: client.warranty_until || "",
      description: client.description || "",
      [field]: value,
    };

    const response = await fetch(`/api/v1/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.json();
      alert(body.message);
    }

    mutate();
  }

  async function handleDelete(client) {
    if (!confirm(`Excluir ${client.name}? Essa ação não pode ser desfeita.`)) return;

    await fetch(`/api/v1/clients/${client.id}`, { method: "DELETE" });
    mutate();
  }

  async function handleLink(client) {
    const userEmail = prompt(`E-mail da conta do site de ${client.name}:`);
    if (!userEmail) return;

    const response = await fetch(`/api/v1/clients/${client.id}/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });

    if (!response.ok) {
      const body = await response.json();
      alert(body.message);
      return;
    }

    mutate();
  }

  function handleSort(key) {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const term = search.trim().toLowerCase();
  const termDigits = onlyDigits(search);

  const visibleClients = data
    .filter((client) => {
      if (!term) return true;

      const textMatch = [client.name, client.address, client.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));

      const digitsMatch =
        termDigits.length > 0 &&
        [client.cpf, client.phone]
          .filter(Boolean)
          .some((value) => onlyDigits(value).includes(termDigits));

      return textMatch || digitsMatch;
    })
    .sort((a, b) => {
      const valueA = a[sortKey] || "";
      const valueB = b[sortKey] || "";

      if (!valueA && valueB) return 1;
      if (valueA && !valueB) return -1;

      const comparison = valueA.localeCompare(valueB, "pt-BR");
      return sortDirection === "asc" ? comparison : -comparison;
    });

  return (
    <ClientesLayout title="Clientes" wide>
      <Stats clients={data} />

      <div className={styles.toolbar}>
        <h2>{term ? `${visibleClients.length} de ${data.length} clientes` : `${data.length} clientes`}</h2>
        <input
          className={styles.search}
          placeholder="Buscar por nome, CPF, telefone, endereço ou serviço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <p className={styles.hint}>
        Clique numa célula para alterar. <strong>Enter</strong> salva, <strong>Esc</strong> cancela. Clique no título
        da coluna para ordenar.
      </p>

      {visibleClients.length === 0 ? (
        <p className={styles.empty}>
          {data.length === 0 ? (
            <>
              Nenhum cliente cadastrado ainda. <a href="/clientes/novo">Cadastrar o primeiro</a>
            </>
          ) : (
            "Nenhum cliente encontrado."
          )}
        </p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} onClick={() => handleSort(column.key)}>
                    {column.label} {sortKey === column.key ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                  </th>
                ))}
                <th>Conta no site</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visibleClients.map((client) => (
                <tr key={client.id}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <EditableCell client={client} field={column.key} onSave={handleSave} />
                    </td>
                  ))}
                  <td>
                    <div className={styles.cell}>
                      {client.user_email ? (
                        client.user_email
                      ) : (
                        <button onClick={() => handleLink(client)} className={styles.smallButton}>
                          Vincular
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.cell}>
                      <button
                        onClick={() => handleDelete(client)}
                        className={`${styles.smallButton} ${styles.smallDanger}`}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ClientesLayout>
  );
}