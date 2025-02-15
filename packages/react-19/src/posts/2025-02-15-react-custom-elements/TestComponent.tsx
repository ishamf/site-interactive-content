import { useState } from 'react';
import { Button } from 'antd';

export const TestComponent = () => {
  const [counter, setCounter] = useState(0);

  return (
    <div className="flex items-center p-4 gap-4">
      <Button onClick={() => setCounter(counter + 1)}>Increment</Button>
      <span>Counter: {counter}</span>
    </div>
  );
};
