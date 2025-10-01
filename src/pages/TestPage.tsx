import { useState, useEffect } from 'react';

const TestPage = () => {
  const [message, setMessage] = useState('Carregando...');

  useEffect(() => {
    console.log('TestPage carregou');
    setMessage('Página de teste funcionando!');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{message}</h1>
        <p className="mt-4">Se você vê isso, os imports básicos estão funcionando.</p>
      </div>
    </div>
  );
};

export default TestPage;