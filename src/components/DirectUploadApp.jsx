import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Trash2,
  Plus,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  Lock,
  ArrowLeft,
  RefreshCw,
  Zap
} from 'lucide-react';

export const DirectUploadApp = () => {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const [linkInfo, setLinkInfo] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null); // 'expired' | 'used' | 'invalid' | 'server'
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [uploaderName, setUploaderName] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // [{ id, file, previewUrl, base64, sizeKb }]
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Extract token from URL (query param, path segment or hash)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let t = params.get('token') || params.get('t') || '';
      if (!t && window.location.hash) {
        const hashClean = window.location.hash.replace(/^[#?]+/, '');
        const hashParams = new URLSearchParams(hashClean);
        t = hashParams.get('token') || hashParams.get('t') || '';
      }
      if (!t) {
        const parts = window.location.pathname.split('/').filter(Boolean);
        const candidate = parts[parts.length - 1];
        if (candidate && (candidate.startsWith('up_') || candidate.length >= 16)) {
          t = candidate;
        }
      }
      setToken(t);
      if (t) {
        validateToken(t);
      } else {
        setIsValidating(false);
        setErrorStatus('invalid');
        setErrorMessage('No se ha especificado ningún token de subida en el enlace.');
      }
    } catch (e) {
      setIsValidating(false);
      setErrorStatus('invalid');
    }
  }, []);

  const validateToken = async (tok) => {
    setIsValidating(true);
    setErrorStatus(null);
    try {
      const res = await fetch(`/api/upload-links/${tok}`);
      const data = await res.json();
      if (res.ok && data.success && data.valid) {
        setLinkInfo(data.linkInfo);
      } else {
        setErrorStatus(data.reason || 'invalid');
        setErrorMessage(data.message || 'Este enlace no es válido o ha expirado.');
      }
    } catch (err) {
      setErrorStatus('server');
      setErrorMessage('Error de conexión con el servidor. Intenta de nuevo.');
    } finally {
      setIsValidating(false);
    }
  };

  // Compress image client-side to ensure high quality and fast upload
  const processImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // WebP / JPEG 86% quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.86);
          resolve({
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            file,
            previewUrl: compressedBase64,
            base64: compressedBase64,
            sizeKb: Math.round((compressedBase64.length * 3) / 4 / 1024),
          });
        };
      };
    });
  };

  const handleFilesAdded = async (filesList) => {
    const rawFiles = Array.from(filesList || []).filter((f) => f.type.startsWith('image/'));
    if (rawFiles.length === 0) return;

    setIsProcessingFiles(true);
    setProcessingProgress(0);

    const processed = [];
    for (let i = 0; i < rawFiles.length; i++) {
      const item = await processImageFile(rawFiles[i]);
      processed.push(item);
      setProcessingProgress(Math.round(((i + 1) / rawFiles.length) * 100));
    }

    setSelectedFiles((prev) => [...prev, ...processed]);
    setIsProcessingFiles(false);
  };

  const handleInputChange = (e) => {
    handleFilesAdded(e.target.files);
    if (e.target) e.target.value = '';
  };

  const handleRemoveFile = (id) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert('Por favor selecciona o toma al menos 1 foto.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        uploaderName: uploaderName.trim() || 'Colaborador',
        note: uploadNote.trim(),
        images: selectedFiles.map((f, idx) => ({
          imageUrl: f.base64,
          title: `${linkInfo?.productName || 'Foto'} (#${idx + 1})`,
        })),
      };

      const res = await fetch(`/api/upload-links/${token}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadSuccess(true);
        setUploadedCount(data.count || selectedFiles.length);
      } else {
        alert(data.message || 'Error al subir las fotos.');
      }
    } catch (err) {
      alert('Error de conexión al enviar las fotos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between py-6 px-3 sm:px-6 font-sans">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF1E27] to-black border border-white/10 shadow-xl shadow-[#FF1E27]/25">
            <span className="text-2xl font-black text-white">⚡</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-display">
            RENACE · Subida de Fotos
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Portal oficial de recepción de multimedia para catálogo
          </p>
        </div>

        {/* Validation Loading State */}
        {isValidating && (
          <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-8 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#FF1E27] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-300">Validando enlace de uso único...</p>
          </div>
        )}

        {/* Invalid / Expired / Used Error Screen */}
        {!isValidating && errorStatus && (
          <div className="bg-[#0E121D] border border-rose-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-2xl border border-rose-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-black text-white">
                {errorStatus === 'used'
                  ? 'Enlace ya Utilizado'
                  : errorStatus === 'expired'
                  ? 'Enlace Expirado'
                  : 'Enlace no Válido'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
                {errorMessage}
              </p>
            </div>
            <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500">
              Si necesitas subir más fotos de este producto, solicita un nuevo enlace al asesor de ventas de RENACE.
            </div>
          </div>
        )}

        {/* Upload Success Screen */}
        {!isValidating && uploadSuccess && (
          <div className="bg-gradient-to-b from-[#0F1826] to-[#080B13] border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                Subida Completada
              </span>
              <h2 className="text-xl font-black text-white pt-1">
                ¡{uploadedCount} Fotos Subidas con Éxito!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Las fotos del producto <strong className="text-white">"{linkInfo?.productName}"</strong> ya están disponibles en el catálogo central y galería de asesores.
              </p>
            </div>

            <div className="bg-[#0B0E17] border border-white/5 rounded-xl p-3.5 text-left text-xs text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Producto:</span>
                <strong className="text-white">{linkInfo?.productName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Cantidad:</span>
                <strong className="text-emerald-400">{uploadedCount} fotos</strong>
              </div>
              <div className="flex justify-between">
                <span>Estado Enlace:</span>
                <span className="text-amber-400">Completado y Cerrado (1 solo uso)</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-slate-500">
                Ya puedes cerrar esta ventana con total tranquilidad. 🙌✨
              </p>
            </div>
          </div>
        )}

        {/* Valid Token Upload Form */}
        {!isValidating && !errorStatus && !uploadSuccess && linkInfo && (
          <form onSubmit={handleUploadSubmit} className="space-y-5">
            {/* Target Product Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-[#0E121D] to-amber-500/5 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider">
                  Enlace de Uso Único
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Creado por {linkInfo.createdBy}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                👟 {linkInfo.productName}
              </h2>
              {linkInfo.note && (
                <p className="text-xs text-slate-300 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  📝 <span className="font-semibold text-slate-400">Instrucción:</span> {linkInfo.note}
                </p>
              )}
            </div>

            {/* Photo Selection Card */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Selecciona o toma las fotos:
              </label>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF1E27] to-[#B91C1C] hover:from-[#FF414D] hover:to-[#DC2626] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF1E27]/20 transition-all active:scale-[0.98]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tomar con Cámara</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-[0.98]"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Abrir Galería</span>
                </button>
              </div>

              {/* Hidden Inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={handleInputChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleInputChange}
              />

              {/* Drop / Drag Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all space-y-1 ${
                  isDragging
                    ? 'border-[#FF1E27] bg-[#FF1E27]/10'
                    : 'border-white/10 hover:border-amber-400/50 bg-black/20 hover:bg-white/5'
                }`}
              >
                <ImageIcon className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">
                  {isDragging ? '¡Suelta las fotos aquí!' : 'Toca aquí o arrastra varias fotos a la vez'}
                </p>
                <p className="text-[10px] text-slate-500">Soporta JPG, PNG, WEBP, HEIC</p>
              </div>

              {/* Processing Spinner */}
              {isProcessingFiles && (
                <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-sky-300">Optimizando fotos para subida rápida...</span>
                    <div className="w-full bg-black/40 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className="bg-sky-400 h-full transition-all duration-200"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Grid */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold text-white">
                      Fotos listas ({selectedFiles.length}):
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                    >
                      Quitar todas
                    </button>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
                    {selectedFiles.map((f, idx) => (
                      <div
                        key={f.id}
                        className="relative aspect-square rounded-xl overflow-hidden bg-black/60 border border-white/10 group shadow-md"
                      >
                        <img
                          src={f.previewUrl}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(f.id)}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-rose-600 text-white rounded-lg transition-colors shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/70 text-[9px] font-mono text-slate-300 rounded backdrop-blur">
                          #{idx + 1} ({f.sizeKb}kb)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Optional Uploader Info */}
            <div className="bg-[#0E121D] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Tu Nombre o Apodo (Opcional):
                </label>
                <input
                  type="text"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  placeholder="Ej: Carlos / Fotógrafo / Almacén"
                  className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#FF1E27]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Nota o Comentario sobre las fotos (Opcional):
                </label>
                <input
                  type="text"
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  placeholder="Ej: Fotos en ángulo lateral y suela con luz natural"
                  className="w-full bg-[#080A10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-[#FF1E27]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isProcessingFiles || selectedFiles.length === 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Subiendo {selectedFiles.length} Fotos al Catálogo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Subir {selectedFiles.length > 0 ? `${selectedFiles.length} Fotos` : 'Fotos'} al Catálogo</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <footer className="text-center text-[10px] text-slate-600 pt-6">
        RENACE Tech · MVP Flow Boutique RD · Sistema Seguro de Subida
      </footer>
    </div>
  );
};

export default DirectUploadApp;
