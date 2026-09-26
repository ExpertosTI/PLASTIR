import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Truck, 
  Phone, 
  MapPin, 
  Star, 
  Award, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  Clock,
  Play,
  RotateCcw,
  Send,
  FileText,
  ExternalLink,
  User
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const StaffManualModal = () => {
  const { isManualOpen, setIsManualOpen } = useCart();

  // Access Code Protection: PIN MVP4878
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('mvpflow_staff_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0); // 0: Roles, 1: Etiquetas, 2: Atajos, 3: Simulador, 4: Certificación
  const [copiedShortcut, setCopiedShortcut] = useState(null);
  const [agentName, setAgentName] = useState('Ashley');

  // Training Checklist state
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem('mvpflow_staff_checklist_v1');
      return saved ? JSON.parse(saved) : [false, false, false, false, false, false, false, false];
    } catch {
      return [false, false, false, false, false, false, false, false];
    }
  });

  // Simulator Chat State
  const [simStep, setSimStep] = useState(0);
  const [simMessages, setSimMessages] = useState([
    { sender: 'client', text: '¡Hola! Vi los Jordan 5 Retro en su página, ¿tienen talla 41 disponible para entrega hoy?' }
  ]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim().toUpperCase() === 'MVP4878') {
      setIsAuthenticated(true);
      sessionStorage.setItem('mvpflow_staff_auth', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mvpflow_staff_auth');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedShortcut(id);
    setTimeout(() => setCopiedShortcut(null), 2000);
  };

  const toggleChecklistItem = (index) => {
    const updated = [...checklist];
    updated[index] = !updated[index];
    setChecklist(updated);
    localStorage.setItem('mvpflow_staff_checklist_v1', JSON.stringify(updated));
  };

  const completedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  // Real PDF Generator (Opens clean, styled printable document ready to save as PDF)
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      window.print();
      return;
    }

    const pdfHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Manual_Operaciones_Whaticket_MVP_FLOW</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; line-height: 1.5; padding: 20px; font-size: 13px; }
          .header { border-bottom: 3px solid #E11D48; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 24px; font-weight: 900; color: #E11D48; text-transform: uppercase; letter-spacing: 1px; }
          .badge { background: #059669; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; }
          h2 { color: #0F172A; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; font-size: 16px; margin-top: 25px; text-transform: uppercase; }
          h3 { color: #E11D48; font-size: 14px; margin-bottom: 4px; margin-top: 15px; }
          .role-card { border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #F8FAFC; page-break-inside: avoid; }
          .tag-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 12px; }
          .tag-pill { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px; min-width: 140px; text-align: center; }
          .shortcut-box { border: 1px solid #E2E8F0; background: #F1F5F9; border-left: 4px solid #E11D48; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-family: monospace; font-size: 12px; page-break-inside: avoid; }
          .shortcut-name { font-weight: bold; color: #E11D48; margin-bottom: 4px; font-size: 13px; }
          ul { margin-top: 4px; padding-left: 20px; }
          li { margin-bottom: 4px; }
          .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">MVP FLOW BOUTIQUE RD</div>
            <div style="font-size: 13px; color: #475569; font-weight: 600;">Manual de Operaciones & Protocolo de Atención Whaticket</div>
            <div style="font-size: 11px; color: #64748B;">Av. San Vicente de Paúl, Los Mina, Santo Domingo Este • WhatsApp: (809) 656-0219</div>
          </div>
          <div class="badge">DOCUMENTO OFICIAL 2026</div>
        </div>

        <h2>1. Organigrama de Roles & Cadena de Valor</h2>
        
        <div class="role-card">
          <h3>ROL 1: AGENTE DE VENTAS WHATICKET (Recepción & Cierre)</h3>
          <ul>
            <li><strong>Tiempo de respuesta máximo:</strong> Menor a 3 minutos por cliente.</li>
            <li><strong>Saludo oficial:</strong> Enviar <code>/saludo</code> con energía y respeto dominicano.</li>
            <li><strong>Confirmación de tallas:</strong> Validar numeración RD (38 al 44) y enviar fotos reales.</li>
            <li><strong>Captura de datos COD:</strong> Nombre, teléfono, dirección exacta y referencia física.</li>
            <li><strong>Etiqueta Whaticket:</strong> Asignar <em>PEDIDO CONFIRMADO COD</em>.</li>
          </ul>
        </div>

        <div class="role-card">
          <h3>ROL 2: ENCARGADO DE ALMACÉN & CONTROL DE CALIDAD G5 (Los Mina)</h3>
          <ul>
            <li><strong>Inspección visual:</strong> Verificar que suela, costuras y cordones estén 100% nítidos.</li>
            <li><strong>Empaque en caja original:</strong> Empacar calzado en su caja correspondiente con papel protector.</li>
            <li><strong>Etiquetado de Ticket:</strong> Pegar el número de ticket <code>#MVP-XXXXXX</code> con el total a cobrar en RD$.</li>
          </ul>
        </div>

        <div class="role-card">
          <h3>ROL 3: MENSAJERÍA & DELIVERY EXPRESS COD</h3>
          <ul>
            <li><strong>Llamada previa:</strong> Contactar al cliente 15 minutos antes de llegar al domicilio.</li>
            <li><strong>Cobro obligatorio:</strong> Cobrar en efectivo o transferencia verificada al momento de la entrega.</li>
            <li><strong>Reporte de entrega:</strong> Notificar de inmediato al grupo de WhatsApp del almacén.</li>
          </ul>
        </div>

        <h2>2. Sistema de Etiquetas (Embudo de Ventas Whaticket)</h2>
        <div class="tag-row"><span class="tag-pill" style="background:#FEF08A; color:#854D0E;">🟡 NUEVO PROSPECTO</span> Primer contacto o duda general. Responder en &lt;3 min.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#BFDBFE; color:#1E40AF;">🔵 SELECCIÓN TALLA</span> Dudas de tallas o fotos reales. Asesorar con guía.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#E9D5FF; color:#6B21A8;">🟣 PEDIDO CONFIRMADO</span> Datos de envío tomados. Pasa a almacén para empaque.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#FED7AA; color:#9A3412;">🚚 EN RUTA DELIVERY</span> Mensajero en la calle con el paquete.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#BBF7D0; color:#166534;">🟢 ENTREGADO Y COBRADO</span> Entrega exitosa. Dinero recaudado en COD.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#FECDD3; color:#9F1239;">🔴 CAMBIO / SOPORTE</span> Solicitud de cambio de talla o garantía.</div>

        <h2>3. Banco de Respuestas Rápidas (Atajos /)</h2>
        
        <div class="shortcut-box">
          <div class="shortcut-name">/bienvenida (o /saludo)</div>
          Hola, le asiste Ashley ! 👋🔥<br><br>
          Bienvenido/a a MVP FLOW BOUTIQUE RD, la tienda #1 en tenis y ropa urbana. Será un placer atenderte. 🛍️<br><br>
          Cuéntame, ¿qué modelo o talla estás buscando hoy? Te envío fotos reales y toda la información de una vez. 👟✨
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/despedida</div>
          ¡Gracias por comunicarte con MVP FLOW BOUTIQUE RD! 🙌🔥<br><br>
          Ha sido un placer atenderte. Recuerda que estamos a la orden para ayudarte con cualquier modelo, talla o información que necesites.<br><br>
          ¡Esperamos verte pronto! 👟🛍️✨
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/ubicacion</div>
          📍 Estamos en la Av. San Vicente de Paúl, Los Mina, Santo Domingo Este (al lado del Metro Trina de Moya).<br>
          🕒 Horario: Lunes a Domingo de 9:00 AM a 9:00 PM. ¡Pasa por la tienda o te los enviamos hoy a tu casa! 🛵
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/cod</div>
          💵 ¿Cómo funciona el Pago Contra Entrega?<br>
          1. Confirmas tu pedido hoy.<br>
          2. El mensajero llega a tu dirección (2 a 4h en Santo Domingo).<br>
          3. Revisas tu calzado en mano y pagas en efectivo en el momento. ¡100% seguro!
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/confirmar</div>
          📦 Para despachar tu paquete hoy mismo, envíanos:<br>
          • Nombre Completo: <br>
          • Teléfono de Contacto: <br>
          • Provincia y Sector: <br>
          • Calle y Número de Casa/Apto: <br>
          • Punto de Referencia: <br>
          • Modelo y Talla:
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/seguimiento</div>
          ¡Saludos mi líder! 👋 ¿Qué tal te quedó la pinta que recibiste de MVP FLOW BOUTIQUE RD?<br>
          Si puedes, tómate una foto y etiquétanos en Instagram @mvp_flow_boutique08 para repostearte. 🔥👟
        </div>

        <div class="footer">
          © 2026 MVP FLOW BOUTIQUE RD • Confidencial • Uso Exclusivo del Personal de Operaciones y Ventas
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(pdfHtml);
    printWindow.document.close();
  };

  if (!isManualOpen) return null;

  // PIN Access Gate (Clean Slate Presentation Theme)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-5 text-center">
          <button
            onClick={() => setIsManualOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
            <BookOpen size={28} />
          </div>

          <div>
            <span className="text-[11px] bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-black uppercase tracking-wider">
              MATERIAL EXCLUSIVO DEL PERSONAL
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-2.5">
              Manual de Capacitación Whaticket
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
              Introduce el código de acceso del equipo para desbloquear las diapositivas de entrenamiento.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
            <div>
              <input
                type="text"
                autoFocus
                required
                placeholder="CÓDIGO: MVP4878"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full bg-slate-50 border border-slate-300 focus:border-rose-500 focus:bg-white rounded-2xl px-4 py-3 text-sm text-slate-900 font-mono tracking-widest text-center focus:outline-none uppercase font-bold"
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 font-bold flex items-center justify-center gap-1">
                <span>Código incorrecto. Solicita la clave a gerencia.</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-600/30 transition-all"
            >
              Desbloquear Diapositivas
            </button>
          </form>

          <div className="text-[11px] text-slate-400 pt-1 font-medium">
            MVP FLOW BOUTIQUE RD • Sistema de Inducción y Ventas
          </div>
        </div>
      </div>
    );
  }

  const SLIDES = [
    { title: '1. Roles & Flujo', icon: Users },
    { title: '2. Etiquetas Whaticket', icon: Zap },
    { title: '3. Respuestas Rápidas (/)', icon: MessageSquare },
    { title: '4. Simulador de Chat', icon: Play },
    { title: '5. Certificación', icon: Award },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col font-sans">
        
        {/* Modern Slide Header (Light & Friendly) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  MANUAL DE OPERACIONES & WHATICKET
                </h2>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Acceso Autorizado
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                MVP FLOW BOUTIQUE RD • Inducción, Protocolos de WhatsApp y Cobro Contra Entrega (COD).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow transition-all hover:scale-105 active:scale-95"
              title="Descargar PDF con membrete oficial"
            >
              <Download size={14} className="text-amber-400" />
              <span>Descargar PDF</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold border border-slate-200 transition-colors"
            >
              Bloquear
            </button>

            <button
              onClick={() => setIsManualOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Slide Tab Selector Bar */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2.5 gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
          {SLIDES.map((slide, idx) => {
            const Icon = slide.icon;
            const isActive = currentSlide === idx;
            return (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-rose-400' : 'text-slate-400'} />
                <span>{slide.title}</span>
              </button>
            );
          })}
        </div>

        {/* Slide Content Area (Modern, Clean, Easy-to-Read Deck) */}
        <div className="overflow-y-auto p-4 sm:p-7 flex-1 bg-slate-50/50 space-y-6">
          
          {/* SLIDE 1: ROLES Y RESPONSABILIDADES */}
          {currentSlide === 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-rose-50 via-white to-slate-50 p-5 rounded-2xl border border-rose-100 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                    Cadena de Valor & Responsabilidades del Equipo
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    La velocidad de respuesta y la claridad son la clave para que cada lead de Whaticket se convierta en una venta cobrada el mismo día.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ROL 1 */}
                <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-blue-50 text-blue-700 px-3 py-1 rounded-lg uppercase tracking-wider border border-blue-200">
                      ROL 1: AGENTE DE VENTAS WHATICKET
                    </span>
                    <MessageSquare size={18} className="text-blue-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Recepción, Asesoría & Cierre de Pedidos</h4>
                  <ul className="text-xs text-slate-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Tiempo de respuesta:</strong> Menor a 3 minutos por cliente.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Saludo y Bienvenida:</strong> Usar el atajo <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono font-bold">/bienvenida</code> presentándote con tu nombre.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Validación de Tallas:</strong> Confirmar numeración RD (38 al 44) enviando fotos reales de los tenis.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Captura de Datos COD:</strong> Nombre, teléfono, dirección exacta, sector y referencia del hogar.</span>
                    </li>
                  </ul>
                </div>

                {/* ROL 2 */}
                <div className="bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-amber-50 text-amber-700 px-3 py-1 rounded-lg uppercase tracking-wider border border-amber-200">
                      ROL 2: ENCARGADO DE ALMACÉN (LOS MINA)
                    </span>
                    <ShieldCheck size={18} className="text-amber-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Control de Calidad G5 & Empaque</h4>
                  <ul className="text-xs text-slate-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Inspección visual:</strong> Revisar que suelas, cordones y costuras no tengan defectos de fábrica.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Caja original:</strong> Empacar calzado en su caja correspondiente con papel protector de tienda.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Etiquetado de Ticket:</strong> Pegar el ticket de entrega con el número <code className="bg-slate-100 text-slate-900 font-mono font-bold">#MVP-XXXXXX</code> y el monto exacto en RD$.</span>
                    </li>
                  </ul>
                </div>

                {/* ROL 3 */}
                <div className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg uppercase tracking-wider border border-emerald-200">
                      ROL 3: MENSAJERÍA EXPRESS COD
                    </span>
                    <Truck size={18} className="text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Entrega en Mano & Cobro en Efectivo</h4>
                  <ul className="text-xs text-slate-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Llamada previa:</strong> Contactar al cliente 15 minutos antes de llegar al domicilio.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Cobro obligatorio:</strong> Cobrar el monto exacto antes de entregar el paquete (Efectivo o Transferencia verificada).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Reporte en tiempo real:</strong> Enviar foto del recibo o confirmación al grupo de WhatsApp del almacén.</span>
                    </li>
                  </ul>
                </div>

                {/* ROL 4 */}
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black bg-rose-50 text-rose-700 px-3 py-1 rounded-lg uppercase tracking-wider border border-rose-200">
                      ROL 4: SUPERVISOR DE OPERACIONES
                    </span>
                    <TrendingUp size={18} className="text-rose-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Gestión de Colas & Cuadre Diario</h4>
                  <ul className="text-xs text-slate-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span><strong>Monitoreo Whaticket:</strong> Reasignar chats pendientes si un vendedor está ocupado.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span><strong>Auditoría de Calidad:</strong> Validar que todo el equipo utilice las respuestas rápidas oficiales.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-600 font-bold">•</span>
                      <span><strong>Cuadre de Ventas:</strong> Cuadrar el efectivo cobrado en COD al cierre de la jornada (9:00 PM).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: SISTEMA DE ETIQUETAS WHATICKET */}
          {currentSlide === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Embudo de Ventas: Las 6 Etiquetas Obligatorias en Whaticket
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Todo contacto en Whaticket debe tener una etiqueta asignada para que el equipo completo conozca el estado de la venta.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-yellow-400 shadow-sm space-y-1.5">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-2.5 py-1 rounded-md uppercase">
                    🟡 1. NUEVO PROSPECTO
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    Cliente que escribe por primera vez o pide información.
                  </p>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    ⚡ <strong>Acción:</strong> Enviar <code>/bienvenida</code> con tu nombre y catálogo en menos de 3 minutos.
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-500 shadow-sm space-y-1.5">
                  <span className="bg-blue-100 text-blue-800 text-xs font-black px-2.5 py-1 rounded-md uppercase">
                    🔵 2. SELECCIÓN DE TALLA
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    Cliente eligiendo modelo o preguntando equivalencia de talla.
                  </p>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    👟 <strong>Acción:</strong> Enviar guía <code>/tallas</code> y fotos reales tomadas en tienda.
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-purple-500 shadow-sm space-y-1.5">
                  <span className="bg-purple-100 text-purple-800 text-xs font-black px-2.5 py-1 rounded-md uppercase">
                    🟣 3. PEDIDO CONFIRMADO COD
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    Cliente envió dirección completa y confirmó la compra.
                  </p>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    📦 <strong>Acción:</strong> Enviar <code>/confirmar</code> y pasar datos a Almacén para empacar.
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 shadow-sm space-y-1.5">
                  <span className="bg-amber-100 text-amber-800 text-xs font-black px-2.5 py-1 rounded-md uppercase">
                    🚚 4. EN RUTA DELIVERY
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    El mensajero express tiene el paquete en la calle.
                  </p>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    🛵 <strong>Acción:</strong> Notificar tiempo estimado de llegada (2 a 4 horas).
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 shadow-sm space-y-1.5">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-md uppercase">
                    🟢 5. ENTREGADO Y COBRADO
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    Entrega exitosa y dinero recaudado en mano por el delivery.
                  </p>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    ⭐ <strong>Acción:</strong> A las 24 horas enviar <code>/seguimiento</code> para reseña.
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 border-l-4 border-l-rose-500 shadow-sm space-y-1.5">
                  <span className="bg-rose-100 text-rose-800 text-xs font-black px-2.5 py-1 rounded-md uppercase">
                    🔴 6. CAMBIO / SOPORTE
                  </span>
                  <p className="text-xs text-slate-700 font-medium">
                    Cliente solicita cambio de número o ajuste de prenda.
                  </p>
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                    🔄 <strong>Acción:</strong> Coordinar cambio en 24h con máxima amabilidad.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: BANCO DE RESPUESTAS RÁPIDAS (ATAJOS WHATICKET) */}
          {currentSlide === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Banco de Respuestas Rápidas (Configuración en Whaticket "/")
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Toca el botón <strong>Copiar</strong> para pegar directamente en Whaticket.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <User size={14} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">Tu Nombre:</span>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Ashley"
                    className="bg-white border border-slate-300 focus:border-rose-600 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-900 focus:outline-none w-28 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SHORTCUT: /bienvenida */}
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-4 space-y-2 shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono bg-rose-600 text-white px-2.5 py-0.5 rounded-md">
                        /bienvenida
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✨ Saludo & Asesor
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `Hola, le asiste ${agentName.trim() || 'Ashley'} ! 👋🔥\n\n` +
                          `Bienvenido/a a MVP FLOW BOUTIQUE RD, la tienda #1 en tenis y ropa urbana. Será un placer atenderte. 🛍️\n\n` +
                          `Cuéntame, ¿qué modelo o talla estás buscando hoy? Te envío fotos reales y toda la información de una vez. 👟✨`,
                          'bienvenida'
                        )
                      }
                      className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 font-bold transition-colors"
                    >
                      {copiedShortcut === 'bienvenida' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedShortcut === 'bienvenida' ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {`Hola, le asiste ${agentName.trim() || 'Ashley'} ! 👋🔥\n\nBienvenido/a a MVP FLOW BOUTIQUE RD, la tienda #1 en tenis y ropa urbana. Será un placer atenderte. 🛍️\n\nCuéntame, ¿qué modelo o talla estás buscando hoy? Te envío fotos reales y toda la información de una vez. 👟✨`}
                  </div>
                </div>

                {/* SHORTCUT: /despedida */}
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-2xl p-4 space-y-2 shadow-sm transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono bg-rose-600 text-white px-2.5 py-0.5 rounded-md">
                        /despedida
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        🙌 Despedida & Cierre
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `¡Gracias por comunicarte con MVP FLOW BOUTIQUE RD! 🙌🔥\n\n` +
                          `Ha sido un placer atenderte. Recuerda que estamos a la orden para ayudarte con cualquier modelo, talla o información que necesites.\n\n` +
                          `¡Esperamos verte pronto! 👟🛍️✨`,
                          'despedida'
                        )
                      }
                      className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 font-bold transition-colors"
                    >
                      {copiedShortcut === 'despedida' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedShortcut === 'despedida' ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {`¡Gracias por comunicarte con MVP FLOW BOUTIQUE RD! 🙌🔥\n\nHa sido un placer atenderte. Recuerda que estamos a la orden para ayudarte con cualquier modelo, talla o información que necesites.\n\n¡Esperamos verte pronto! 👟🛍️✨`}
                  </div>
                </div>

                {/* SHORTCUT: /ubicacion */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono bg-rose-600 text-white px-2.5 py-0.5 rounded-md">
                      /ubicacion
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `📍 *UBICACIÓN OFICIAL DE NUESTRA TIENDA:*\n\n` +
                          `Estamos ubicados en la *Av. San Vicente de Paúl, Los Mina, Santo Domingo Este* (justo al lado de la estación del metro Trina de Moya de Vázquez).\n\n` +
                          `🕒 *Horario:* Lunes a Domingo de 9:00 AM a 9:00 PM.\n` +
                          `¡Pasa por allá a medírtelos o te los enviamos hoy mismo a tu casa con mensajero! 🛵`,
                          'ubicacion'
                        )
                      }
                      className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 font-bold transition-colors"
                    >
                      {copiedShortcut === 'ubicacion' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedShortcut === 'ubicacion' ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed">
                    {`📍 *UBICACIÓN OFICIAL DE NUESTRA TIENDA:*\n\nEstamos ubicados en la *Av. San Vicente de Paúl, Los Mina, Santo Domingo Este* (justo al lado de la estación del metro Trina de Moya de Vázquez).\n\n🕒 *Horario:* Lunes a Domingo de 9:00 AM a 9:00 PM.\n¡Pasa por allá a medírtelos o te los enviamos hoy mismo a tu casa con mensajero! 🛵`}
                  </div>
                </div>

                {/* SHORTCUT: /cod */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono bg-rose-600 text-white px-2.5 py-0.5 rounded-md">
                      /cod
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `💵 *¿CÓMO FUNCIONA EL PAGO CONTRA ENTREGA?*\n\n` +
                          `1. Tú confirmas tu pedido hoy.\n` +
                          `2. Nuestro mensajero express sale para tu dirección.\n` +
                          `3. Te entregamos tus tenis en mano, los revisas y *pagas en efectivo o transferencia* en el momento.\n\n` +
                          `¡Cero riesgo para ti! 100% seguro y garantizado. 💯`,
                          'cod'
                        )
                      }
                      className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 font-bold transition-colors"
                    >
                      {copiedShortcut === 'cod' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedShortcut === 'cod' ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed">
                    {`💵 *¿CÓMO FUNCIONA EL PAGO CONTRA ENTREGA?*\n\n1. Tú confirmas tu pedido hoy.\n2. Nuestro mensajero express sale para tu dirección.\n3. Te entregamos tus tenis en mano, los revisas y *pagas en efectivo o transferencia* en el momento.\n\n¡Cero riesgo para ti! 100% seguro y garantizado. 💯`}
                  </div>
                </div>

                {/* SHORTCUT: /confirmar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono bg-rose-600 text-white px-2.5 py-0.5 rounded-md">
                      /confirmar
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `📦 *PARA DESPACHAR TU PAQUETE HOY MISMO, ENVÍANOS ESTOS DATOS:*\n\n` +
                          `• *Nombre Completo:*\n` +
                          `• *Teléfono de Contacto:*\n` +
                          `• *Provincia y Sector:*\n` +
                          `• *Calle y Número de Casa/Apto:*\n` +
                          `• *Punto de Referencia (cerca de qué colmado o lugar):*\n` +
                          `• *Modelo y Talla:*\n\n` +
                          `¡Apenas nos envíes esto, empaquetamos y te asignamos el mensajero de inmediato! 🛵💨`,
                          'confirmar'
                        )
                      }
                      className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 font-bold transition-colors"
                    >
                      {copiedShortcut === 'confirmar' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedShortcut === 'confirmar' ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed">
                    {`📦 *PARA DESPACHAR TU PAQUETE HOY MISMO, ENVÍANOS ESTOS DATOS:*\n\n• *Nombre Completo:*\n• *Teléfono de Contacto:*\n• *Provincia y Sector:*\n• *Calle y Número de Casa/Apto:*\n• *Punto de Referencia:*\n• *Modelo y Talla:*\n\n¡Apenas nos envíes esto, empaquetamos y te asignamos el mensajero de inmediato! 🛵💨`}
                  </div>
                </div>

                {/* SHORTCUT: /seguimiento */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono bg-rose-600 text-white px-2.5 py-0.5 rounded-md">
                      /seguimiento
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `¡Saludos mi líder! 👋 ¿Qué tal te quedó la pinta que recibiste de *MVP FLOW BOUTIQUE RD*?\n\n` +
                          `Si puedes, tómate una foto y etiquétanos en Instagram *@mvp_flow_boutique08* para repostearte. 🔥👟`,
                          'seguimiento'
                        )
                      }
                      className="flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 font-bold transition-colors"
                    >
                      {copiedShortcut === 'seguimiento' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedShortcut === 'seguimiento' ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line leading-relaxed">
                    {`¡Saludos mi líder! 👋 ¿Qué tal te quedó la pinta que recibiste de *MVP FLOW BOUTIQUE RD*?\n\nSi puedes, tómate una foto y etiquétanos en Instagram *@mvp_flow_boutique08* para repostearte. 🔥👟`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: SIMULADOR DE CHAT INTERACTIVO */}
          {currentSlide === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Play size={18} className="text-rose-600" />
                    <span>Simulador de Ventas Whaticket (Entrenamiento en Vivo)</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Practica cómo responder de forma asertiva para asegurar el cierre de venta en COD.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSimStep(0);
                    setSimMessages([
                      { sender: 'client', text: '¡Hola! Vi los Jordan 5 Retro en su página, ¿tienen talla 41 disponible para entrega hoy?' }
                    ]);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Reiniciar Chat</span>
                </button>
              </div>

              {/* Chat Container */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col h-[400px] justify-between shadow-sm">
                <div className="overflow-y-auto space-y-3 pr-2">
                  {simMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl text-xs ${
                          msg.sender === 'staff'
                            ? 'bg-rose-600 text-white rounded-br-none shadow-sm font-medium'
                            : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none font-medium'
                        }`}
                      >
                        <span className={`text-[10px] block font-black mb-1 uppercase ${msg.sender === 'staff' ? 'text-rose-200' : 'text-slate-500'}`}>
                          {msg.sender === 'staff' ? 'Tú (Agente Whaticket)' : 'Cliente'}
                        </span>
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Training options */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <div className="text-xs text-slate-700 font-bold">
                    Elige la mejor opción según el protocolo:
                  </div>

                  {simStep === 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          setSimMessages((prev) => [
                            ...prev,
                            { sender: 'staff', text: '¡Dímelo mi líder! 🔥 Sí tenemos los Jordan 5 Retro en talla 41 disponibles para entrega hoy en 2 a 4 horas. Pagas al recibir en tu puerta (RD$ 2,450). ¿Para qué sector te los enviamos?' },
                            { sender: 'client', text: '¡Excelente! Es para Santo Domingo Este, cerca de Megacentro. ¿Cómo es el pago?' }
                          ]);
                          setSimStep(1);
                        }}
                        className="text-left text-xs bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 p-3 rounded-xl text-slate-800 transition-all font-medium"
                      >
                        ✅ <strong>Respuesta Óptima:</strong> Saludar con energía, confirmar talla 41, precio COD y preguntar sector de entrega.
                      </button>

                      <button
                        onClick={() => alert('❌ Respuesta fría. Siempre debes saludar con energía, dar precio y preguntar la dirección.')}
                        className="text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-xl text-slate-500 transition-all"
                      >
                        ⚠️ <strong>Respuesta Incompleta:</strong> "Sí tenemos, entra a la web a pedir".
                      </button>
                    </div>
                  )}

                  {simStep === 1 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => {
                          setSimMessages((prev) => [
                            ...prev,
                            { sender: 'staff', text: '💵 El pago es 100% contra entrega: el mensajero llega a tu casa en Megacentro, te entrega la caja, revisas tus Jordan 5 y le pagas en efectivo en mano. Pásame tu nombre y dirección exacta para despachar ahora.' },
                            { sender: 'client', text: '¡Perfecto hermano! Soy Carlos Jiménez, C/ 4ta #12 Los Mina. Tel: 829-555-0123. ¡Mándamelos!' }
                          ]);
                          setSimStep(2);
                        }}
                        className="text-left text-xs bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 p-3 rounded-xl text-slate-800 transition-all font-medium"
                      >
                        ✅ <strong>Explicar COD:</strong> Aclarar que revisa primero y paga al recibir, pidiendo dirección completa.
                      </button>
                    </div>
                  )}

                  {simStep === 2 && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center space-y-1">
                      <p className="text-xs font-black text-emerald-800 uppercase">
                        🎉 ¡PEDIDO CERRADO EXITOSAMENTE!
                      </p>
                      <p className="text-xs text-emerald-700">
                        Paso siguiente: Asignar etiqueta <span className="font-bold">🟣 PEDIDO CONFIRMADO COD</span> y pasar los datos a Almacén.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: CHECKLIST DE CERTIFICACIÓN */}
          {currentSlide === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Award size={20} className="text-rose-600" />
                    <span>Checklist de Certificación de Atención al Cliente</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Marca cada punto para certificar tu dominio del sistema Whaticket de MVP FLOW RD.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-sm font-black text-slate-900">{completedCount} de {checklist.length} Completados</span>
                  <div className="w-40 bg-slate-200 rounded-full h-2.5 mt-1 overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  'Dominio de los 4 Roles operativos (Ventas, Almacén, Delivery, Supervisor).',
                  'Uso obligatorio de las 6 Etiquetas de Whaticket para todo chat activo.',
                  'Manejo fluido de los atajos de respuestas rápidas (/bienvenida, /despedida, /ubicacion, /cod, /confirmar, /seguimiento).',
                  'Protocolo de verificación de tallas y envío de fotos reales del producto.',
                  'Explicación clara del Pago Contra Entrega (COD) para eliminar dudas del cliente.',
                  'Tiempos de entrega exactos: 2 a 4h en Santo Domingo y 24-48h en Provincias.',
                  'Protocolo de empaque con caja original y sellos de inspección de calidad G5.',
                  'Mensaje de seguimiento post-venta (/seguimiento) para conseguir reseñas en Google.'
                ].map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => toggleChecklistItem(idx)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      checklist[idx]
                        ? 'bg-rose-50/80 border-rose-200 text-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checklist[idx]}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold select-none flex-1">{item}</span>
                    {checklist[idx] && <CheckCircle2 size={18} className="text-rose-600" />}
                  </label>
                ))}
              </div>

              {progressPercent === 100 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 p-5 rounded-2xl text-center space-y-1 shadow-md">
                  <Award size={32} className="text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-black text-emerald-900 uppercase">
                    ¡FELICITACIONES! ESTÁS 100% CERTIFICADO EN MVP FLOW RD
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Has completado todos los estándares operativos para brindar una atención de clase mundial en Whaticket.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Slide Footer with Pagination Buttons */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              currentSlide === 0
                ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ArrowLeft size={15} />
            <span>Diapositiva Anterior</span>
          </button>

          <span className="text-xs font-black text-slate-500 tracking-wider">
            DIAPOSITIVA {currentSlide + 1} DE {SLIDES.length}
          </span>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentSlide === SLIDES.length - 1
                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
            }`}
          >
            <span>Siguiente Diapositiva</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
