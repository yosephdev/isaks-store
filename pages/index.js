import Head from "next/head";
import styles from "../styles/Home.module.css";
import products from "../products.json";
import ProductCard from "../pages/ProductCard"

require("dotenv").config();

const SNIPCART_API_KEY = process.env.SNIPCART_API_KEY;
const SNIPCART_THEME_URL = process.env.SNIPCART_THEME_URL;

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Isaks Store</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://app.snipcart.com" />
        <link rel="preconnect" href="https://cdn.snipcart.com" />
        <link
          rel="stylesheet"
          href="https://cdn.snipcart.com/themes/v3.0.21/default/snipcart.css"
        />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <a href="#">Isaks Store</a>
        </h1>

        <p className={styles.description}>
          <a
            className="snipcart-checkout snipcart-summary"
            href="#"
            style={{ textDecoration: "none" }}
          >
            <strong>Cart:</strong>{" "}
            <span className="snipcart-total-price">$0.00</span>
          </a>
        </p>

        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard {...product} />
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>

      <script async src={SNIPCART_THEME_URL}></script>
      <div id="snipcart" data-api-key={SNIPCART_API_KEY} hidden></div>
    </div>
  );
}
