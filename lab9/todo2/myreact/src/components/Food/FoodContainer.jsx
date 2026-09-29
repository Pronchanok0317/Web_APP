import { useEffect, useState } from 'react';
import FoodList from './FoodList.jsx';
import FoodForm from './FoodForm.jsx';

const defaultFood = [
  { name: 'cake', price: 35, isBestSeller: true },
  { name: 'bread', price: 25, isBestSeller: false },
  { name: 'milk', price: 15, isBestSeller: true },
  { name: 'donut', price: 45, isBestSeller: false },
  { name: 'cookie', price: 55, isBestSeller: true },
];

function FoodContainer() {
  const [food, setFood] = useState(defaultFood);
  const [mode, setMode] = useState(() => localStorage.getItem('mode') || 'user');

  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  const isAdmin = mode === 'admin';

  const deleteItem = (index) => {
    setFood(food.filter((item, foodIndex) => foodIndex !== index));
  };

  const addItem = (item) => {
    setFood([...food, item]);
  };

  return (
    <section className="card food-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Menu management</p>
          <h2>Our Menu</h2>
          <p className="hint">
            {isAdmin
              ? 'Admin mode: เพิ่มและลบรายการอาหารได้'
              : 'User mode: ดูรายการอาหารได้อย่างเดียว'}
          </p>
        </div>
        <button className="mode-button" onClick={() => setMode(isAdmin ? 'user' : 'admin')}>
          {isAdmin ? 'เปลี่ยนเป็น User' : 'เปลี่ยนเป็น Admin'}
        </button>
      </div>

      <FoodList food={food} deleteItem={deleteItem} isAdmin={isAdmin} />
      {isAdmin && <FoodForm addItem={addItem} />}
    </section>
  );
}

export default FoodContainer;
