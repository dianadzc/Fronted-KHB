import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Función para convertir número a letras
const numeroALetras = (num) => {
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  const convertirGrupo = (n) => {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    
    let resultado = '';
    const cen = Math.floor(n / 100);
    const dec = Math.floor((n % 100) / 10);
    const uni = n % 10;

    if (cen > 0) resultado += centenas[cen] + ' ';

    if (dec === 1 && uni > 0) {
      resultado += especiales[uni];
    } else {
      if (dec === 2 && uni > 0) {
        resultado += 'VEINTI' + unidades[uni];
      } else {
        if (dec > 0) resultado += decenas[dec];
        if (dec > 2 && uni > 0) resultado += ' Y ';
        if (uni > 0 && dec !== 2) resultado += unidades[uni];
      }
    }

    return resultado.trim();
  };

  if (!num || isNaN(num)) return 'CERO PESOS 00/100 M.N.';

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  let resultado = '';

  // Millones
  if (entero >= 1000000) {
    const millones = Math.floor(entero / 1000000);
    resultado += millones === 1 ? 'UN MILLÓN ' : convertirGrupo(millones) + ' MILLONES ';
  }

  // Miles
  const restante = entero % 1000000;
  if (restante >= 1000) {
    const miles = Math.floor(restante / 1000);
    resultado += miles === 1 ? 'MIL ' : convertirGrupo(miles) + ' MIL ';
  }

  // Centenas, decenas y unidades
  const unidadesFinales = entero % 1000;
  if (unidadesFinales > 0) {
    resultado += convertirGrupo(unidadesFinales);
  }

  if (resultado === '') resultado = 'CERO';

  return `(SON: ${resultado.trim()} PESOS ${centavos.toString().padStart(2, '0')}/100 M.N.)`;
};

// Función para cargar el logo
const cargarLogo = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = 'http://localhost:5000/public/images/beachscape-logo.png';
    
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn('No se pudo cargar el logo');
      resolve(null);
    };
  });
};

// Función auxiliar para generar el contenido del PDF
const generarContenidoPDF = async (doc, requisition) => {
  // Cargar y agregar logo
  const logo = await cargarLogo();
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 15, 10, 60, 25);
    } catch (error) {
      console.error('Error al agregar logo:', error);
    }
  }
  
  // Tipo de solicitud
  const tipoLabels = {
    'transferencia': 'TRANSFERENCIA',
    'pago_tarjeta': 'CHEQUE',
    'efectivo': 'EFECTIVO',
    'pago_linea': 'PAGO EN LÍNEA'
  };
  
  let y = 15;
  
  // Título: SOLICITUD DE [TIPO]
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`SOLICITUD DE ${tipoLabels[requisition.request_type] || 'TRANSFERENCIA'}`, 105, y, { align: 'center' });
  
  y = 45;
  
  // Línea superior
  doc.setLineWidth(0.5);
  doc.line(15, y, 195, y);
  
  y += 8;
  
  // FECHA y POR LA CANTIDAD DE (en la misma línea)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FECHA:', 15, y);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date(requisition.request_date || requisition.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();
  doc.text(fecha, 32, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('POR LA CANTIDAD DE: $', 100, y);
  doc.setFont('helvetica', 'normal');
  const montoTexto = parseFloat(requisition.amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  doc.text(montoTexto, 145, y);
  
  // Checkbox M.N. o USD
  doc.setFont('helvetica', 'bold');
  doc.rect(170, y - 4, 4, 4);
  if (requisition.currency === 'MXN') {
    doc.text('X', 171, y - 0.5);
  }
  doc.setFont('helvetica', 'normal');
  doc.text('M.N.', 176, y);
  
  doc.rect(188, y - 4, 4, 4);
  if (requisition.currency === 'USD') {
    doc.setFont('helvetica', 'bold');
    doc.text('X', 189, y - 0.5);
  }
  doc.setFont('helvetica', 'normal');
  doc.text('USD', 193, y);
  
  y += 8;
  
  // IMPORTE CON LETRAS
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTE CON LETRAS:', 15, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const montoLetras = numeroALetras(parseFloat(requisition.amount));
  const lineasMonto = doc.splitTextToSize(montoLetras, 180);
  doc.text(lineasMonto, 15, y);
  
  y += lineasMonto.length * 5 + 5;
  
  // Línea separadora
  doc.setLineWidth(0.3);
  doc.line(15, y, 195, y);
  y += 8;
  
  // A FAVOR DE
  doc.setFont('helvetica', 'bold');
  doc.text('A FAVOR DE:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(requisition.payable_to || 'N/A', 45, y);
  
  y += 10;
  
  // CONCEPTO
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONCEPTO:', 15, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const conceptoLineas = doc.splitTextToSize(requisition.concept || '', 180);
  doc.text(conceptoLineas, 15, y);
  
  y += conceptoLineas.length * 5 + 8;
  
  // Línea separadora
  doc.line(15, y, 195, y);
  y += 8;
  
  // DEPARTAMENTO
  doc.setFont('helvetica', 'bold');
  doc.text('DEPARTAMENTO:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text('SISTEMAS', 55, y);
  
  // FIRMAS (posición fija en la parte inferior)
  y = 250;
  
  doc.setLineWidth(0.5);
  
  // Línea horizontal antes de las firmas
  //doc.line(15, y - 10, 90, y - 10);
  
  // Solicitó (izquierda)
  doc.line(30, y-10, 85, y -10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('GILBERTO PÉREZ SOSA', 57.5, y - 3, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre y Firma', 57.5, y + 5, { align: 'center' });
  
  // Autorizó (derecha)
  doc.line(125, y -10, 180, y -10);
  doc.setFont('helvetica', 'normal');
  doc.text('CP. JORGE ARRIAGA', 152.5, y - 3, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Autorizo', 152.5, y + 5, { align: 'center' });
  
  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Hotel Kin Ha Beachscape - Sistema de Gestión de Requisiciones', 105, 285, { align: 'center' });
  
  return doc;
};

// Generar y descargar PDF
export const generateRequisitionPDF = async (requisition) => {
  const doc = await generarContenidoPDF(new jsPDF(), requisition);
  const filename = `Requisicion_${requisition.requisition_code || 'REQ'}_${Date.now()}.pdf`;
  doc.save(filename);
};

// Vista previa en nueva pestaña
export const previewRequisitionPDF = async (requisition) => {
  const doc = await generarContenidoPDF(new jsPDF(), requisition);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};