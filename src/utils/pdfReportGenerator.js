import jsPDF from 'jspdf';

/**
 * Genera y descarga un informe en PDF de un estudiante individual
 * Incluye diagnóstico, notas, desglose por lenguaje y recomendaciones de mejora
 */
export const exportStudentPDF = (student, courseName = 'Curso de Programación') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header con fondo tecno
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Línea decorativa cian
  doc.setFillColor(0, 188, 212);
  doc.rect(0, 38, pageWidth, 2, 'F');
  
  // Título
  doc.setTextColor(0, 188, 212);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CODECRAFT ACADEMY', 14, 18);
  
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('Informe Pedagógico y Diagnóstico Individual', 14, 28);
  
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 176);
  doc.text(`Fecha de emisión: ${today}`, pageWidth - 14, 28, { align: 'right' });
  
  let y = 52;
  
  // Datos del estudiante
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Datos del Estudiante', 14, y);
  y += 7;
  
  doc.setDrawColor(220, 220, 230);
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre completo: ${student.name} ${student.lastName || ''}`, 18, y + 8);
  doc.text(`Grado: ${student.grade || 'N/A'}°`, 18, y + 16);
  doc.text(`Curso asignado: ${courseName}`, 18, y + 23);
  
  doc.text(`Estado actual: ${student.status || 'Activo'}`, 110, y + 8);
  doc.text(`Última actividad: ${student.lastActive || 'Reciente'}`, 110, y + 16);
  y += 36;
  
  // 2. Rendimiento por Lenguajes
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Desglose de Rendimiento por Lenguaje', 14, y);
  y += 8;
  
  const arduinoScore = student.arduino ?? (student.progress?.arduino?.lessonsCompleted ? Math.round((student.progress.arduino.lessonsCompleted / 15) * 100) : 0);
  const scratchScore = student.scratch ?? (student.progress?.scratch?.lessonsCompleted ? Math.round((student.progress.scratch.lessonsCompleted / 15) * 100) : 0);
  const pythonScore = student.python ?? (student.progress?.python?.lessonsCompleted ? Math.round((student.progress.python.lessonsCompleted / 15) * 100) : 0);
  
  const langs = [
    { name: 'C++ (Arduino)', score: arduinoScore, color: [0, 188, 212] },
    { name: 'Scratch (Bloques)', score: scratchScore, color: [255, 171, 0] },
    { name: 'Python (Algoritmos)', score: pythonScore, color: [0, 230, 118] }
  ];
  
  langs.forEach(item => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 60);
    doc.text(`${item.name}: ${item.score}%`, 18, y + 4);
    
    // Barra de fondo
    doc.setFillColor(230, 230, 240);
    doc.roundedRect(80, y, 100, 6, 2, 2, 'F');
    // Barra llena
    const fillWidth = Math.max(2, (item.score / 100) * 100);
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.roundedRect(80, y, fillWidth, 6, 2, 2, 'F');
    
    y += 12;
  });
  
  y += 6;
  
  // 3. Aspectos a Mejorar (Dificultades encontradas según análisis)
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Diagnóstico y Aspectos que se Deben Mejorar', 14, y);
  y += 7;
  
  const difficulties = [];
  if (arduinoScore < 60) difficulties.push('Manejo de puertos y sintaxis en C++ (pinMode, punto y coma, tipos de datos).');
  if (scratchScore < 60) difficulties.push('Lógica de bucles repetitivos y coordinación de eventos/mensajes en Scratch.');
  if (pythonScore < 60) difficulties.push('Estructuras de control condicionales (if/else), bucles for/while e indentación en Python.');
  if (difficulties.length === 0) {
    difficulties.push('Excelente comprensión de conceptos básicos. Se recomienda avanzar a retos algorítmicos complejos.');
  }
  
  doc.setDrawColor(255, 204, 128);
  doc.setFillColor(255, 248, 235);
  doc.roundedRect(14, y, pageWidth - 28, 10 + (difficulties.length * 8), 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 80, 0);
  difficulties.forEach((diff, i) => {
    doc.text(`• ${diff}`, 18, y + 8 + (i * 8));
  });
  
  y += 18 + (difficulties.length * 8);
  
  // 4. Recomendaciones Pedagógicas para el Aula
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Recomendaciones Pedagógicas Personalizadas', 14, y);
  y += 7;
  
  const recommendations = [
    'Reforzar la práctica paso a paso en el simulador de consola interactiva.',
    'Apoyarse en CodeBot con preguntas de guía conceptual antes de solicitar la respuesta.',
    'Realizar los quizzes formativos al final de cada nivel para afianzar retención conceptual.'
  ];
  
  doc.setDrawColor(180, 230, 200);
  doc.setFillColor(240, 252, 245);
  doc.roundedRect(14, y, pageWidth - 28, 10 + (recommendations.length * 8), 3, 3, 'FD');
  
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 100, 50);
  recommendations.forEach((rec, i) => {
    doc.text(`${i + 1}. ${rec}`, 18, y + 8 + (i * 8));
  });
  
  y += 20 + (recommendations.length * 8);
  
  // Notas del docente si existen
  if (student.notes) {
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 46);
    doc.setFont('helvetica', 'bold');
    doc.text('Notas adicionales del docente:', 14, y);
    y += 6;
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(70, 70, 90);
    doc.text(`"${student.notes}"`, 18, y);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 170);
  doc.text('Documento generado automáticamente por CodeCraft Academy - Plataforma Educativa de Tecnología', pageWidth / 2, 285, { align: 'center' });
  
  doc.save(`Informe_Estudiante_${student.name.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Genera y descarga un informe en PDF de todo el grupo/curso
 * Incluye promedios, listado completo, balance de dificultades grupales y estrategias
 */
export const exportGroupPDF = (students, courseName = 'Curso General', grade = 'Todos') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(26, 26, 46);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFillColor(124, 77, 255);
  doc.rect(0, 38, pageWidth, 2, 'F');
  
  doc.setTextColor(0, 188, 212);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CODECRAFT ACADEMY', 14, 18);
  
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text(`Informe Grupal de Rendimiento - ${courseName}`, 14, 28);
  
  const today = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.setFontSize(9);
  doc.setTextColor(160, 160, 176);
  doc.text(`Fecha: ${today} | Grado: ${grade}`, pageWidth - 14, 28, { align: 'right' });
  
  let y = 50;
  
  // Métricas grupales
  const total = students.length;
  const avg = (fn) => total > 0 ? Math.round(students.reduce((acc, s) => acc + (fn(s) || 0), 0) / total) : 0;
  
  const avgArd = avg(s => s.arduino ?? (s.progress?.arduino?.lessonsCompleted ? Math.round((s.progress.arduino.lessonsCompleted / 15) * 100) : 0));
  const avgScr = avg(s => s.scratch ?? (s.progress?.scratch?.lessonsCompleted ? Math.round((s.progress.scratch.lessonsCompleted / 15) * 100) : 0));
  const avgPyt = avg(s => s.python ?? (s.progress?.python?.lessonsCompleted ? Math.round((s.progress.python.lessonsCompleted / 15) * 100) : 0));
  const overallAvg = Math.round((avgArd + avgScr + avgPyt) / 3);
  
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Resumen Estadístico del Grupo', 14, y);
  y += 7;
  
  doc.setDrawColor(220, 220, 230);
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, pageWidth - 28, 22, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 70);
  doc.text(`Total Estudiantes: ${total}`, 20, y + 8);
  doc.text(`Promedio C++ (Arduino): ${avgArd}%`, 20, y + 16);
  doc.text(`Promedio Scratch: ${avgScr}%`, 90, y + 8);
  doc.text(`Promedio Python: ${avgPyt}%`, 90, y + 16);
  doc.text(`Rendimiento Global: ${overallAvg}%`, 155, y + 12);
  y += 30;
  
  // 2. Hallazgos del Análisis Grupal y Aspectos a Mejorar
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Diagnóstico Grupal y Aspectos a Mejorar', 14, y);
  y += 7;
  
  const groupIssues = [];
  if (avgArd < 65) groupIssues.push('Dificultad general en conceptos de hardware y sintaxis C++ (variables globales vs locales, temporizadores).');
  if (avgScr < 65) groupIssues.push('Falta de práctica en detección de colisiones complejas y uso de variables de puntuación.');
  if (avgPyt < 65) groupIssues.push('Errores recurrentes de indentación, bucles while infinitos y funciones con retornos.');
  if (groupIssues.length === 0) groupIssues.push('Grupo con avance óptimo y alta tasa de resolución en quizzes.');
  
  doc.setFillColor(255, 245, 245);
  doc.setDrawColor(255, 200, 200);
  doc.roundedRect(14, y, pageWidth - 28, 8 + (groupIssues.length * 8), 3, 3, 'FD');
  
  doc.setFontSize(9.5);
  doc.setTextColor(180, 40, 40);
  doc.setFont('helvetica', 'normal');
  groupIssues.forEach((issue, i) => {
    doc.text(`• ${issue}`, 18, y + 7 + (i * 8));
  });
  
  y += 18 + (groupIssues.length * 8);
  
  // 3. Tabla de Estudiantes
  doc.setFontSize(13);
  doc.setTextColor(26, 26, 46);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Listado Consolidado de Estudiantes', 14, y);
  y += 7;
  
  // Encabezado de tabla
  doc.setFillColor(30, 30, 60);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Estudiante', 18, y + 5.5);
  doc.text('Grado', 85, y + 5.5);
  doc.text('Arduino', 110, y + 5.5);
  doc.text('Scratch', 135, y + 5.5);
  doc.text('Python', 160, y + 5.5);
  doc.text('Estado', 182, y + 5.5);
  y += 8;
  
  // Filas
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  
  students.slice(0, 18).forEach((st, idx) => {
    const ard = st.arduino ?? (st.progress?.arduino?.lessonsCompleted ? Math.round((st.progress.arduino.lessonsCompleted / 15) * 100) : 0);
    const scr = st.scratch ?? (st.progress?.scratch?.lessonsCompleted ? Math.round((st.progress.scratch.lessonsCompleted / 15) * 100) : 0);
    const pyt = st.python ?? (st.progress?.python?.lessonsCompleted ? Math.round((st.progress.python.lessonsCompleted / 15) * 100) : 0);
    
    if (idx % 2 === 0) {
      doc.setFillColor(245, 245, 250);
      doc.rect(14, y, pageWidth - 28, 7, 'F');
    }
    
    doc.setTextColor(40, 40, 50);
    doc.text(`${st.name} ${st.lastName || ''}`, 18, y + 5);
    doc.text(`${st.grade}°`, 87, y + 5);
    doc.text(`${ard}%`, 112, y + 5);
    doc.text(`${scr}%`, 137, y + 5);
    doc.text(`${pyt}%`, 162, y + 5);
    
    const status = st.status || (pyt < 50 ? 'Necesita Apoyo' : 'Bueno');
    if (status === 'Excelente') doc.setTextColor(0, 150, 70);
    else if (status === 'Necesita Apoyo') doc.setTextColor(200, 30, 30);
    else doc.setTextColor(0, 120, 180);
    
    doc.text(status, 182, y + 5);
    y += 7;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 170);
  doc.text('Documento generado automáticamente por CodeCraft Academy - Sistema de Gestión Docente', pageWidth / 2, 285, { align: 'center' });
  
  doc.save(`Informe_Grupal_${courseName.replace(/\s+/g, '_')}.pdf`);
};
