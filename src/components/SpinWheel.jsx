import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Gift, 
  Sparkles, 
  Trophy, 
  Zap, 
  Flame, 
  Crown, 
  Clock, 
  CheckCircle2, 
  ShoppingBag,
  Percent,
  Truck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';

const REWARDS = [
  {
    id: 'rew-30',
    label: '30% OFF',
    sublabel: 'DESCUENTO TOTAL',
    icon: '🔥',
    type: 'discount',
    value: 30,
    couponCode: 'VIP30',
    gradient: ['#FF1E27', '#990000'],
    textColor: '#FFFFFF',
    borderColor: '#FFD700',
  },
  {
    id: 'rew-ship',
    label: 'ENVÍO GRATIS',
    sublabel: 'TODO RD (COD)',
    icon: '🛵',
    type: 'shipping',
    value: 0,
    couponCode: 'ENVIOGRATIS',
    gradient: ['#10B981', '#047857'],
    textColor: '#FFFFFF',
    borderColor: '#34D399',
  },
  {
    id: 'rew-cap',
    label: 'GORRA G5',
    sublabel: 'DE REGALO',
    icon: '🧢',
    type: 'gift',
    value: 'cap',
    couponCode: 'GORRAGRATIS',
    gradient: ['#F59E0B', '#B45309'],
    textColor: '#000000',
    borderColor: '#FDE047',
  },
  {
    id: 'rew-20',
    label: '20% OFF',
    sublabel: 'EN TU COMPRA',
    icon: '⚡',
    type: 'discount',
    value: 20,
    couponCode: 'VIP20',
    gradient: ['#8B5CF6', '#5B21B6'],
    textColor: '#FFFFFF',
    borderColor: '#C084FC',
  },
  {
    id: 'rew-500',
    label: 'RD$ 500',
    sublabel: 'CASHBACK DROP',
    icon: '💵',
    type: 'cash',
    value: 500,
    couponCode: 'FLOW500',
    gradient: ['#EC4899', '#9D174D'],
    textColor: '#FFFFFF',
    borderColor: '#F472B6',
  },
  {
    id: 'rew-15',
    label: '15% OFF',
    sublabel: 'EXTRA VIP',
    icon: '💎',
    type: 'discount',
    value: 15,
    couponCode: 'VIP15',
    gradient: ['#06B6D4', '#0E7490'],
    textColor: '#FFFFFF',
    borderColor: '#67E8F9',
  },
];

