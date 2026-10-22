import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const response = await fetch("/api/v1/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.status !== 201) {
      const body = await response.json();
      setErrorMessage(body.message);
      return;
    }

    const userResponse = await fetch("/api/v1/user");
    const user = await userResponse.json();

    router.push(user.is_admin ? "/clientes" : "/");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>
          Loja
        </a>
      </header>

      <main className={styles.center}>
        <div className={styles.card}>
          <h1 className={styles.title}>Entrar</h1>
          <p className={styles.subtitle}>Acesse sua conta.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>
              E-mail
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className={styles.label}>
              Senha
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}

            <button type="submit" className={styles.button}>
              Entrar
            </button>
          </form>

          <p className={styles.footer}>
            Não tem conta?{" "}
            <a href="/cadastro" className={styles.link}>
              Cadastrar
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}