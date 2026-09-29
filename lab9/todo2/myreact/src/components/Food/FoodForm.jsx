import { useState } from 'react';

const blankInput = {
  name: '',
  price: '',
  isBestSeller: 'true',
};

function FoodForm({ addItem }) {
  const [inputs, setInputs] = useState(blankInput);

  function handleChange(event) {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newFood = {
      name: inputs.name.trim(),
      price: Number(inputs.price),
      isBestSeller: inputs.isBestSeller === 'true',
    };

    if (!newFood.name || !newFood.price) {
      return;
    }

    addItem(newFood);
    setInputs(blankInput);
  }

  return (
    <form className="food-form" onSubmit={handleSubmit}>
      <h3>Add menu</h3>
      <label>
        Name
        <input
          type="text"
          name="name"
          value={inputs.name}
          onChange={handleChange}
          placeholder="เช่น brownie"
        />
      </label>
      <label>
        Price
        <input
          type="number"
          name="price"
          min="1"
          value={inputs.price}
          onChange={handleChange}
          placeholder="เช่น 49"
        />
      </label>
      <label>
        Type
        <select name="isBestSeller" value={inputs.isBestSeller} onChange={handleChange}>
          <option value="true">BestSeller</option>
          <option value="false">Normal</option>
        </select>
      </label>
      <button disabled={inputs.name.trim() === '' || inputs.price === ''}>Add menu</button>
    </form>
  );
}

export default FoodForm;
