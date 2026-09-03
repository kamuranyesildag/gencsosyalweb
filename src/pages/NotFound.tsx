import React from 'react';
import { Link } from 'react-router';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Sayfa Bulunamadı</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak ulaşılamıyor olabilir.
      </p>
      <Link 
        to="/home" 
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;
