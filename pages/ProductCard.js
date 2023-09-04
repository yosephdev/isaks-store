import styles from "../styles/Home.module.css";

export default function ProductCard({ id, image, title, description, price }) {
  return (
    <div key={id} className={styles.card}>
      <img src={image} alt={`Preview of ${title}`} />
      <h3>{title}</h3>
      <p>{description}</p>
      <p>${price}</p>
      <p>
        <button
          className="snipcart-add-item"
          data-item-id={id}
          data-item-image={image}
          data-item-name={title}
          data-item-url="/"
          data-item-price={price}
        >
          Add to Cart
        </button>
      </p>
    </div>
  );
}
