function FoodItem({ item, isAdmin, deleteItem }) {
  return (
    <article className={item.isBestSeller ? 'food-item best-seller' : 'food-item'}>
      <div>
        <h3>{item.name}</h3>
        <p>{item.price} baht</p>
      </div>
      {item.isBestSeller && <span className="badge">Best Seller</span>}
      {isAdmin && (
        <button className="delete-button" onClick={deleteItem}>
          Del
        </button>
      )}
    </article>
  );
}

export default FoodItem;