export const SpinWheel = () => {
  const { isWheelOpen, setIsWheelOpen, recordWheelSpin, playBeep, setIsCartOpen } = useCart();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState(null);
  const [pinTick, setPinTick] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes countdown

  // Countdown timer for coupon urgency
  useEffect(() => {
    if (!wonReward) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [wonReward]);

  if (!isWheelOpen) return null;

  const triggerEpicConfetti = () => {
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.6 },
        zIndex: 9999,
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#FF1E27', '#FFD700', '#FFFFFF'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#10B981', '#F59E0B', '#3B82F6'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#FFD700', '#FF1E27', '#E11D48'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        colors: ['#FFD700', '#F59E0B'],
      });
    } catch {}
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    playBeep('add');

    // Simulate pin ticking sound and visual bump
    const tickInterval = setInterval(() => {
      setPinTick((prev) => !prev);
    }, 120);

    // Selección verdaderamente aleatoria y balanceada entre todos los premios de la ruleta
    // [0: 30% OFF, 1: Envío Gratis, 2: Gorra G5, 3: 20% OFF, 4: RD$ 500 Bono, 5: 15% OFF]
    const pool = [0, 1, 2, 3, 4, 5, 1, 3, 0, 2, 4];
    const targetIndex = pool[Math.floor(Math.random() * pool.length)];

    const segmentAngle = 360 / REWARDS.length;
    const centerAngle = targetIndex * segmentAngle + segmentAngle / 2;
    const baseRotation = Math.ceil(rotation / 360) * 360;
    const extraRounds = 360 * (6 + Math.floor(Math.random() * 3));
    const targetAngle = baseRotation + extraRounds + ((270 - centerAngle + 360) % 360);

    setRotation(targetAngle);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const reward = REWARDS[targetIndex];
      setWonReward(reward);
      recordWheelSpin(reward);
      triggerEpicConfetti();
    }, 4500);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      
      {/* Background Animated Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-mvp-red/20 rounded-full blur-[120px] animate-pulse" />
        <div className="w-[350px] h-[350px] bg-amber-500/20 rounded-full blur-[100px] animate-pulse delay-300" />
      </div>

      <div className="relative w-full max-w-sm sm:max-w-lg bg-gradient-to-b from-[#181112] via-[#0E0E10] to-[#080809] border-2 border-amber-400/50 rounded-3xl p-4 sm:p-7 text-center space-y-4 shadow-[0_0_60px_rgba(255,30,39,0.35)] overflow-hidden my-auto max-h-[95vh] flex flex-col justify-between z-10">
        
        {/* Close Button */}
        <button
          onClick={() => setIsWheelOpen(false)}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all z-30"
        >
          <X size={18} />
        </button>

        {/* Header Ribbon */}
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-mvp-red/30 to-amber-500/20 border border-amber-400/60 text-amber-300 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-glow-sm">
            <Crown size={13} className="text-amber-400 fill-amber-400 animate-bounce" />
            <span>CLUB VIP EXCLUSIVO MVP FLOW</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 uppercase font-display tracking-wide drop-shadow-sm">
            {wonReward ? '🎉 ¡DESCUENTO DESBLOQUEADO!' : 'GIRA Y GANA HASTA UN 30% OFF'}
          </h2>
          
          <p className="text-xs text-mvp-silver font-medium px-2">
            {wonReward
              ? 'Cupón VIP de regalo aplicado con éxito a tu carrito.'
              : 'Gira la ruleta y asegura tu precio especial con Pago Contra Entrega (COD).'}
          </p>
        </div>

        {/* MAIN WHEEL STAGE */}
        {!wonReward ? (
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto my-3 flex items-center justify-center">
            
            {/* Outer Golden Neon Ring with Bulbs */}
            <div className="absolute inset-0 rounded-full border-4 border-amber-400/90 shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse pointer-events-none z-10">
              {/* Outer Bulbs */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-300 border border-white shadow-[0_0_8px_#F59E0B]"
                  style={{
                    top: `${50 - 48 * Math.cos((2 * Math.PI * i) / 12)}%`,
                    left: `${50 + 48 * Math.sin((2 * Math.PI * i) / 12)}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>

            {/* Indicator Needle / Arrow at Top with realistic bounce */}
            <div 
              className={`absolute -top-4 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] transition-transform duration-100 ${
                pinTick ? 'rotate-[-12deg]' : 'rotate-0'
              }`}
            >
              <div className="w-6 h-9 bg-gradient-to-b from-amber-300 via-amber-400 to-red-600 rounded-b-full border-2 border-white shadow-xl flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            {/* Rotating SVG Wheel */}
            <div
              className="w-[92%] h-[92%] rounded-full shadow-2xl overflow-hidden transition-transform duration-[4500ms] cubic-bezier(0.12, 0.95, 0.2, 1)"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  {REWARDS.map((rew, i) => (
                    <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={rew.gradient[0]} />
                      <stop offset="100%" stopColor={rew.gradient[1]} />
                    </linearGradient>
                  ))}
                </defs>

                {REWARDS.map((rew, idx) => {
                  const angle = 360 / REWARDS.length;
                  const startAngle = idx * angle;
                  const endAngle = (idx + 1) * angle;

                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                  const textAngle = startAngle + angle / 2;

                  return (
                    <g key={idx}>
                      <path 
                        d={pathData} 
                        fill={`url(#grad-${idx})`} 
                        stroke="#FFD700" 
                        strokeWidth="0.8" 
                      />
                      
                      {/* Segment Label */}
                      <text
                        x="50"
                        y="18"
                        fill={rew.textColor}
                        fontSize="4.8"
                        fontWeight="900"
                        textAnchor="middle"
                        letterSpacing="0.2"
                        transform={`rotate(${textAngle + 90} 50 50)`}
                      >
                        {rew.label}
                      </text>

                      {/* Sub-label */}
                      <text
                        x="50"
                        y="23"
                        fill={rew.textColor}
                        opacity="0.85"
                        fontSize="2.4"
                        fontWeight="700"
                        textAnchor="middle"
                        transform={`rotate(${textAngle + 90} 50 50)`}
                      >
                        {rew.sublabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Central 3D Push Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 border-4 border-white text-black font-black text-xs sm:text-sm uppercase shadow-[0_0_30px_rgba(245,158,11,0.8)] flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all z-20"
            >
              <Zap size={18} className="fill-black text-black" />
              <span className="font-display tracking-wider text-[11px] sm:text-xs leading-none mt-0.5">
                {isSpinning ? '...' : 'GIRAR'}
              </span>
            </button>
          </div>
        ) : (
          /* WINNER PRIZE CARD */
          <div className="bg-gradient-to-b from-mvp-card to-mvp-dark border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-scale-up">
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white flex items-center justify-center text-black shadow-glow-amber">
              <Trophy size={36} className="animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">Premio Obtenido:</span>
              <h3 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
                {wonReward.label}
              </h3>
              <p className="text-xs text-emerald-400 font-bold">
                ✔ {wonReward.sublabel} activado automáticamente en tu carrito
              </p>
            </div>

            {/* Coupon Box */}
            <div className="bg-black/60 border border-white/20 rounded-2xl p-3 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] text-mvp-muted uppercase font-bold block">Cupón Oficial</span>
                <span className="text-sm sm:text-base font-black text-amber-300 font-mono tracking-widest">{wonReward.couponCode}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-mvp-muted uppercase font-bold block">Expira en:</span>
                <span className="text-xs sm:text-sm font-black text-mvp-red font-mono flex items-center gap-1 justify-end">
                  <Clock size={12} /> {formatTimer(timeLeft)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsWheelOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-mvp-red via-mvp-crimson to-mvp-darkRed text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-glow-red hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                <span>USAR MI PREMIO EN EL CARRITO</span>
              </button>

              <button
                onClick={() => setIsWheelOpen(false)}
                className="w-full py-2 text-xs text-mvp-silver hover:text-white font-bold transition-colors"
              >
                Continuar Viendo Tenis
              </button>
            </div>
          </div>
        )}

        {/* Spin CTA Button */}
        {!wonReward && (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-mvp-red text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Sparkles size={18} className="animate-spin-slow text-black" />
            <span>{isSpinning ? 'GIRANDO LA RULETA...' : '¡GIRAR RULETA AHORA (GRATIS)!'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
