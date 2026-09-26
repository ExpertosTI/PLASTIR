import React from 'react';
import ReactDOM from 'react-dom/client';
import StoryUploadManager from './components/StoryUploadManager';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased py-6 px-3">
      <StoryUploadManager isOpen={true} />
    </div>
  </React.StrictMode>
);
