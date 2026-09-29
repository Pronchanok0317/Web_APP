import FoodContainer from './components/Food/FoodContainer.jsx';
import './App.css';

function App() {
  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Todo 2</p>
        <h1>Menu management</h1>
      </header>
      <FoodContainer />
    </main>
  );
}

export default App;
