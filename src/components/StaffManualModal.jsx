import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Users, 
  Zap, 
  MessageSquare, 
  Play, 
  Award, 
  CheckCircle, 
  Copy, 
  Check, 
  Download, 
  ChevronRight,
  Package,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const StaffManualModal = () => {
  const { isManualOpen, setIsManualOpen } = useCart();

  // Access Code Protection: PIN PLASTIR2026
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('plastir_staff_auth') === 'true' || sessionStorage.getItem('mvpflow_staff_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0); // 0: Roles, 1: Etiquetas, 2: Atajos, 3: Simulador, 4: Certificación
  const [copiedShortcut, setCopiedShortcut] = useState(null);
  const [agentName, setAgentName] = useState(() => localStorage.getItem('plastir_agent_name') || 'Asesor Plastir');

  // Training Checklist state
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem('plastir_staff_checklist_v1');
      return saved ? JSON.parse(saved) : [false, false, false, false, false, false, false, false];
    } catch {
      return [false, false, false, false, false, false, false, false];
    }
  });

  // Simulator Chat State
  const [simStep, setSimStep] = useState(0);
  const [simMessages, setSimMessages] = useState([
    { sender: 'client', text: '¡Hola! Vi el Organizador Multiuso de 4 Niveles en su página, ¿tienen disponibilidad para entrega hoy?' }
  ]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const val = pinInput.trim().toUpperCase();
    if (val === 'PLASTIR2026' || val === 'MVP4878') {
      setIsAuthenticated(true);
      sessionStorage.setItem('plastir_staff_auth', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('plastir_staff_auth');
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
    localStorage.setItem('plastir_staff_checklist_v1', JSON.stringify(updated));
  };

  const completedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  // Generate and print styled PDF Document
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para generar el PDF.');
      return;
    }

    const pdfHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Manual_Operaciones_Whaticket_PLASTIR_RD</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; line-height: 1.5; padding: 20px; font-size: 13px; }
          .header { border-bottom: 3px solid #F16100; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 24px; font-weight: 900; color: #F16100; text-transform: uppercase; letter-spacing: 1px; }
          .badge { background: #059669; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; }
          h2 { color: #0F172A; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; font-size: 16px; margin-top: 25px; text-transform: uppercase; }
          h3 { color: #F16100; font-size: 14px; margin-bottom: 4px; margin-top: 15px; }
          .role-card { border: 1px solid #CBD5E1; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #F8FAFC; page-break-inside: avoid; }
          .tag-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 12px; }
          .tag-pill { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; margin-right: 10px; min-width: 140px; text-align: center; }
          .shortcut-box { border: 1px solid #E2E8F0; background: #F1F5F9; border-left: 4px solid #F16100; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-family: monospace; font-size: 12px; page-break-inside: avoid; }
          .shortcut-name { font-weight: bold; color: #F16100; margin-bottom: 4px; font-size: 13px; }
          ul { margin-top: 4px; padding-left: 20px; }
          li { margin-bottom: 4px; }
          .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">PLASTIR RD</div>
            <div style="font-size: 13px; color: #475569; font-weight: 600;">Manual de Operaciones & Protocolo de Atención Whaticket</div>
            <div style="font-size: 11px; color: #64748B;">Almacén Central de Despacho, Santo Domingo • WhatsApp: (809) 656-0219</div>
          </div>
          <div class="badge">DOCUMENTO OFICIAL 2026</div>
        </div>

        <h2>1. Organigrama de Roles & Cadena de Valor</h2>
        
        <div class="role-card">
          <h3>ROL 1: ASESOR DE VENTAS & ATENCIÓN AL CLIENTE (Whaticket)</h3>
          <ul>
            <li><strong>Tiempo de respuesta máximo:</strong> Menor a 3 minutos por cliente.</li>
            <li><strong>Saludo oficial:</strong> Enviar <code>/bienvenida</code> con cordialidad profesional.</li>
            <li><strong>Asesoría de medidas:</strong> Validar capacidad en litros, dimensiones en cm y compatibilidad en el hogar.</li>
            <li><strong>Captura de datos COD:</strong> Nombre, teléfono, dirección exacta y punto de referencia.</li>
            <li><strong>Etiqueta Whaticket:</strong> Asignar <em>PEDIDO CONFIRMADO COD</em>.</li>
          </ul>
        </div>

        <div class="role-card">
          <h3>ROL 2: ENCARGADO DE ALMACÉN & CONTROL DE CALIDAD</h3>
          <ul>
            <li><strong>Inspección visual:</strong> Verificar que tapas, broches, ruedas y estructuras plásticas no presenten fisuras.</li>
            <li><strong>Empaque seguro:</strong> Embalar con film protector y esquineros para evitar roturas durante el transporte.</li>
            <li><strong>Etiquetado de Ticket:</strong> Pegar el número de ticket <code>#PLASTIR-XXXXXX</code> con el total a cobrar en RD$.</li>
          </ul>
        </div>

        <div class="role-card">
          <h3>ROL 3: MENSAJERÍA & LOGÍSTICA DE ENTREGA</h3>
          <ul>
            <li><strong>Llamada previa:</strong> Contactar al cliente 15 a 30 minutos antes de llegar a la dirección.</li>
            <li><strong>Cobro obligatorio:</strong> Cobrar en efectivo o transferencia confirmada al momento de la entrega.</li>
            <li><strong>Reporte de entrega:</strong> Notificar la entrega exitosa de inmediato en el sistema.</li>
          </ul>
        </div>

        <h2>2. Sistema de Etiquetas (Embudo Whaticket)</h2>
        <div class="tag-row"><span class="tag-pill" style="background:#FEF08A; color:#854D0E;">🟡 NUEVO PROSPECTO</span> Primer contacto o duda general. Responder en &lt;3 min.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#BFDBFE; color:#1E40AF;">🔵 ASESORÍA MEDIDAS</span> Dudas sobre medidas, litros o colores disponibles.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#E9D5FF; color:#6B21A8;">🟣 PEDIDO CONFIRMADO</span> Datos de envío tomados. Pasa a almacén para empaque.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#FED7AA; color:#9A3412;">🚚 EN RUTA DELIVERY</span> Mensajero en camino con los artículos.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#BBF7D0; color:#166534;">🟢 ENTREGADO Y COBRADO</span> Entrega completada y cobro verificado.</div>
        <div class="tag-row"><span class="tag-pill" style="background:#FECDD3; color:#9F1239;">🔴 POST-VENTA / GARANTÍA</span> Consulta sobre cambio o reposición de pieza.</div>

        <h2>3. Banco de Respuestas Rápidas</h2>
        
        <div class="shortcut-box">
          <div class="shortcut-name">/bienvenida (o /saludo)</div>
          ¡Hola! Le asiste ${agentName.trim() || 'Asesor'} de PLASTIR RD 👋📦<br><br>
          Bienvenido/a a la tienda oficial de organización inteligente y artículos para el hogar. Será un placer atenderle.<br><br>
          Cuéntenos, ¿qué organizadores, gaveteros o cajas plásticas está buscando hoy?
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/despedida</div>
          ¡Gracias por comunicarse con PLASTIR RD! 🙌📦<br><br>
          Ha sido un placer atenderle. Recuerde que estamos a su disposición para cualquier consulta de medidas, capacidades o cotizaciones por volumen.<br><br>
          ¡Que tenga un excelente día! ✨
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/ubicacion</div>
          📍 Despachamos desde nuestro almacén central en Santo Domingo hacia todo el país.<br>
          🛵 Gran Santo Domingo: 2 a 4 horas / mismo día.<br>
          🚚 Interior del País: 24 a 48 horas garantizado.
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/cod</div>
          💵 ¿Cómo funciona el Pago al Recibir?<br>
          1. Confirma su pedido.<br>
          2. Despachamos a su puerta con empaque protector.<br>
          3. Recibe, verifica el producto y paga al mensajero. ¡Cero riesgo!
        </div>

        <div class="shortcut-box">
          <div class="shortcut-name">/confirmar</div>
          📦 Para despachar su pedido hoy mismo, facilítenos:<br>
          • Nombre Completo: <br>
          • Teléfono de Contacto: <br>
          • Sector / Municipio: <br>
          • Dirección Exacta: <br>
          • Punto de Referencia: <br>
          • Productos y Cantidades:
        </div>

        <div class="footer">
          © 2026 PLASTIR RD • Documento Oficial • Uso Exclusivo del Personal de Operaciones
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

  // PIN Access Gate
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

          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F16100] mx-auto shadow-sm">
            <BookOpen size={28} />
          </div>

          <div>
            <span className="text-[11px] bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              MATERIAL EXCLUSIVO DEL PERSONAL
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2.5">
              Manual de Operaciones & Protocolo
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Introduce el código de acceso del equipo para consultar las directrices de atención y despacho.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
            <div>
              <input
                type="text"
                autoFocus
                required
                placeholder="CÓDIGO: PLASTIR2026"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#F16100] focus:bg-white rounded-2xl px-4 py-3 text-sm text-slate-900 font-mono tracking-widest text-center focus:outline-none uppercase font-bold"
              />
            </div>

            {pinError && (
              <p className="text-xs text-red-600 font-bold flex items-center justify-center gap-1">
                <span>Código incorrecto. Solicita la clave a supervisión.</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#F16100] hover:bg-[#d55500] active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all"
            >
              Desbloquear Manual
            </button>
          </form>

          <div className="text-[11px] text-slate-400 pt-1 font-medium">
            PLASTIR RD • Sistema de Inducción y Protocolo de Ventas
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
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F16100] flex items-center justify-center text-white shadow-sm">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  MANUAL DE OPERACIONES & ATENCIÓN
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  PLASTIR RD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Inducción para asesores, protocolo de WhatsApp y logística de entrega COD.
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
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold border border-slate-200 transition-colors"
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
                <Icon size={15} className={isActive ? 'text-[#F16100]' : 'text-slate-400'} />
                <span>{slide.title}</span>
              </button>
            );
          })}
        </div>

        {/* Slide Content Area */}
        <div className="overflow-y-auto p-4 sm:p-7 flex-1 bg-slate-50/50 space-y-6">
          
          {/* SLIDE 1: ROLES */}
          {currentSlide === 0 && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-1">
                  Flujo de Operaciones: Desde el Lead hasta la Entrega
                </h3>
                <p className="text-xs text-slate-500">
                  Cada pedido pasa por 3 estaciones clave para garantizar un servicio rápido y confiable.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">1. Asesor Whaticket</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>Responder en menos de 3 minutos.</li>
                    <li>Asesorar capacidades en litros y medidas de espacio.</li>
                    <li>Capturar datos completos para despacho COD.</li>
                    <li>Colocar etiqueta <strong>PEDIDO CONFIRMADO COD</strong>.</li>
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F16100] flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">2. Almacén & Empaque</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>Inspección visual: broches, tapas y plásticos sin grietas.</li>
                    <li>Embalaje protector para evitar daños en ruta.</li>
                    <li>Rotulación con ticket <code>#PLASTIR-XXXXXX</code> y monto RD$.</li>
                  </ul>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Truck size={20} />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase">3. Mensajería & Cobro</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    <li>Llamada de aviso al cliente 15 min antes de llegar.</li>
                    <li>Entrega en puerta y verificación física de la mercancía.</li>
                    <li>Cobro en efectivo o transferencia confirmada en el momento.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: ETIQUETAS */}
          {currentSlide === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-1">
                  Embudo de Ventas: Sistema de Etiquetas Whaticket
                </h3>
                <p className="text-xs text-slate-500">
                  Usa las etiquetas correctas para mantener el control y no perder ningún cliente potencial.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { tag: '🟡 NUEVO PROSPECTO', desc: 'Primer mensaje del cliente. Requiere saludo cordial antes de 3 minutos.', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
                  { tag: '🔵 ASESORÍA MEDIDAS', desc: 'El cliente pregunta por dimensiones, litros o colores disponibles.', color: 'bg-blue-50 text-blue-800 border-blue-200' },
                  { tag: '🟣 PEDIDO CONFIRMADO COD', desc: 'Datos tomados: nombre, teléfono, dirección y productos confirmados.', color: 'bg-purple-50 text-purple-800 border-purple-200' },
                  { tag: '🚚 EN RUTA DELIVERY', desc: 'El mensajero tiene el paquete en tránsito hacia el domicilio.', color: 'bg-orange-50 text-orange-800 border-orange-200' },
                  { tag: '🟢 ENTREGADO Y COBRADO', desc: 'Pedido entregado conforme y dinero recaudado exitosamente.', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                  { tag: '🔴 POST-VENTA / SOPORTE', desc: 'Seguimiento de satisfacción o consulta de cambio de producto.', color: 'bg-red-50 text-red-800 border-red-200' },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${item.color} flex items-center justify-between gap-4`}>
                    <span className="font-extrabold text-xs whitespace-nowrap">{item.tag}</span>
                    <span className="text-xs text-slate-700 text-right">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 3: ATAJOS */}
          {currentSlide === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-1">
                    Atajos de Respuesta Rápida Oficiales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Escribe la barra diagonal <code>/</code> en Whaticket para autocompletar estas plantillas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Nombre de asesor:</span>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => {
                      setAgentName(e.target.value);
                      localStorage.setItem('plastir_agent_name', e.target.value);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none w-32 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    cmd: '/bienvenida',
                    title: 'Saludo Oficial Asesor',
                    text: `¡Hola! Le asiste ${agentName.trim() || 'Asesor'} de PLASTIR RD 👋📦\n\nBienvenido/a a la tienda oficial de organización inteligente y artículos para el hogar. Será un placer atenderle.\n\nCuéntenos, ¿qué organizadores, gaveteros o cajas plásticas está buscando hoy?`
                  },
                  {
                    cmd: '/despedida',
                    title: 'Cierre de Conversación',
                    text: `¡Gracias por comunicarse con PLASTIR RD! 🙌📦\n\nHa sido un placer atenderle. Recuerde que estamos a su disposición para cualquier consulta de medidas o capacidades.\n\n¡Que tenga un excelente día! ✨`
                  },
                  {
                    cmd: '/ubicacion',
                    title: 'Almacén Central & Despachos',
                    text: `📍 Despachamos desde nuestro almacén central en Santo Domingo hacia todo el país.\n\n🛵 Gran Santo Domingo: 2 a 4 horas / mismo día.\n🚚 Interior del País: 24 a 48 horas garantizado por transporte expreso.`
                  },
                  {
                    cmd: '/cod',
                    title: 'Pago al Recibir (COD)',
                    text: `💵 ¿Cómo funciona el Pago al Recibir?\n\n1. Usted confirma su pedido con nosotros.\n2. Nuestro mensajero express despacha su mercancía con empaque protector.\n3. Recibe en mano, verifica el producto y paga en efectivo o transferencia. ¡Cero riesgo!`
                  },
                  {
                    cmd: '/confirmar',
                    title: 'Captura de Datos para Envío',
                    text: `📦 Para despachar su pedido hoy mismo, facilítenos:\n\n• Nombre Completo:\n• Teléfono de Contacto:\n• Sector / Municipio:\n• Dirección Exacta:\n• Punto de Referencia:\n• Productos y Cantidades:`
                  },
                  {
                    cmd: '/seguimiento',
                    title: 'Satisfacción Post-Venta',
                    text: `¡Hola! Le contactamos de PLASTIR RD 👋\n\nQueremos asegurarnos de que recibió sus artículos en perfecto estado y que esté disfrutando de la organización de sus espacios.\n\n¿Todo llegó excelente con su pedido? ⭐`
                  }
                ].map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold bg-[#F16100] text-white px-2.5 py-0.5 rounded-lg">
                        {s.cmd}
                      </span>
                      <button
                        onClick={() => copyToClipboard(s.text, s.cmd)}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        {copiedShortcut === s.cmd ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        <span>{copiedShortcut === s.cmd ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{s.title}</h4>
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed font-sans">
                      {s.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLIDE 4: SIMULADOR DE CHAT */}
          {currentSlide === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-1">
                    Simulador Interactivo de Atención al Cliente
                  </h3>
                  <p className="text-xs text-slate-500">
                    Practica la conversación ideal según las directrices de servicio de Plastir RD.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSimStep(0);
                    setSimMessages([
                      { sender: 'client', text: '¡Hola! Vi el Organizador Multiuso de 4 Niveles en su página, ¿tienen disponibilidad para entrega hoy?' }
                    ]);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Reiniciar Chat</span>
                </button>
              </div>

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
                            ? 'bg-[#F16100] text-white rounded-br-none shadow-sm font-medium'
                            : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none font-medium'
                        }`}
                      >
                        <span className={`text-[10px] block font-black mb-1 uppercase ${msg.sender === 'staff' ? 'text-orange-200' : 'text-slate-500'}`}>
                          {msg.sender === 'staff' ? 'Tú (Asesor Plastir)' : 'Cliente'}
                        </span>
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

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
                            { sender: 'staff', text: '¡Hola! Es un placer atenderle. Sí, tenemos disponibilidad inmediata del Organizador Multiuso de 4 Niveles para entrega hoy en 2 a 4 horas. El total es RD$ 1,850 con pago al recibir en su puerta. ¿Para qué sector le gustaría el envío?' },
                            { sender: 'client', text: '¡Excelente! Es para Bella Vista, Distrito Nacional. ¿Cómo es el pago?' }
                          ]);
                          setSimStep(1);
                        }}
                        className="text-left text-xs bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 p-3 rounded-xl text-slate-800 transition-all font-medium"
                      >
                        ✅ <strong>Respuesta Óptima:</strong> Saludar cordialmente, confirmar disponibilidad del organizador, precio COD y preguntar sector de entrega.
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
                            { sender: 'staff', text: '💵 El pago es 100% contra entrega: el mensajero llega a su domicilio en Bella Vista, le entrega el paquete con empaque protector, usted verifica el organizador y le paga en efectivo o transferencia en el momento. Por favor facilítenos su nombre y dirección exacta para despachar ahora.' },
                            { sender: 'client', text: '¡Perfecto! Soy Carlos Jiménez, Av. Sarasota #45. Tel: 829-555-0123. ¡Por favor envíenlo!' }
                          ]);
                          setSimStep(2);
                        }}
                        className="text-left text-xs bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 p-3 rounded-xl text-slate-800 transition-all font-medium"
                      >
                        ✅ <strong>Explicar COD:</strong> Aclarar que revisa primero y paga al recibir, pidiendo dirección completa.
                      </button>
                    </div>
                  )}

                  {simStep === 2 && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center space-y-1">
                      <div className="text-xs font-bold text-emerald-800">
                        🎉 ¡Excelente cierre de venta!
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Has aplicado el protocolo de 3 pasos: confirmación, explicación de COD y captura de datos.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: CERTIFICACIÓN */}
          {currentSlide === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide mb-1">
                    Lista de Verificación de Competencias
                  </h3>
                  <p className="text-xs text-slate-500">
                    Marca cada punto para certificar tu dominio del sistema de ventas de PLASTIR RD.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-slate-900">{progressPercent}%</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Completado</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3 shadow-sm">
                {[
                  'Sé responder con el atajo /bienvenida en menos de 3 minutos.',
                  'Conozco la diferencia de capacidades en litros y materiales libres de BPA.',
                  'Sé aplicar las 6 etiquetas de embudo en Whaticket sin saltarme pasos.',
                  'Explico el pago contra entrega (COD) dando confianza de revisión previa.',
                  'Pido nombre, teléfono, dirección exacta y referencia física obligatoriamente.',
                  'Sé generar cotizaciones con el Cotizador Rápido y enviarlas por WhatsApp.',
                  'Reporto al almacén los pedidos con empaque especial para despachos al interior.',
                  'Entiendo el protocolo de seguimiento post-venta /seguimiento.',
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => toggleChecklistItem(idx)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                      checklist[idx]
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                      checklist[idx] ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {checklist[idx] && <Check size={12} />}
                    </div>
                    <span className="text-xs font-medium">{item}</span>
                  </div>
                ))}
              </div>

              {progressPercent === 100 && (
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="text-sm font-extrabold text-emerald-900">
                    ¡FELICITACIONES! ESTÁS 100% CERTIFICADO EN PLASTIR RD
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto">
                    Dominas el protocolo de atención, logística de empaque y cierre de ventas por WhatsApp.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === i ? 'w-6 bg-[#F16100]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={currentSlide === SLIDES.length - 1}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-30 transition-colors flex items-center gap-1"
          >
            <span>Siguiente</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};
