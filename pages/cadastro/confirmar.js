import { useRouter } from "next/router";
import styles from "../../styles/auth.module.css";

export default function ConfirmarPage() {
  const router = useRouter();
  const { email } = router.query;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>
          Loja
        </a>
      </header>

      <main className={styles.center}>
        <div className={styles.card}>
          <h1 className={styles.title}>Confira seu e-mail</h1>
          <p className={styles.subtitle}>
            Enviamos um link de ativação para <strong>{email}</strong>.
          </p>
          <p>Clique no link para ativar sua conta e depois faça o login.</p>

          <p className={styles.footer}>
            <a href="/login" className={styles.link}>
              Ir para o login
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}