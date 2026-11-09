import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * StudentPreview — Componente de transición.
 * Cuando el profesor navega a /teacher/preview, se activa el modo vista
 * previa docente y se redirige a las rutas reales del estudiante (/student).
 * Así el profesor experimenta exactamente la misma interfaz del alumno.
 */
const StudentPreview = () => {
  const navigate = useNavigate();
  const { enablePreview } = useApp();

  useEffect(() => {
    enablePreview('8');
    navigate('/student', { replace: true });
  }, []);

  return null;
};

export default StudentPreview;
