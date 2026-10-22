import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/auth.module.css";

export default function CadastroPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não são iguais.");
      return;
    }

    setIsLoading(true);

    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const responseBody = await response.json();
    setIsLoading(false);

    if (response.status === 201) {
      router.push(`/cadastro/confirmar?email=${encodeURIComponent(email)}`);
      return;
    }

    setErrorMessage(responseBody.message);
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
          <h1 className={styles.title}>Criar conta</h1>
          <p className={styles.subtitle}>Preencha seus dados para se cadastrar.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label className={styles.label}>
              Nome de usuário
              <input
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </label>

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
              <span className={styles.hint}>Mínimo de 8 caracteres.</span>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </label>

            <label className={styles.label}>
              Confirmar senha
              <input
                className={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>

            {errorMessage && <p className={styles.error}>{errorMessage}</p>}

            <button type="submit" className={styles.button} disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <p className={styles.footer}>
            Já tem conta?{" "}
            <a href="/login" className={styles.link}>
              Entrar
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}