import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateRequisitionPDF = (requisition) => {
  const doc = new jsPDF();
  
  // Logo y encabezado
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BEACHSCAPE KIN HA VILLAS & SUITES', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('SOLICITUD DE TRANSFERENCIA', 105, 30, { align: 'center' });
  
  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Información de la requisición
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let y = 45;
  
  // Código y fecha
  doc.setFont('helvetica', 'bold');
  doc.text('FOLIO:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(requisition.requisition_code || 'N/A', 50, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('FECHA:', 120, y);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date(requisition.request_date || requisition.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  doc.text(fecha.toUpperCase(), 145, y);
  
  y += 10;
  
  // Tipo de solicitud
  doc.setFont('helvetica', 'bold');
  doc.text('TIPO DE SOLICITUD:', 20, y);
  doc.setFont('helvetica', 'normal');
  const tipoLabels = {
    'transferencia': 'TRANSFERENCIA',
    'pago_tarjeta': 'PAGO CON TARJETA',
    'efectivo': 'EFECTIVO',
    'pago_linea': 'PAGO EN LÍNEA'
  };
  doc.text(tipoLabels[requisition.request_type] || requisition.request_type.toUpperCase(), 70, y);
  
  y += 10;
  
  // Monto
  doc.setFont('helvetica', 'bold');
  doc.text('POR LA CANTIDAD DE:', 20, y);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${parseFloat(requisition.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${requisition.currency}`, 80, y);
  
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`(${requisition.amount_in_words || ''})`, 20, y);
  
  y += 12;
  
  // A favor de
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('A FAVOR DE:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(requisition.payable_to, 50, y);
  
  y += 10;
  
  // Concepto
  doc.setFont('helvetica', 'bold');
  doc.text('CONCEPTO:', 20, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  const conceptLines = doc.splitTextToSize(requisition.concept, 170);
  doc.text(conceptLines, 20, y);
  
  y += (conceptLines.length * 5) + 10;
  
  // Departamento
  doc.setFont('helvetica', 'bold');
  doc.text('DEPARTAMENTO:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(requisition.department || 'SISTEMAS', 60, y);
  
  y += 10;
  
  // Estado
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADO:', 20, y);
  const estadoLabels = {
    'pending': 'PENDIENTE',
    'approved': 'APROBADA',
    'rejected': 'RECHAZADA',
    'completed': 'COMPLETADA'
  };
  doc.setFont('helvetica', 'normal');
  doc.text(estadoLabels[requisition.status] || requisition.status.toUpperCase(), 45, y);
  
  y += 20;
  
  // Firmas
  doc.setLineWidth(0.3);
  
  // Solicitante
  doc.line(20, y, 80, y);
  doc.setFontSize(9);
  doc.text('SOLICITÓ', 50, y + 5, { align: 'center' });
  doc.text(requisition.requested_by?.full_name || 'Administrador del Sistema', 50, y + 10, { align: 'center' });
  
  // Autorizó
  doc.line(110, y, 170, y);
  doc.text('AUTORIZÓ', 140, y + 5, { align: 'center' });
  if (requisition.approved_by) {
    doc.text(requisition.approved_by.full_name, 140, y + 10, { align: 'center' });
  } else {
    doc.text('_______________________', 140, y + 10, { align: 'center' });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Hotel Kin Ha Beachscape - Sistema de Gestión de Requisiciones', 105, 285, { align: 'center' });
  
  // Guardar PDF
  const filename = `Requisicion_${requisition.requisition_code || 'REQ'}_${new Date().getTime()}.pdf`;
  doc.save(filename);
};