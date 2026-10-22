import { useState } from "react";
import useSWR from "swr";
import ClientesLayout, { AccessMessage } from "../../components/clientesLayout";
import styles from "./clientes.module.css";
import { fetchJson, formatCpf, onlyDigits } from "../../lib/clientes";

const emptyForm = {
  name: "",
  cpf: "",
  address: "",
  phone: "",
  warranty_until: "",
  description: "",
};

export default function NovoClientePage() {
  const { data: user } = useSWR("/api/v1/user", fetchJson);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return <ClientesLayout title="Novo cliente">Carregando...</ClientesLayout>;

  if (user.unauthorized || user.error || !user.is_admin) {
    return (
      <ClientesLayout title="Novo cliente">
        <AccessMessage data={user.unauthorized || user.error ? user : { forbidden: true }} />
      </ClientesLayout>
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: name === "cpf" ? formatCpf(value) : value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);

    const response = await fetch("/api/v1/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, cpf: onlyDigits(form.cpf) }),
    });

    const body = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setErrorMessage(body.message);
      return;
    }

    setSuccessMessage(`${body.name} foi cadastrado com sucesso.`);
    setForm(emptyForm);
  }

  return (
    <ClientesLayout title="Novo cliente">
      <section className={styles.card}>
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
            Serviços realizados
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${styles.input} ${styles.textarea}`}
              placeholder={"Um serviço por linha. Exemplo:\n12/03 - Troca de antena\n20/05 - Ajuste de sinal"}
            />
          </label>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

          <div className={styles.actions}>
            <button type="submit" disabled={isSaving} className={`${styles.button} ${styles.primary}`}>
              {isSaving ? "Salvando..." : "Cadastrar cliente"}
            </button>
            <a href="/clientes" className={`${styles.button} ${styles.secondary}`}>
              Ver todos os clientes
            </a>
          </div>
        </form>
      </section>
    </ClientesLayout>
  );
}