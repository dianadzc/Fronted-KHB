// src/services/responsivePDFGenerator.js
import jsPDF from 'jspdf';
// Función para cargar el logo de la empresa
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
const generarContenidoPDF = async (doc, form) => {
  // Cargar y agregar logo
  const logo = await cargarLogo();
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 15, 10, 50, 20);
    } catch (error) {
      console.error('Error al agregar logo:', error);
    }
  }
  
  doc.setTextColor(0, 0, 0);
  
  let y = 15;
  
  // Fecha y ubicación (derecha)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date(form. Date || form.createdAt).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`Cancún, Quintana Roo a ${fecha}`, 195, y, { align: 'right' });
  
  y = 40;
  
  // Empresa
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('HOTELERA KIN HA, S.A DE C.V.', 15, y);
  
  y += 20;
  
  // Departamento
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Departamento de sistemas', 15, y);
  
  y += 10;
  
  // Asunto
  doc.setFont('helvetica', 'bold');
  doc.text('Asunto: Responsiva', 15, y);
  
  y += 20;
  
  // Construir texto con variables en mayúsculas
  doc.setFontSize(11);
  const costoFormateado = parseFloat(form.acquisition_cost || 0).toLocaleString('es-MX', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  const equipoUpper = form.equipment_type.toUpperCase();
  const marcaUpper = form.brand.toUpperCase();
  const serieUpper = form.serial_number.toUpperCase();
  const nombreUpper = form.employee_name.toUpperCase();
  
  // Texto completo del primer párrafo
  const parrafo1 = `Sirva éste como comprobante de entrega del equipo ${equipoUpper}, marca ${marcaUpper}, con número de serie ${serieUpper}, que tiene un costo de adquisición de $${costoFormateado}, el cual pertenece a la empresa HOTELERA KIN HA, S.A DE C.V., y se entrega a ${nombreUpper} para el desarrollo de sus funciones, quien a partir del día ${fecha}, se compromete a resguardarlo y darle un uso estrictamente laboral. En caso de su extravío, daño o uso inadecuado, se responsabiliza del costo de reparación o la reposición del equipo.`;
  
  // Dividir el texto en líneas
  const lineas = doc.splitTextToSize(parrafo1, 180);
  
  // Renderizar cada línea aplicando negritas
  lineas.forEach((linea) => {
    const palabras = linea.split(' ');
    let x = 15;
    
    palabras.forEach((palabra, index) => {
      // Verificar si la palabra contiene valores en negrita
      const esNegrita = 
        palabra.includes(equipoUpper) ||
        palabra.includes(marcaUpper.split(' ')[0]) ||
        (marcaUpper.split(' ').length > 1 && palabra.includes(marcaUpper.split(' ')[1])) ||
        (marcaUpper.split(' ').length > 2 && palabra.includes(marcaUpper.split(' ')[2])) ||
        (marcaUpper.split(' ').length > 3 && palabra.includes(marcaUpper.split(' ')[3])) ||
        (marcaUpper.split(' ').length > 4 && palabra.includes(marcaUpper.split(' ')[4])) ||
        palabra.includes(serieUpper) ||
        palabra.includes('$' + costoFormateado) ||
        palabra.includes(costoFormateado) ||
        palabra.includes(nombreUpper.split(' ')[0]) ||
        (nombreUpper.split(' ').length > 1 && palabra.includes(nombreUpper.split(' ')[1])) ||
        (nombreUpper.split(' ').length > 2 && palabra.includes(nombreUpper.split(' ')[2]));
      
      if (esNegrita) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      const palabraConEspacio = index < palabras.length - 1 ? palabra + ' ' : palabra;
      doc.text(palabraConEspacio, x, y);
      x += doc.getTextWidth(palabraConEspacio);
    });
    
    y += 7;
  });
  
  y += 12;
  
  // Segundo párrafo
  doc.setFont('helvetica', 'normal');
  const parrafo2 = 'Hacemos de su conocimiento que no podrá modificar la configuración del equipo, ni instalar software sin ser previamente autorizado. (En caso de que aplique el equipo en resguardo).';
  
  const lineasParrafo2 = doc.splitTextToSize(parrafo2, 180);
  
  lineasParrafo2.forEach((linea) => {
    doc.text(linea, 15, y);
    y += 7;
  });
  
  y += 35;
  
  // Atentamente
  doc.setFont('helvetica', 'bold');
  doc.text('Atentamente', 105, y, { align: 'center' });
  
  y += 40;
  
  // Firmas
  const firmaY = y;
  
  // Receptor (izquierda)
  doc.setFont('helvetica', 'bold');
  doc.text('Receptor', 55, firmaY, { align: 'center' });
  
  doc.setLineWidth(0.5);
  doc.line(20, firmaY + 20, 90, firmaY + 20);
  
  doc.setFontSize(10);
  doc.text(form.employee_name.toUpperCase(), 55, firmaY + 26, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(form.employee_position.toUpperCase(), 55, firmaY + 32, { align: 'center' });
  
  // Otorga (derecha)
  doc.setFont('helvetica', 'bold');
  doc.text('Otorga', 155, firmaY, { align: 'center' });
  
  doc.line(120, firmaY + 20, 190, firmaY + 20);
  
  doc.setFontSize(10);
  doc.text('GILBERTO PÉREZ SOSA', 155, firmaY + 26, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('RESPONSABLE DE SISTEMAS', 155, firmaY + 32, { align: 'center' });
  
  return doc;
};

// Generar y descargar PDF
export const generateResponsiveFormPDF = async (form) => {
  const doc = await generarContenidoPDF(new jsPDF(), form);
  const filename = `Responsiva_${form.form_code || 'RESP'}_${Date.now()}.pdf`;
  doc.save(filename);
};

// Vista previa en nueva pestaña
export const previewResponsiveFormPDF = async (form) => {
  const doc = await generarContenidoPDF(new jsPDF(), form);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};