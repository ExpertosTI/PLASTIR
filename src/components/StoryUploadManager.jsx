import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Video, 
  Instagram, 
  Sparkles, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Film, 
  Plus, 
  RefreshCw,
  X,
  Flame,
  ArrowRight
} from 'lucide-react';

export const StoryUploadManager = ({ isOpen = true, onClose }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'instagram' | 'manage'
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  // Upload Form State
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [videoBase64, setVideoBase64] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('TOP 1');
  const [instagramReelUrl, setInstagramReelUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState('mvp_flow_losmina');
  const [batchUrls, setBatchUrls] = useState('');
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Story deletion confirmation state (no native window.confirm!)
  const [deletingId, setDeletingId] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch stories and active Instagram configuration
  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      if (res.ok) {
        const data = await res.json();
        if (data.stories) {
          setStories(data.stories);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchStories();
    fetch('/api/stories/config')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.instagramProfileHandle) {
          setInstagramHandle(d.instagramProfileHandle);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Video Selection from Mobile / Desktop
  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 55 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'El video excede los 50MB. Graba un video más corto o comprímelo.' });
      return;
    }

    setVideoFile(file);
    const localUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(localUrl);

    // Read as Base64 for upload
    const reader = new FileReader();
    reader.onload = (event) => {
      setVideoBase64(event.target.result);
    };
    reader.readAsDataURL(file);

    if (!title) {
      const nameClean = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(nameClean);
    }
  };

  // Submit Video Upload
  const handleUploadVideo = async (e) => {
    e.preventDefault();
    if (!videoBase64) {
      setStatusMsg({ type: 'error', text: 'Por favor selecciona un video para subir.' });
      return;
    }
    if (!title.trim()) {
      setStatusMsg({ type: 'error', text: 'El título del producto es requerido.' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/stories/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: Number(price || 0),
          badge,
          videoBase64,
          productName: title,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: '✔ ¡Historia / Short publicado con éxito en la tienda!' });
        setVideoFile(null);
        setVideoPreviewUrl('');
        setVideoBase64('');
        setTitle('');
        setPrice('');
        fetchStories();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Error al subir el video.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error de conexión: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Instagram Reel Sync
  const handleSyncInstagram = async (e) => {
    e.preventDefault();
    if (!instagramReelUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Pega el enlace del Reel de Instagram (ej: https://www.instagram.com/reel/...)' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/stories/sync-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramUrl: instagramReelUrl.trim(),
          title: title.trim(),
          price: Number(price || 0),
          badge: badge || 'REEL VIRAL',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: '✔ ' + data.message });
        setInstagramReelUrl('');
        setTitle('');
        setPrice('');
        fetchStories();
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Error al importar de Instagram.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error de conexión: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Story
  const handleDeleteStory = async (id) => {
    try {
      const res = await fetch(`/api/stories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStories((prev) => prev.filter((s) => s.id !== id));
        setDeletingId(null);
        setStatusMsg({ type: 'success', text: 'Historia eliminada.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'No se pudo eliminar la historia.' });
    }
  };

  const copyMobileLink = () => {
    const url = `${window.location.origin}/subir-historias`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-mvp-card via-mvp-dark to-mvp-card border border-mvp-cardHover rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
              <Film size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                  Historias y Shorts de Video
                </h1>
                <span className="bg-gradient-to-r from-mvp-red to-mvp-crimson text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Tipo TikTok
                </span>
              </div>
              <p className="text-xs text-mvp-silver/80 mt-0.5">
                Publica videos directamente desde tu celular o importa tus Reels de Instagram (@mvp_flow_boutique08) sin doble trabajo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={copyMobileLink}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/90 border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Copiar link para abrir en celular"
            >
              <Copy size={14} className={copiedLink ? 'text-emerald-400' : 'text-slate-400'} />
              <span>{copiedLink ? '¡Link Copiado!' : 'Link para Celular'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-mvp-card hover:bg-mvp-cardHover text-slate-400 hover:text-white transition-colors"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-white/10 pt-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab('upload'); setStatusMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'bg-mvp-red text-white shadow-glow-sm'
                : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Video size={15} />
            <span>1. Subir Video de Celular</span>
          </button>

          <button
            onClick={() => { setActiveTab('instagram'); setStatusMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg'
                : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Instagram size={15} />
            <span>2. Conectar Instagram Reel</span>
          </button>

          <button
            onClick={() => { setActiveTab('manage'); setStatusMsg(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'manage'
                ? 'bg-white/20 text-white'
                : 'bg-black/40 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Film size={15} />
            <span>Historias Activas ({stories.length})</span>
          </button>
        </div>
      </div>

      {/* Status Notice Alert */}
      {statusMsg && (
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-bold animate-fade-in ${
          statusMsg.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-400" /> : <AlertCircle size={18} className="flex-shrink-0 text-rose-400" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TAB 1: UPLOAD VIDEO */}
      {activeTab === 'upload' && (
        <div className="bg-mvp-card/90 border border-mvp-cardHover rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Video size={18} className="text-mvp-red" />
              Subir Archivo de Video Vertical (Short / Story)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sube videos en formato vertical (9:16) grabados con tu celular (MP4, MOV, WebM). Los clientes podrán verlos a pantalla completa como en TikTok.
            </p>
          </div>

          <form onSubmit={handleUploadVideo} className="space-y-4">
            {/* File Dropzone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-mvp-cardHover hover:border-mvp-red/70 bg-black/40 hover:bg-black/60 rounded-2xl p-6 sm:p-8 text-center transition-all group"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />

              {videoPreviewUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-36 h-56 rounded-2xl overflow-hidden bg-black border-2 border-mvp-red/50 shadow-2xl relative">
                    <video 
                      src={videoPreviewUrl} 
                      controls 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-mvp-silver group-hover:text-white">
                    Toca para cambiar de video ({videoFile?.name})
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-mvp-red/10 border border-mvp-red/30 flex items-center justify-center text-mvp-red group-hover:scale-110 transition-transform">
                    <Upload size={26} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">Toca aquí para seleccionar o grabar video</span>
                    <span className="text-xs text-slate-500 block mt-1">Formato MP4, MOV o WebM de hasta 50MB</span>
                  </div>
                </div>
              )}
            </div>

            {/* Inputs: Title, Price, Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Nombre de la Prenda o Calzado *
                </label>
                <input 
                  type="text"
                  placeholder="Ej: Jordan Retro 4 Black Cat G5"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-mvp-red transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Precio (RD$)
                </label>
                <input 
                  type="number"
                  placeholder="Ej: 4850"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-mvp-red transition-all font-mono"
                />
              </div>
            </div>

            {/* Badges Pill Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                Etiqueta Destacada
              </label>
              <div className="flex flex-wrap gap-2">
                {['TOP 1', 'NUEVO DROP', 'REEL VIRAL', '30% OFF', 'OFERTA RD$', 'LA VERDADERA GRASA'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      badge === b
                        ? 'bg-mvp-red text-white shadow-sm'
                        : 'bg-mvp-dark text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !videoBase64}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-mvp-red via-mvp-crimson to-mvp-darkRed hover:from-mvp-crimson hover:to-mvp-red text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-glow-red disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Subiendo y Procesando Historia...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Publicar Video en Historias / Shorts</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: INSTAGRAM REEL SYNC (ZERO DOUBLE WORK) */}
      {activeTab === 'instagram' && (
        <div className="bg-mvp-card/90 border border-mvp-cardHover rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Instagram size={18} className="text-rose-400" />
              Sincronizar Reel de Instagram (Cero Doble Trabajo)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ¿Acabas de publicar un video en tu cuenta <strong className="text-emerald-400">@{instagramHandle}</strong>? Simplemente copia el enlace del Reel y pégalo aquí. Aparecerá de inmediato en la tienda con botón de compra directa por WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSyncInstagram} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                Enlace del Reel o Post de Instagram *
              </label>
              <div className="relative">
                <input 
                  type="url"
                  placeholder={`https://www.instagram.com/reel/C8qXYZ12345/ (o de @${instagramHandle})`}
                  value={instagramReelUrl}
                  onChange={(e) => setInstagramReelUrl(e.target.value)}
                  className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500 transition-all font-mono"
                  required
                />
                <Instagram size={16} className="absolute left-3 top-3 text-rose-400" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>Compatible con enlaces de Reels (`/reel/...`) o publicaciones (`/p/...`).</span>
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(!isBatchOpen)}
                  className="text-purple-400 hover:text-purple-300 font-bold underline"
                >
                  {isBatchOpen ? 'Cerrar importador múltiple' : '¿Pegar varios enlaces a la vez?'}
                </button>
              </div>
            </div>

            {/* Batch Importer Toggle Box */}
            {isBatchOpen && (
              <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-2xl space-y-2 animate-fade-in">
                <label className="block text-xs font-bold text-purple-300">
                  Pega varios enlaces de Reels (uno por línea):
                </label>
                <textarea
                  rows={3}
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  placeholder={`https://www.instagram.com/reel/Da0jmwPSX37/\nhttps://www.instagram.com/reel/DbGNJ0hycVL/\nhttps://www.instagram.com/reel/Dak9M5XgxK2/`}
                  className="w-full bg-black/80 border border-purple-500/50 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isLoading || !batchUrls.trim()}
                  onClick={async (e) => {
                    e.preventDefault();
                    const urls = batchUrls
                      .split('\n')
                      .map((u) => u.trim())
                      .filter((u) => u.includes('instagram.com'));

                    if (urls.length === 0) {
                      setStatusMsg({ type: 'error', text: 'Pega al menos un enlace válido de Instagram.' });
                      return;
                    }

                    setIsLoading(true);
                    setStatusMsg(null);
                    try {
                      const res = await fetch('/api/stories/batch-sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ urls }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setStatusMsg({
                          type: 'success',
                          text: `🎉 ¡Se importaron ${data.addedCount} Reels de Instagram exitosamente!`,
                        });
                        setBatchUrls('');
                        setIsBatchOpen(false);
                        fetchStories();
                      } else {
                        setStatusMsg({ type: 'error', text: data.message || 'Error al importar por lotes.' });
                      }
                    } catch (err) {
                      setStatusMsg({ type: 'error', text: 'Error al importar por lotes: ' + err.message });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow"
                >
                  Importar Enlaces Pegados ({batchUrls.split('\n').filter((u) => u.includes('instagram.com')).length})
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Título Opcional (Si lo dejas vacío se detectará automáticamente)
                </label>
                <input 
                  type="text"
                  placeholder="Ej: Jordan Retro 4 Black Cat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Precio en RD$
                </label>
                <input 
                  type="number"
                  placeholder="Ej: 4500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-mvp-dark border border-mvp-cardHover rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !instagramReelUrl.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Conectando con Instagram...</span>
                </>
              ) : (
                <>
                  <Instagram size={18} />
                  <span>Importar Reel a la Tienda</span>
                </>
              )}
            </button>
          </form>

          {/* Automatic Profile Scanner Section with Editable Profile Handle */}
          <div className="bg-black/50 border border-purple-500/30 rounded-2xl p-4 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Escaneo Automático de Nuevos Videos
                </h3>
              </div>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
                Cada 30 min
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              El servidor escanea automáticamente la cuenta de Instagram de tu tienda para detectar publicaciones recientes sin que tengas que ingresarlas manualmente.
            </p>

            {/* Profile Handle Configuration Field */}
            <div className="p-3 bg-mvp-dark/80 rounded-xl border border-white/10 space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Cuenta de Instagram a escanear:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-emerald-400 font-bold font-mono text-sm">@</span>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace('@', '').trim())}
                    placeholder="mvp_flow_losmina"
                    className="w-full bg-black/90 border border-white/20 rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  type="button"
                  disabled={isLoading || !instagramHandle.trim()}
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/stories/config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ handle: instagramHandle }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        setStatusMsg({ type: 'success', text: `Cuenta de Instagram guardada: @${data.instagramProfileHandle}` });
                      }
                    } catch (err) {
                      setStatusMsg({ type: 'error', text: 'Error guardando cuenta: ' + err.message });
                    }
                  }}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Guardar
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={isLoading || !instagramHandle.trim()}
              onClick={async () => {
                setIsLoading(true);
                setStatusMsg(null);
                try {
                  const res = await fetch('/api/stories/scan-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ handle: instagramHandle }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setStatusMsg({
                      type: 'success',
                      text: data.message || `✔ Escaneo completado. ${data.newlyAdded > 0 ? `Se agregaron ${data.newlyAdded} nuevos videos de @${instagramHandle}.` : `Los videos de @${instagramHandle} ya están al día en la tienda.`}`,
                    });
                    fetchStories();
                  } else {
                    setStatusMsg({ type: 'error', text: data.message || 'Error escaneando perfil.' });
                  }
                } catch (err) {
                  setStatusMsg({ type: 'error', text: 'Error escaneando perfil: ' + err.message });
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/40 text-purple-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Escanear Perfil @{instagramHandle} Ahora Mismo</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3 / LIST: ACTIVE STORIES */}
      <div className="bg-mvp-card/90 border border-mvp-cardHover rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wide">
              Historias y Shorts Activos ({stories.length})
            </h2>
            <p className="text-xs text-slate-400">
              Estas son las historias visibles actualmente para todos los clientes en la barra superior.
            </p>
          </div>
          <button
            onClick={fetchStories}
            className="p-2 rounded-xl bg-mvp-dark border border-white/10 text-slate-400 hover:text-white transition-colors"
            title="Recargar"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No hay historias activas. Sube tu primer video o conecta un reel de Instagram.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {stories.map((story) => (
              <div 
                key={story.id}
                className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden flex gap-3 p-3 items-center group relative hover:border-mvp-red/50 transition-all"
              >
                {/* Thumbnail */}
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 relative border border-white/10">
                  <img 
                    src={story.thumbnailUrl || '/img/drop-1.jpg'} 
                    alt={story.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => { e.target.src = '/img/drop-1.jpg'; }}
                  />
                  {story.type === 'instagram' ? (
                    <div className="absolute top-1 left-1 bg-gradient-to-tr from-amber-500 to-purple-600 text-white p-0.5 rounded shadow">
                      <Instagram size={10} />
                    </div>
                  ) : (
                    <div className="absolute top-1 left-1 bg-mvp-red text-white p-0.5 rounded shadow">
                      <Video size={10} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {story.badge && (
                    <span className="text-[9px] font-black uppercase text-mvp-red block truncate">
                      {story.badge}
                    </span>
                  )}
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
                    {story.title}
                  </h4>
                  {story.price ? (
                    <span className="text-xs font-mono font-black text-emerald-400 block mt-0.5">
                      RD$ {Number(story.price).toLocaleString('es-DO')}
                    </span>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  {deletingId === story.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteStory(story.id)}
                        className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold"
                        title="Confirmar eliminación"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[10px]"
                        title="Cancelar"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(story.id)}
                      className="p-2 rounded-xl bg-mvp-dark text-slate-400 hover:text-rose-400 border border-white/5 transition-colors"
                      title="Eliminar historia"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryUploadManager;
