import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Crown, 
  Gift, 
  Share2, 
  LogOut, 
  CheckCircle2, 
  Heart, 
  Sparkles, 
  ShoppingBag,
  Zap,
  Edit3,
  Check,
  Phone,
  ShieldCheck,
  AlertCircle,
  Camera,
  ArrowLeft,
  Loader2,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const PRESET_AVATARS = [
  { id: 'av1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', label: 'Urbano 1' },
  { id: 'av2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', label: 'Urbano 2' },
  { id: 'av3', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', label: 'Urbano 3' },
  { id: 'av4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', label: 'Urbano 4' },
  { id: 'av5', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', label: 'Urbano 5' },
  { id: 'av6', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', label: 'Urbano 6' },
];

export const UserProfileModal = () => {
  const { 
    currentUser, 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    setIsAuthModalOpen,
    logout, 
    isFollowingStore, 
    toggleFollowStore,
    updateProfile,
    sendWhatsAppOtp,
    verifyWhatsAppOtp,
    isLoadingAuth
  } = useAuth();

  const { setIsTrackerOpen } = useCart();

  if (!isProfileModalOpen || !currentUser) return null;

  // View or Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states for editing
  const [nameInput, setNameInput] = useState(currentUser.name || '');
  const [usernameInput, setUsernameInput] = useState(currentUser.username || '');
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '');
  const [avatarInput, setAvatarInput] = useState(currentUser.avatar || '');

  // WhatsApp OTP Verification states
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Sync state when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser) {
      setNameInput(currentUser.name || '');
      setUsernameInput(currentUser.username || '');
      setPhoneInput(currentUser.phone || '');
      setAvatarInput(currentUser.avatar || '');
    }
  }, [currentUser]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const interval = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCountdown]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MVP FLOW Boutique | Ropa Urbana',
        text: '¡Únete a la comunidad de MVP FLOW con mi código y recibe 15% OFF en tu primer pedido!',
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Handle Avatar Image File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatusMessage({ text: 'La imagen no debe superar los 2MB.', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarInput(event.target.result);
          setStatusMessage({ text: 'Foto seleccionada con éxito.', type: 'success' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Request WhatsApp OTP code
  const handleSendOtp = async () => {
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setStatusMessage({ text: 'Por favor ingresa un número de WhatsApp de 10 dígitos (ej: 809-555-0123).', type: 'error' });
      return;
    }

    setOtpLoading(true);
    setStatusMessage({ text: '', type: '' });

    try {
      await sendWhatsAppOtp(cleanPhone, nameInput || currentUser.name);
      setShowOtpSection(true);
      setOtpCountdown(60);
      setStatusMessage({ 
        text: `Código de 6 dígitos enviado por WhatsApp al +1 ${cleanPhone.slice(-10)}.`, 
        type: 'success' 
      });
    } catch (err) {
      setStatusMessage({ text: err.message || 'Error enviando código por WhatsApp.', type: 'error' });
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify WhatsApp OTP code
  const handleVerifyOtp = async () => {
    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 6) {
      setStatusMessage({ text: 'Introduce el código de 6 dígitos recibido en tu WhatsApp.', type: 'error' });
      return;
    }

    setOtpLoading(true);
    setStatusMessage({ text: '', type: '' });

    try {
      await verifyWhatsAppOtp(phoneInput, cleanCode, nameInput || currentUser.name);
      setShowOtpSection(false);
      setOtpCode('');
      setStatusMessage({ 
        text: '🎉 ¡WhatsApp verificado con éxito! Recibiste +200 Puntos FLOW.', 
        type: 'success' 
      });
    } catch (err) {
      setStatusMessage({ text: err.message || 'Código incorrecto o expirado.', type: 'error' });
    } finally {
      setOtpLoading(false);
    }
  };

  // Save changes to profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!nameInput.trim()) {
      setStatusMessage({ text: 'El nombre no puede estar vacío.', type: 'error' });
      return;
    }

    let cleanUsername = usernameInput.trim();
    if (cleanUsername && !cleanUsername.startsWith('@')) {
      cleanUsername = `@${cleanUsername}`;
    }

    try {
      await updateProfile({
        name: nameInput.trim(),
        username: cleanUsername || `@${nameInput.trim().toLowerCase().replace(/\s+/g, '_')}`,
        phone: phoneInput.trim(),
        avatar: avatarInput.trim(),
      });

      setStatusMessage({ text: 'Perfil actualizado correctamente.', type: 'success' });
      setIsEditing(false);
    } catch (err) {
      setStatusMessage({ text: 'Error al actualizar el perfil.', type: 'error' });
    }
  };

  const isVerified = currentUser.phoneVerified || currentUser.provider === 'whatsapp';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border border-mvp-cardHover rounded-3xl shadow-glow-sm overflow-hidden my-auto p-5 sm:p-6 text-center space-y-4">
        
        {/* Loading Overlay */}
        {(isLoadingAuth || otpLoading) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-mvp-red animate-spin" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Actualizando información...
            </span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-mvp-muted hover:text-white bg-mvp-black/70 rounded-full hover:bg-mvp-cardHover transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* Back button if editing */}
        {isEditing && (
          <button
            onClick={() => {
              setIsEditing(false);
              setShowOtpSection(false);
              setStatusMessage({ text: '', type: '' });
            }}
            className="absolute top-4 left-4 p-2 text-mvp-muted hover:text-white bg-mvp-black/70 rounded-full hover:bg-mvp-cardHover transition-colors z-20 flex items-center gap-1 text-xs"
            title="Volver"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        {/* Status Messages */}
        {statusMessage.text && (
          <div className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 text-left ${
            statusMessage.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {statusMessage.type === 'error' ? <AlertCircle size={15} className="flex-shrink-0" /> : <CheckCircle2 size={15} className="flex-shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ========================================================
            VIEW MODE
        ======================================================== */}
        {!isEditing ? (
          <>
            {/* Profile Card Header */}
            <div className="flex flex-col items-center space-y-2 pt-1">
              <div className="relative group">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-mvp-red shadow-glow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-mvp-gold text-black rounded-full p-1 shadow">
                  <Crown size={14} className="fill-black" />
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-black text-white flex items-center justify-center gap-1.5">
                  {currentUser.name}
                </h3>
                <span className="text-xs font-mono text-mvp-red">{currentUser.username}</span>
              </div>

              {/* VIP Level & Verification Status */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center gap-1 bg-mvp-red/20 border border-mvp-red/50 text-mvp-red text-[11px] font-black px-3 py-0.5 rounded-full uppercase">
                  <Sparkles size={12} />
                  <span>{currentUser.level || 'Miembro VIP Silver'}</span>
                </div>

                {isVerified ? (
                  <div className="inline-flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[11px] font-bold px-3 py-0.5 rounded-full">
                    <ShieldCheck size={13} />
                    <span>WhatsApp Verificado</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowOtpSection(true);
                    }}
                    className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold px-3 py-0.5 rounded-full hover:bg-amber-500/30 transition-colors"
                  >
                    <AlertCircle size={12} className="text-amber-400" />
                    <span>Confirmar WhatsApp (+200 pts)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Edit Profile Action Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2 px-4 rounded-xl bg-mvp-card hover:bg-mvp-cardHover border border-mvp-red/40 hover:border-mvp-red text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Edit3 size={14} className="text-mvp-red" />
              <span>Editar Mi Información Real</span>
            </button>

            {/* Points and Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-mvp-black/70 p-3 rounded-2xl border border-mvp-cardHover">
                <span className="text-[11px] text-mvp-muted block">Puntos FLOW:</span>
                <span className="text-2xl font-black text-mvp-gold font-mono">{currentUser.flowPoints || 500} pts</span>
              </div>

              <div className="bg-mvp-black/70 p-3 rounded-2xl border border-mvp-cardHover">
                <span className="text-[11px] text-mvp-muted block">Comunidad:</span>
                <button
                  onClick={toggleFollowStore}
                  className={`mt-1 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    isFollowingStore
                      ? 'bg-mvp-neonGreen/20 text-mvp-neonGreen border border-mvp-neonGreen/50'
                      : 'bg-mvp-red text-white'
                  }`}
                >
                  {isFollowingStore ? '✓ Siguiendo' : '+ Seguir'}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 text-left text-xs">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsTrackerOpen(true);
                }}
                className="w-full bg-mvp-dark hover:bg-mvp-card p-3 rounded-xl border border-mvp-cardHover flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2 text-white font-semibold">
                  <ShoppingBag size={16} className="text-mvp-red" />
                  <span>Mis Autopedidos en Vivo</span>
                </div>
                <span className="text-mvp-muted">Ver estado →</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full bg-mvp-dark hover:bg-mvp-card p-3 rounded-xl border border-mvp-cardHover flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Share2 size={16} className="text-amber-400" />
                  <span>Invitar Amigos (+300 Puntos)</span>
                </div>
                <span className={copied ? 'text-emerald-400 font-bold text-xs' : 'text-mvp-muted'}>
                  {copied ? '✔ ¡Copiado!' : 'Compartir →'}
                </span>
              </button>
            </div>

            {/* Iniciar sesión con WhatsApp (Switch/Login) */}
            <div className="pt-2 border-t border-mvp-cardHover flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2 px-3 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={14} />
                <span>Iniciar sesión con otro WhatsApp</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  setIsProfileModalOpen(false);
                }}
                className="w-full py-1.5 text-xs text-mvp-muted hover:text-red-400 font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </>
        ) : (
          /* ========================================================
              EDIT MODE: EDIT REAL INFORMATION & VERIFY WHATSAPP
          ======================================================== */
          <div className="space-y-4 text-left">
            <div className="text-center">
              <h3 className="text-lg font-black text-white uppercase tracking-wide">
                Editar Información Real
              </h3>
              <p className="text-xs text-mvp-muted">
                Coloca tu nombre real y tu WhatsApp para confirmar tu cuenta y recibir tus pedidos.
              </p>
            </div>

            {/* Avatar Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-mvp-silver uppercase tracking-wider block">
                Foto de Perfil
              </label>
              
              <div className="flex items-center gap-3">
                <img
                  src={avatarInput || currentUser.avatar || PRESET_AVATARS[0].url}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-mvp-red flex-shrink-0"
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    placeholder="URL de tu imagen o foto..."
                    className="w-full bg-mvp-black/80 border border-mvp-cardHover rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-mvp-red"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-[10px] text-mvp-red hover:underline flex items-center gap-1">
                      <Camera size={11} />
                      <span>Subir desde dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Preset Avatars quick-pick */}
              <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarInput(av.url)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0 transition-transform hover:scale-105 ${
                      avatarInput === av.url ? 'border-mvp-red ring-2 ring-mvp-red/50 scale-105' : 'border-mvp-cardHover opacity-70'
                    }`}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Real Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-mvp-silver uppercase tracking-wider block">
                Nombre y Apellido Real
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ej: Adderly Marte / Juan Pérez"
                className="w-full bg-mvp-black/80 border border-mvp-cardHover rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-mvp-red"
              />
            </div>

            {/* Username / Handle */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-mvp-silver uppercase tracking-wider block">
                Usuario / Apodo
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ej: @adderly_marte"
                className="w-full bg-mvp-black/80 border border-mvp-cardHover rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-mvp-red"
              />
            </div>

            {/* Real WhatsApp Phone Number & Confirmation */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-mvp-black/60 border border-mvp-cardHover">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-mvp-silver uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={12} className="text-emerald-400" />
                  <span>WhatsApp Dominicano</span>
                </label>
                {isVerified ? (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck size={12} /> Verificado
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    <AlertCircle size={12} /> No verificado
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="809-555-0123"
                  className="flex-1 bg-mvp-black border border-mvp-cardHover rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                {!isVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || otpCountdown > 0}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black text-xs font-black rounded-xl transition-all flex items-center gap-1 whitespace-nowrap shadow-sm"
                  >
                    {otpCountdown > 0 ? (
                      <span>{otpCountdown}s</span>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Verificar</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Inline OTP Code Verification Form */}
              {showOtpSection && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 animate-fade-in">
                  <div className="text-[11px] text-emerald-300 font-medium">
                    Ingresa el código de 6 dígitos que te enviamos a tu WhatsApp:
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-32 text-center tracking-[0.3em] font-mono text-base font-black bg-black border border-emerald-500 rounded-xl px-2 py-1.5 text-emerald-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otpCode.length !== 6}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black text-xs rounded-xl transition-all shadow"
                    >
                      Confirmar Código
                    </button>
                  </div>

                  {otpCountdown === 0 && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[11px] text-emerald-400 hover:underline block pt-1"
                    >
                      ¿No te llegó el código? Reenviar por WhatsApp
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons: Save & Cancel */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setShowOtpSection(false);
                  setStatusMessage({ text: '', type: '' });
                }}
                className="w-full py-2.5 rounded-xl bg-mvp-card hover:bg-mvp-cardHover text-mvp-silver text-xs font-bold transition-all text-center"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isLoadingAuth}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-mvp-red to-mvp-crimson hover:from-mvp-crimson hover:to-mvp-red text-white text-xs font-black transition-all shadow-glow-sm flex items-center justify-center gap-1.5"
              >
                <Check size={15} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
