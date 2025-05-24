import '@/App.css';

import { useState } from 'react';

import viteLogo from '/vite.svg';
import reactLogo from '@/assets/react.svg';
import { Modal } from '@/Modal';
import { Button } from '@/shared/components/ui/button';

export function App() {
  const [count, setCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="mb-8 flex justify-center space-x-4">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img
            src={viteLogo}
            className="h-16 w-16 transition-transform hover:scale-110"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img
            src={reactLogo}
            className="animate-spin-slow h-16 w-16 hover:animate-none"
            alt="React logo"
          />
        </a>
      </div>
      <Button
        className="my-4 rounded-lg bg-green-500 font-bold"
        onClick={() => setIsModalOpen(true)}
      >
        Modal 열기
      </Button>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
      <h1 className="mb-4 text-4xl font-bold text-gray-800">Vite + React</h1>
      <h1 className="mb-2 text-3xl font-bold text-blue-600 underline">
        Hello tailwindcss!
      </h1>
      <h1 className="mb-4 text-xl font-bold text-green-600 underline">
        테일윈드 적용 테스트!
      </h1>
      <Button className="mb-6 rounded bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700">
        shadcn/ui
      </Button>
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="mb-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          count is {count}
        </button>
        <p className="text-gray-700">
          Edit <code className="rounded bg-gray-200 p-1">src/App.tsx</code> and
          save to test HMR
        </p>
      </div>
      <p className="text-sm text-gray-500 transition-colors hover:text-gray-700">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}
