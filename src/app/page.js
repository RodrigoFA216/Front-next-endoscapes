'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState('procesar');
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState({
    procesar: [],
    segmentar: []
  });
  const [formData, setFormData] = useState({
    title: '',
    video: null,
    description: ''
  });
  const [errors, setErrors] = useState({
    title: '',
    video: ''
  });

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  // Guardar datos en localStorage cada vez que tasks cambie
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'video') {
      setFormData({
        ...formData,
        video: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { title: '', video: '' };

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio.';
      valid = false;
    }

    if (!formData.video) {
      newErrors.video = 'El video es obligatorio.';
      valid = false;
    } else if (!formData.video.type.startsWith('video/')) {
      newErrors.video = 'Solo se permiten archivos de video.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const addItem = async () => {
    if (!validateForm()) return;

    // Convertir el video a una URL de objeto para su visualización
    const videoURL = URL.createObjectURL(formData.video);

    const newItem = {
      title: formData.title,
      video: videoURL,
      description: formData.description
    };

    setTasks({
      ...tasks,
      [activeTab]: [...tasks[activeTab], newItem]
    });

    // Resetear el formulario y cerrar el modal
    setFormData({
      title: '',
      video: null,
      description: ''
    });
    setErrors({
      title: '',
      video: ''
    });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between text-black">
          <div className="text-xl font-bold">Segmentation of laparoscopy in videos</div>
          <div>
            <button
              className={`px-4 py-2 rounded ${
                activeTab === 'procesar' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('procesar')}
            >
              Procesar
            </button>
            <button
              className={`ml-2 px-4 py-2 rounded ${
                activeTab === 'segmentar' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setActiveTab('segmentar')}
            >
              Segmentar
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 text-black">
        <h2 className="text-2xl font-bold mb-4">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={() => setShowModal(true)}
        >
          Nuevo Ítem
        </button>
        {tasks[activeTab].length === 0 ? (
          <p>No hay ítems en esta sección.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks[activeTab].map((item, index) => (
              <div key={index} className="bg-white p-4 rounded shadow">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <video controls className="w-full h-auto mb-2">
                  <source src={item.video} type="video/mp4" />
                  Tu navegador no soporta la etiqueta de video.
                </video>
                {item.description && (
                  <p className="text-gray-700">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-11/12 max-w-md">
            <h3 className="text-xl mb-4">Añadir Nuevo Ítem a {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <div className="mb-4">
              <label className="block text-gray-700">Título <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                className={`border p-2 w-full ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ingresa el título"
                value={formData.title}
                onChange={handleInputChange}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Video <span className="text-red-500">*</span></label>
              <input
                type="file"
                name="video"
                accept="video/*"
                className={`border p-2 w-full ${errors.video ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleInputChange}
              />
              {errors.video && <p className="text-red-500 text-sm">{errors.video}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Descripción</label>
              <textarea
                name="description"
                className="border p-2 w-full border-gray-300"
                placeholder="Ingresa una descripción (opcional)"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 px-4 py-2 rounded mr-2"
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    title: '',
                    video: null,
                    description: ''
                  });
                  setErrors({
                    title: '',
                    video: ''
                  });
                }}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={addItem}
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer (Opcional) */}
      <footer className="bg-white shadow mt-10">
        <div className="container mx-auto px-4 py-4 text-center">
          <p className="text-gray-600">&copy; {new Date().getFullYear()} Rodrigo Flores. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
