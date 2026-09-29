import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Phone, 
  ShieldCheck, 
  Gift, 
  Users, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginWithGoogle, 
    loginWithFacebook, 
    loginWithApple,
    loginWithPhone,
    sendWhatsAppOtp,
    verifyWhatsAppOtp,
    isLoadingAuth 
  } = useAuth();

  const { applyCoupon } = useCart();

  const [mode, setMode] = useState('social'); // 'social', 'phone', 'otp'
  const [phoneInput, setPhoneInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for resending OTP
  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    applyCoupon('VIP15');
  };

  const handleFacebookLogin = async () => {
    await loginWithFacebook();
    applyCoupon('VIP15');
  };

  const handleAppleLogin = async () => {
    await loginWithApple();
    applyCoupon('VIP15');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-mvp-card via-mvp-dark to-mvp-black border-2 border-mvp-red/50 rounded-3xl shadow-glow-red overflow-hidden my-auto p-5 sm:p-6 text-center">
        {/* Loading Overlay */}
        {isLoadingAuth && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-mvp-red animate-spin" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Conectando tu cuenta...
            </span>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-mvp-muted hover:text-white bg-mvp-black/70 rounded-full hover:bg-mvp-cardHover transition-colors z-20"
        >
          <X size={18} />
        </button>

        {/* Top Community Badge */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-plastir-orange/20 to-amber-500/20 border border-plastir-orange/40 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase">
            <Users size={13} className="text-plastir-orange" />
            <span>COMUNIDAD OFICIAL PLASTIR RD</span>
          </div>

          <h3 className="text-2xl font-display font-black text-white uppercase tracking-wide">
            ÚNETE AL <span className="text-[#F16100]">CLUB PLASTIR</span>
          </h3>

          <p className="text-xs text-mvp-silver/80">
            Regístrate en 1 toque con Google, Facebook, Apple o WhatsApp y desbloquea beneficios exclusivos.
          </p>
        </div>

        {/* Benefits Box */}
        <div className="bg-mvp-black/70 border border-mvp-cardHover rounded-2xl p-3 mb-5 text-left space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-mvp-gold font-bold">
            <Gift size={15} className="text-yellow-400 flex-shrink-0" />
            <span>500 Puntos PLASTIR de Bienvenida</span>
          </div>
          <div className="flex items-center gap-2 text-mvp-neonGreen font-semibold">
            <CheckCircle2 size={15} className="text-mvp-neonGreen flex-shrink-0" />
            <span>15% OFF automático en tu primera orden (Cupón VIP15)</span>
          </div>
          <div className="flex items-center gap-2 text-mvp-silver font-semibold">
            <Zap size={15} className="text-plastir-orange flex-shrink-0" />
            <span>Acceso anticipado a ofertas exclusivas</span>
          </div>
        </div>

        {mode === 'social' ? (
          /* Social 1-Tap Buttons */
          <div className="space-y-2.5">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoadingAuth}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-gray-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            {/* Apple Button */}
            <button
              onClick={handleAppleLogin}
              disabled={isLoadingAuth}
              className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-md"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.96-14.42-7.3-11.22-13.06-23.75-17.29-37.58-4.23-13.84-6.35-27.18-6.35-40.04 0-16.14 4.12-29.62 12.37-40.43 8.24-10.81 18.66-16.32 31.25-16.53 4.8 0 10.15 1.25 16.06 3.75 5.91 2.5 9.77 3.86 11.59 4.09 1.48-.34 5.39-1.76 11.75-4.26 6.35-2.5 11.83-3.64 16.42-3.41 12.37.57 22.39 4.93 30.07 13.08 7.68 8.15 12.82 18.37 15.42 30.65-10.97 6.64-16.35 15.7-16.14 27.18.23 9.4 3.75 17.26 10.56 23.59 6.81 6.33 15.02 9.94 24.63 10.84-2.16 6.83-4.8 13.51-7.91 20.04zM119.22 32.64c0-7.3 2.65-14.33 7.95-21.09 5.3-6.76 11.91-11.08 19.82-12.96.46 1.48.68 3.01.68 4.6 0 7.38-2.73 14.54-8.18 21.48-5.46 6.93-12.18 11.19-20.17 12.78-.07-1.48-.1-3.08-.1-4.81z"/>
              </svg>
              <span>Continuar con Apple</span>
            </button>

            {/* Facebook Button */}
            <button
              onClick={handleFacebookLogin}
              disabled={isLoadingAuth}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-md"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continuar con Facebook</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-2">
              <div className="flex-1 border-t border-mvp-cardHover" />
              <span className="px-3 text-[10px] text-mvp-muted uppercase font-bold">O también</span>
              <div className="flex-1 border-t border-mvp-cardHover" />
            </div>

            {/* WhatsApp Phone Option */}
            <button
              onClick={() => setMode('phone')}
              className="w-full py-3 px-4 rounded-xl bg-mvp-dark hover:bg-mvp-card border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Phone size={15} className="text-emerald-400" />
              <span>Ingresar con Teléfono / WhatsApp</span>
            </button>
          </div>
        ) : mode === 'phone' ? (
          /* Phone Input Form -> Triggers OTP */
          <form onSubmit={handleRequestOtp} className="space-y-3 text-left">
            {errorMsg && (
              <div className="bg-red-500/20 border border-red-500/40 p-2.5 rounded-xl text-[11px] text-red-200">
                {errorMsg}
              </div>
            )}

            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-bold text-emerald-300">Verificación por WhatsApp Oficial</p>
                <p className="text-mvp-silver">Te enviaremos un código de seguridad de 6 dígitos a tu WhatsApp.</p>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-mvp-silver font-bold uppercase tracking-wider block mb-1">
                Tu Nombre o Apodo (Opcional):
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full bg-mvp-black/80 border border-mvp-cardHover focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-mvp-silver font-bold uppercase tracking-wider block mb-1">
                Número de WhatsApp (10 dígitos):
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="809-555-0123"
                  className="w-full bg-mvp-black/80 border border-mvp-cardHover focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors font-mono"
                />
                <Phone size={14} className="absolute left-3 top-3 text-emerald-400" />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoadingAuth}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Enviar Código por WhatsApp</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => setMode('social')}
                className="w-full py-2 text-center text-xs text-mvp-muted hover:text-white transition-colors"
              >
                ← Volver a Redes Sociales
              </button>
            </div>
          </form>
        ) : (
          /* OTP 6-Digit Verification Step */
          <form onSubmit={handleVerifyOtp} className="space-y-3.5 text-left animate-fade-in">
            {errorMsg && (
              <div className="bg-red-500/20 border border-red-500/40 p-2.5 rounded-xl text-[11px] text-red-200">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-2.5 rounded-xl text-[11px] text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="bg-black/60 border border-emerald-500/30 rounded-2xl p-3 text-center">
              <span className="text-xs text-mvp-silver block mb-1">Introduce el código de 6 dígitos:</span>
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="• • • • • •"
                className="w-48 mx-auto text-center font-mono text-2xl tracking-[0.35em] font-black bg-mvp-card/90 border-2 border-emerald-400/80 focus:border-emerald-300 rounded-xl py-2 px-3 text-white placeholder-mvp-muted outline-none shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              />
              <p className="text-[10px] text-mvp-muted mt-2">
                Revisa la conversación de WhatsApp oficial de PLASTIR RD.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoadingAuth || otpCode.trim().length !== 6}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-mvp-red via-mvp-crimson to-mvp-darkRed hover:from-mvp-crimson hover:to-mvp-red disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider shadow-glow-red transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Verificar Código y Entrar</span>
                <CheckCircle2 size={14} />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setMode('phone')}
                  className="text-mvp-muted hover:text-white transition-colors text-[11px]"
                >
                  Cambiar número
                </button>

                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={() => handleRequestOtp()}
                  className={`text-[11px] font-bold ${
                    countdown > 0 ? 'text-mvp-muted cursor-not-allowed' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {countdown > 0 ? `Reenviar código (${countdown}s)` : 'Reenviar código'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer Security Note */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-mvp-muted">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>Tus datos están 100% protegidos. No compartimos tu información.</span>
        </div>
      </div>
    </div>
  );
};
