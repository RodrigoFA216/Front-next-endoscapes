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
    media: null,
    description: ''
  });
  const [errors, setErrors] = useState({
    title: '',
    media: ''
  });
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'media') {
      setFormData({
        ...formData,
        media: files[0]
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
    let newErrors = { title: '', media: '' };

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio.';
      valid = false;
    }

    if (!formData.media) {
      newErrors.media = 'El archivo es obligatorio.';
      valid = false;
    } else if (
      !(
        (formData.media.type === 'image/jpeg' && formData.media.name.endsWith('.jpg')) ||
        (formData.media.type === 'video/mp4' && formData.media.name.endsWith('.mp4'))
      )
    ) {
      newErrors.media = 'Solo se permiten archivos JPG para imágenes y MP4 para videos.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const addItem = async () => {
    if (!validateForm()) return;

    const mediaURL = URL.createObjectURL(formData.media);

    const newItem = {
      title: formData.title,
      media: formData.media,
      mediaURL: mediaURL,
      description: formData.description
    };

    setTasks({
      ...tasks,
      [activeTab]: [...tasks[activeTab], newItem]
    });

    setFormData({
      title: '',
      media: null,
      description: ''
    });
    setErrors({
      title: '',
      media: ''
    });
    setShowModal(false);
  };

  const handleSend = async () => {
    const lastItem = tasks[activeTab].length ? tasks[activeTab][tasks[activeTab].length - 1] : null;
  
    if (!lastItem || !lastItem.media) {
      setResponse({ error: 'No hay archivo para enviar.' });
      return;
    }
  
    const endpoint = lastItem.media.type === 'video/mp4' 
      ? 'http://127.0.0.1:8000/API/Get/Video/Detection' 
      : 'http://127.0.0.1:8000/API/Get/Image/Detection';
  
    const formDataToSend = new FormData();
    formDataToSend.append('file', lastItem.media);
  
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        setResponse({ error: `Error del servidor: ${errorText}` });
        return;
      }
  
      // Crear un enlace para descargar el archivo
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segmented_${lastItem.media.name}`; // Nombre del archivo a descargar
      document.body.appendChild(a);
      a.click();
      a.remove();
      setResponse({ success: 'Archivo segmentado descargado exitosamente.' });
    } catch (error) {
      setResponse({ error: `Error al enviar el archivo: ${error.message}` });
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-100">
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
                {item.media.type === 'video/mp4' ? (
                  <video controls className="w-full h-auto mb-2">
                    <source src={item.mediaURL} type="video/mp4" />
                    Tu navegador no soporta la etiqueta de video.
                  </video>
                ) : (
                  <img src={item.mediaURL} alt={item.title} className="w-full h-auto mb-2" />
                )}
                {item.description && <p className="text-gray-700">{item.description}</p>}
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSend}>
                  Enviar al Backend
                </button>
                {response && <p className="mt-2 text-gray-700">{JSON.stringify(response)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

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
              <label className="block text-gray-700">Archivo <span className="text-red-500">*</span></label>
              <input
                type="file"
                name="media"
                accept="image/jpeg,video/mp4"
                className={`border p-2 w-full ${errors.media ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleInputChange}
              />
              {errors.media && <p className="text-red-500 text-sm">{errors.media}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-black">Descripción</label>
              <textarea
                name="description"
                className="border p-2 w-full border-gray-300 text-black"
                placeholder="Ingresa una descripción (opcional)"
                value={formData.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-200 px-4 py-2 rounded mr-2"
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    title: '',
                    media: null,
                    description: ''
                  });
                  setErrors({
                    title: '',
                    media: ''
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
    </div>
  );
}
