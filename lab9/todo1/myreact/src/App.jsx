import { useState } from 'react';
import './App.css';

function App() {
  const [isBlue, setIsBlue] = useState(false);
  const [text, setText] = useState('hello react');
  const [color, setColor] = useState('#d9468f');
  const [number, setNumber] = useState(1);

  return (
    <main className="parent">
      <h1>Todo 1 - Get start with React</h1>

      <section className="card">
        <h2>1. เปลี่ยนสี button และข้อความเมื่อกดปุ่ม</h2>
        <button
          className={isBlue ? 'blueButton' : 'RedButton'}
          onClick={() => setIsBlue(!isBlue)}
        >
          {isBlue ? 'go red' : 'go blue'}
        </button>
      </section>

      <section className="card">
        <h2>2. แสดงข้อความและสีตามที่กำหนด (onChange)</h2>
        <h3 style={{ color }}>{text || 'กรอกข้อความ'}</h3>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
      </section>

      <section className="card">
        <h2>3. แสดงตัวเลข เพิ่ม / ลด ตามการกดปุ่ม</h2>
        <h3 className="count-number">{number}</h3>
        <button className="RedButton" onClick={() => setNumber(number + 1)}>
          count up
        </button>
        <button className="blueButton" onClick={() => setNumber(number - 1)}>
          count down
        </button>
      </section>
    </main>
  );
}

export default App;
