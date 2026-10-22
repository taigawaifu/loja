import { useEffect, useState } from "react";
import useSWR from "swr";
import Gilbertinho from "../components/Gilbertinho";
import styles from "./index.module.css";

const store = {
  name: "TEC-SAT",
  headline: "Assistência de antena e aparelhos",
  subtitle: "Atendimento de confiança, peças de qualidade e garantia em todos os serviços.",
  whatsapp: "5551997414445",
  whatsappMessage: "Olá, Gilberto! Vim pelo site da TEC-SAT e gostaria de um orçamento.",
  heroImages: ["Antena.jpg", "INSTALADOR.JPG", "tvbox.jpg"],
  services: [
    { title: "Consertos", text: "Diagnóstico e reparo com orçamento antes de começar." },
    { title: "Peças", text: "Peças de qualidade, com procedência e garantia." },
    { title: "Garantia", text: "Todo serviço sai com garantia registrada no nosso sistema." },
  ],
  address: "Av.italia 2230",
  phone: "(51) 997414445",
  hours: "Segunda a sexta, das 9h às 18h",
};

const whatsappLink = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(store.whatsappMessage)}`;

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
      {user.is_admin ? (
        <a href="/clientes" className={`${styles.button} ${styles.primary}`}>
          Gerenciar clientes
        </a>
      ) : (
        <a href="/meus-servicos" className={`${styles.button} ${styles.primary}`}>
          Meus serviços
        </a>
      )}
      <button onClick={handleLogout} className={`${styles.button} ${styles.outline}`}>
        Sair
      </button>
    </div>
  );
}

function HeroSlides() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (store.heroImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((index) => (index + 1) % store.heroImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {store.heroImages.map((image, index) => (
        <div
          key={image}
          className={`${styles.heroSlide} ${index === current ? styles.heroSlideActive : ""}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      <div className={styles.heroOverlay} />
      <SlideDots current={current} onSelect={setCurrent} />
    </>
  );
}

function SlideDots({ current, onSelect }) {
  if (store.heroImages.length <= 1) return null;

  return (
    <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, zIndex: 2 }}>
      <div className={styles.dots} style={{ justifyContent: "center", marginTop: 0 }}>
        {store.heroImages.map((image, index) => (
          <button
            key={image}
            aria-label={`Ver foto ${index + 1}`}
            className={`${styles.dot} ${index === current ? styles.dotActive : ""}`}
            onClick={() => onSelect(index)}
          />
        ))}
      </div>
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
        <HeroSlides />

        <div className={styles.heroInner}>
          <div>
            <h1>{store.headline}</h1>
            <p>{store.subtitle}</p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
              Falar no WhatsApp
            </a>
          </div>

          <div className={styles.mascot}>
            <div className={styles.bubble}>Oi! Eu sou o Gilbertinho!</div>
            <Gilbertinho size={200} />
          </div>
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
            <li>Endereço: {store.address}</li>
            <li>Telefone: {store.phone}</li>
            <li>Horário: {store.hours}</li>
          </ul>
        </div>
      </section>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} {store.name}. Todos os direitos reservados.
      </footer>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.whatsappButton} ${styles.whatsappFloat}`}
        aria-label="Falar no WhatsApp"
      >
        WhatsApp
      </a>
    </div>
  );
}