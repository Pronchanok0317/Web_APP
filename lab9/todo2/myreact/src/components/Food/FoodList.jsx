import FoodItem from './FoodItem.jsx';

function FoodList({ food, deleteItem, isAdmin }) {
  return (
    <div className="food-list">
      {food.map((item, index) => (
        <FoodItem
          key={`${item.name}-${index}`}
          item={item}
          isAdmin={isAdmin}
          deleteItem={() => deleteItem(index)}
        />
      ))}
    </div>
  );
}

export default FoodList;
