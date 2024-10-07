// app/page.js
'use client'; // Indica que este es un componente cliente

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState('procesar');
  const [newItem, setNewItem] = useState('');
  const [tasks, setTasks] = useState({
    procesar: [],
    segmentar: []
  });
  const [showModal, setShowModal] = useState(false);

  const addItem = () => {
    if (newItem.trim() === '') return;
    setTasks({
      ...tasks,
      [activeTab]: [...tasks[activeTab], newItem]
    });
    setNewItem('');
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between">
          <div className="text-xl font-bold text-black">Landing Page</div>
          <div>
            <button
              className={`px-4 py-2 rounded text-black ${
                activeTab === 'procesar' ? 'bg-blue-500 text-black' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('procesar')}
            >
              Procesar
            </button>
            <button
              className={`ml-2 px-4 py-2 rounded text-black ${
                activeTab === 'segmentar' ? 'bg-blue-500 text-black' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('segmentar')}
            >
              Segmentar
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4 text-black">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
        <button
          className="bg-blue-500 text-black px-4 py-2 rounded mb-4"
          onClick={() => setShowModal(true)}
        >
          Nuevo Ítem
        </button>
        {tasks[activeTab].length === 0 ? (
          <p className="text-black">No hay ítems en esta sección.</p>
        ) : (
          <ul className="list-disc pl-5 text-black">
            {tasks[activeTab].map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center text-black">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl mb-4">Añadir Nuevo Ítem a {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <input
              type="text"
              className="border p-2 w-full mb-4"
              placeholder="Descripción del Ítem"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button className="bg-blue-500 text-black px-4 py-2 rounded" onClick={addItem}>
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer (Opcional) */}
      <footer className="bg-white shadow mt-10">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-gray-600">&copy; {new Date().getFullYear()} Rodrio Flores. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
