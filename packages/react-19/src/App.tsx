// import './App.css';
import './entries/2025-test-react';

function App() {
  return (
    <>
      {/* @ts-expect-error custom element */}
      <xif-react-test-component></xif-react-test-component>
    </>
  );
}

export default App;
