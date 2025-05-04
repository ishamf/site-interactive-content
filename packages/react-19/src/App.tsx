import './demo.css';
import { pages } from './pages';

function App() {
  return (
    <main>
      <h1>React 19 Component Testing Page</h1>
      <ul>
        {pages.map(({ title, slug }) => (
          <li key={slug}>
            <a href={`/${slug}`}>{title}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
