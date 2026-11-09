import React, { createContext, useState, useEffect, useContext } from 'react';

export const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Cursos iniciales (Grados 6° a 11°)
const INITIAL_COURSES = [
  {
    id: 'course-1',
    code: 'INF-6A',
    name: 'Introducción a la Algoritmia y Scratch',
    grade: '6',
    description: 'Bases del pensamiento computacional, lógica visual y primeros pasos en programación.',
    schedule: 'Lunes y Miércoles 08:00 - 09:30',
    color: '#00838F',
    studentsCount: 6
  },
  {
    id: 'course-4',
    code: 'INF-7B',
    name: 'Pensamiento Lógico y Animaciones con Scratch',
    grade: '7',
    description: 'Estructuras condicionales, eventos y coordinación de personajes interactivos.',
    schedule: 'Martes y Jueves 08:00 - 09:30',
    color: '#F57C00',
    studentsCount: 4
  },
  {
    id: 'course-2',
    code: 'ROB-8A',
    name: 'Robótica y Hardware con Arduino (C++)',
    grade: '8',
    description: 'Control de sensores analógicos y digitales, circuitos y actuadores.',
    schedule: 'Martes y Jueves 10:00 - 11:30',
    color: '#6A1B9A',
    studentsCount: 6
  },
  {
    id: 'course-5',
    code: 'ROB-9B',
    name: 'Sistemas Embebidos y Sensores Arduino',
    grade: '9',
    description: 'Automatización, lógica booleana estricta, temporizadores y buses seriales.',
    schedule: 'Lunes y Miércoles 10:00 - 11:30',
    color: '#C2185B',
    studentsCount: 4
  },
  {
    id: 'course-3',
    code: 'PROG-10A',
    name: 'Desarrollo de Software con Python',
    grade: '10',
    description: 'Estructuras de datos, funciones y resolución de problemas prácticos.',
    schedule: 'Viernes 07:30 - 10:00',
    color: '#2E7D32',
    studentsCount: 6
  },
  {
    id: 'course-6',
    code: 'PROG-11B',
    name: 'Algoritmos Avanzados e Inteligencia Artificial con Python',
    grade: '11',
    description: 'Estructuración modular, algoritmos de optimización e introducción al machine learning.',
    schedule: 'Viernes 10:30 - 13:00',
    color: '#1565C0',
    studentsCount: 4
  }
];

// Estudiantes iniciales
const INITIAL_STUDENTS = [
  // Curso 1 (Grado 6)
  {
    id: 'st-1',
    name: 'Luis',
    lastName: 'Pérez',
    age: 11,
    grade: '6',
    enrolledCourses: ['course-1'],
    courseId: 'course-1',
    role: 'estudiante',
    status: 'Excelente',
    arduino: 80,
    scratch: 100,
    python: 85,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 4, lessonsCompleted: 3, quizScores: [100, 90, 85], examScores: [], timeSpent: 50 },
      scratch: { currentLevel: 10, lessonsCompleted: 9, quizScores: [100, 100, 95, 90, 100], examScores: [95], timeSpent: 140 },
      python: { currentLevel: 3, lessonsCompleted: 2, quizScores: [85, 90], examScores: [], timeSpent: 40 }
    },
    notes: 'Gran facilidad para abstracción con bloques y lógica.'
  },
  {
    id: 'st-2',
    name: 'Andrés',
    lastName: 'Morales',
    age: 11,
    grade: '6',
    enrolledCourses: ['course-1'],
    courseId: 'course-1',
    role: 'estudiante',
    status: 'Regular',
    arduino: 50,
    scratch: 75,
    python: 55,
    lastActive: '2026-10-17',
    progress: {
      arduino: { currentLevel: 2, lessonsCompleted: 1, quizScores: [60], examScores: [], timeSpent: 25 },
      scratch: { currentLevel: 4, lessonsCompleted: 3, quizScores: [70, 75, 80], examScores: [], timeSpent: 60 },
      python: { currentLevel: 2, lessonsCompleted: 1, quizScores: [55], examScores: [], timeSpent: 20 }
    },
    notes: 'Necesita apoyo con la secuencia de eventos en Scratch.'
  },
  {
    id: 'st-3',
    name: 'Martín',
    lastName: 'Vargas',
    age: 12,
    grade: '6',
    enrolledCourses: ['course-1'],
    courseId: 'course-1',
    role: 'estudiante',
    status: 'Necesita Apoyo',
    arduino: 40,
    scratch: 65,
    python: 40,
    lastActive: '2026-10-15',
    progress: {
      arduino: { currentLevel: 1, lessonsCompleted: 0, quizScores: [40], examScores: [], timeSpent: 15 },
      scratch: { currentLevel: 3, lessonsCompleted: 2, quizScores: [60, 65], examScores: [], timeSpent: 45 },
      python: { currentLevel: 1, lessonsCompleted: 0, quizScores: [40], examScores: [], timeSpent: 10 }
    },
    notes: 'Dificultad recurrente con bucles. Asignar tutoría.'
  },
  {
    id: 'st-4',
    name: 'Lucía',
    lastName: 'Romero',
    age: 11,
    grade: '6',
    enrolledCourses: ['course-1'],
    courseId: 'course-1',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 70,
    scratch: 90,
    python: 75,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 3, lessonsCompleted: 2, quizScores: [75, 70], examScores: [], timeSpent: 35 },
      scratch: { currentLevel: 6, lessonsCompleted: 5, quizScores: [90, 85, 95], examScores: [], timeSpent: 90 },
      python: { currentLevel: 3, lessonsCompleted: 2, quizScores: [75, 80], examScores: [], timeSpent: 40 }
    },
    notes: 'Muy participativa en clase.'
  },
  {
    id: 'st-5',
    name: 'Mateo',
    lastName: 'Sánchez',
    age: 12,
    grade: '6',
    enrolledCourses: ['course-1'],
    courseId: 'course-1',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 65,
    scratch: 85,
    python: 70,
    lastActive: '2026-10-17',
    progress: {
      arduino: { currentLevel: 2, lessonsCompleted: 1, quizScores: [70], examScores: [], timeSpent: 30 },
      scratch: { currentLevel: 5, lessonsCompleted: 4, quizScores: [85, 80], examScores: [], timeSpent: 75 },
      python: { currentLevel: 2, lessonsCompleted: 1, quizScores: [70], examScores: [], timeSpent: 30 }
    },
    notes: ''
  },
  {
    id: 'st-6',
    name: 'Sofía',
    lastName: 'Castro',
    age: 11,
    grade: '6',
    enrolledCourses: ['course-1'],
    courseId: 'course-1',
    role: 'estudiante',
    status: 'Regular',
    arduino: 60,
    scratch: 70,
    python: 50,
    lastActive: '2026-10-16',
    progress: {
      arduino: { currentLevel: 2, lessonsCompleted: 1, quizScores: [60], examScores: [], timeSpent: 20 },
      scratch: { currentLevel: 4, lessonsCompleted: 3, quizScores: [70, 70], examScores: [], timeSpent: 50 },
      python: { currentLevel: 2, lessonsCompleted: 1, quizScores: [50], examScores: [], timeSpent: 25 }
    },
    notes: 'Duda al usar variables.'
  },

  // Curso 2 (Grado 8)
  {
    id: 'st-7',
    name: 'Ana',
    lastName: 'García',
    age: 13,
    grade: '8',
    enrolledCourses: ['course-2'],
    courseId: 'course-2',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 88,
    scratch: 95,
    python: 75,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 6, lessonsCompleted: 5, quizScores: [90, 85, 90, 80], examScores: [], timeSpent: 110 },
      scratch: { currentLevel: 11, lessonsCompleted: 10, quizScores: [100, 95], examScores: [90], timeSpent: 160 },
      python: { currentLevel: 4, lessonsCompleted: 3, quizScores: [80, 75], examScores: [], timeSpent: 60 }
    },
    notes: 'Excelente destreza manual con sensores.'
  },
  {
    id: 'st-8',
    name: 'Diego',
    lastName: 'Torres',
    age: 14,
    grade: '8',
    enrolledCourses: ['course-2'],
    courseId: 'course-2',
    role: 'estudiante',
    status: 'Necesita Apoyo',
    arduino: 45,
    scratch: 70,
    python: 40,
    lastActive: '2026-10-14',
    progress: {
      arduino: { currentLevel: 2, lessonsCompleted: 1, quizScores: [45], examScores: [], timeSpent: 30 },
      scratch: { currentLevel: 4, lessonsCompleted: 3, quizScores: [70], examScores: [], timeSpent: 40 },
      python: { currentLevel: 2, lessonsCompleted: 1, quizScores: [40], examScores: [], timeSpent: 20 }
    },
    notes: 'Confunde pinMode con digitalWrite.'
  },
  {
    id: 'st-9',
    name: 'Sebastián',
    lastName: 'Silva',
    age: 13,
    grade: '8',
    enrolledCourses: ['course-2'],
    courseId: 'course-2',
    role: 'estudiante',
    status: 'Regular',
    arduino: 65,
    scratch: 80,
    python: 60,
    lastActive: '2026-10-16',
    progress: {
      arduino: { currentLevel: 3, lessonsCompleted: 2, quizScores: [70, 65], examScores: [], timeSpent: 45 },
      scratch: { currentLevel: 6, lessonsCompleted: 5, quizScores: [80, 85], examScores: [], timeSpent: 80 },
      python: { currentLevel: 3, lessonsCompleted: 2, quizScores: [60], examScores: [], timeSpent: 35 }
    },
    notes: ''
  },
  {
    id: 'st-10',
    name: 'Valentina',
    lastName: 'Herrera',
    age: 14,
    grade: '8',
    enrolledCourses: ['course-2'],
    courseId: 'course-2',
    role: 'estudiante',
    status: 'Excelente',
    arduino: 92,
    scratch: 98,
    python: 85,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 8, lessonsCompleted: 7, quizScores: [95, 90, 95, 90], examScores: [], timeSpent: 130 },
      scratch: { currentLevel: 12, lessonsCompleted: 11, quizScores: [100, 95], examScores: [95], timeSpent: 170 },
      python: { currentLevel: 5, lessonsCompleted: 4, quizScores: [85, 85], examScores: [], timeSpent: 80 }
    },
    notes: 'Avanzada para su nivel. Podría competir en robótica.'
  },
  {
    id: 'st-11',
    name: 'Carlos',
    lastName: 'Díaz',
    age: 13,
    grade: '8',
    enrolledCourses: ['course-2'],
    courseId: 'course-2',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 78,
    scratch: 85,
    python: 70,
    lastActive: '2026-10-17',
    progress: {
      arduino: { currentLevel: 4, lessonsCompleted: 3, quizScores: [80, 75], examScores: [], timeSpent: 65 },
      scratch: { currentLevel: 7, lessonsCompleted: 6, quizScores: [85], examScores: [], timeSpent: 90 },
      python: { currentLevel: 3, lessonsCompleted: 2, quizScores: [70], examScores: [], timeSpent: 40 }
    },
    notes: ''
  },
  {
    id: 'st-12',
    name: 'Elena',
    lastName: 'Suárez',
    age: 14,
    grade: '8',
    enrolledCourses: ['course-2'],
    courseId: 'course-2',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 82,
    scratch: 90,
    python: 78,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 5, lessonsCompleted: 4, quizScores: [85, 80], examScores: [], timeSpent: 80 },
      scratch: { currentLevel: 8, lessonsCompleted: 7, quizScores: [90], examScores: [], timeSpent: 100 },
      python: { currentLevel: 4, lessonsCompleted: 3, quizScores: [80], examScores: [], timeSpent: 55 }
    },
    notes: ''
  },

  // Curso 3 (Grado 10)
  {
    id: 'st-13',
    name: 'Carlos',
    lastName: 'López',
    age: 15,
    grade: '10',
    enrolledCourses: ['course-3'],
    courseId: 'course-3',
    role: 'estudiante',
    status: 'Necesita Apoyo',
    arduino: 40,
    scratch: 80,
    python: 45,
    lastActive: '2026-10-14',
    progress: {
      arduino: { currentLevel: 2, lessonsCompleted: 1, quizScores: [40], examScores: [], timeSpent: 20 },
      scratch: { currentLevel: 6, lessonsCompleted: 5, quizScores: [80], examScores: [], timeSpent: 60 },
      python: { currentLevel: 3, lessonsCompleted: 2, quizScores: [45, 50], examScores: [], timeSpent: 30 }
    },
    notes: 'No entrega tareas a tiempo. Dificultad con bucles for.'
  },
  {
    id: 'st-14',
    name: 'María Fernanda',
    lastName: 'Gómez',
    age: 16,
    grade: '10',
    enrolledCourses: ['course-3'],
    courseId: 'course-3',
    role: 'estudiante',
    status: 'Excelente',
    arduino: 88,
    scratch: 96,
    python: 94,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 7, lessonsCompleted: 6, quizScores: [90, 85], examScores: [], timeSpent: 90 },
      scratch: { currentLevel: 13, lessonsCompleted: 12, quizScores: [100, 95], examScores: [95], timeSpent: 180 },
      python: { currentLevel: 9, lessonsCompleted: 8, quizScores: [95, 95, 90, 95], examScores: [90], timeSpent: 150 }
    },
    notes: 'Excelente estudiante, ayuda a sus compañeros.'
  },
  {
    id: 'st-15',
    name: 'Isabella',
    lastName: 'Luna',
    age: 15,
    grade: '10',
    enrolledCourses: ['course-3'],
    courseId: 'course-3',
    role: 'estudiante',
    status: 'Excelente',
    arduino: 98,
    scratch: 100,
    python: 95,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 10, lessonsCompleted: 9, quizScores: [100, 95], examScores: [95], timeSpent: 150 },
      scratch: { currentLevel: 15, lessonsCompleted: 14, quizScores: [100], examScores: [100], timeSpent: 200 },
      python: { currentLevel: 10, lessonsCompleted: 9, quizScores: [95, 95, 95], examScores: [95], timeSpent: 170 }
    },
    notes: 'Candidata para olimpiadas de informática.'
  },
  {
    id: 'st-16',
    name: 'Pedro',
    lastName: 'Martínez',
    age: 16,
    grade: '10',
    enrolledCourses: ['course-3'],
    courseId: 'course-3',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 75,
    scratch: 85,
    python: 80,
    lastActive: '2026-10-17',
    progress: {
      arduino: { currentLevel: 4, lessonsCompleted: 3, quizScores: [75], examScores: [], timeSpent: 50 },
      scratch: { currentLevel: 8, lessonsCompleted: 7, quizScores: [85], examScores: [], timeSpent: 110 },
      python: { currentLevel: 5, lessonsCompleted: 4, quizScores: [80, 80], examScores: [], timeSpent: 70 }
    },
    notes: ''
  },
  {
    id: 'st-17',
    name: 'Camila',
    lastName: 'Rojas',
    age: 15,
    grade: '10',
    enrolledCourses: ['course-3'],
    courseId: 'course-3',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 80,
    scratch: 90,
    python: 82,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 5, lessonsCompleted: 4, quizScores: [80], examScores: [], timeSpent: 60 },
      scratch: { currentLevel: 9, lessonsCompleted: 8, quizScores: [90], examScores: [], timeSpent: 120 },
      python: { currentLevel: 6, lessonsCompleted: 5, quizScores: [85, 80], examScores: [], timeSpent: 90 }
    },
    notes: ''
  },
  {
    id: 'st-18',
    name: 'Jorge',
    lastName: 'Nitales',
    age: 16,
    grade: '10',
    enrolledCourses: ['course-3'],
    courseId: 'course-3',
    role: 'estudiante',
    status: 'Regular',
    arduino: 65,
    scratch: 75,
    python: 60,
    lastActive: '2026-10-16',
    progress: {
      arduino: { currentLevel: 3, lessonsCompleted: 2, quizScores: [65], examScores: [], timeSpent: 40 },
      scratch: { currentLevel: 6, lessonsCompleted: 5, quizScores: [75], examScores: [], timeSpent: 75 },
      python: { currentLevel: 3, lessonsCompleted: 2, quizScores: [60], examScores: [], timeSpent: 40 }
    },
    notes: 'Necesita reforzar listas y diccionarios.'
  },
  // Curso 4 (Grado 7)
  {
    id: 'st-19',
    name: 'Samuel',
    lastName: 'Gómez',
    age: 12,
    grade: '7',
    enrolledCourses: ['course-4'],
    courseId: 'course-4',
    role: 'estudiante',
    status: 'Excelente',
    arduino: 75,
    scratch: 95,
    python: 70,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 3, lessonsCompleted: 2, quizScores: [85, 80], examScores: [], timeSpent: 35 },
      scratch: { currentLevel: 7, lessonsCompleted: 6, quizScores: [100, 95, 90], examScores: [], timeSpent: 85 },
      python: { currentLevel: 2, lessonsCompleted: 1, quizScores: [75], examScores: [], timeSpent: 20 }
    },
    notes: 'Excelente manejo de bloques de eventos.'
  },
  {
    id: 'st-20',
    name: 'Valeria',
    lastName: 'Herrera',
    age: 13,
    grade: '7',
    enrolledCourses: ['course-4'],
    courseId: 'course-4',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 65,
    scratch: 85,
    python: 60,
    lastActive: '2026-10-17',
    progress: {
      arduino: { currentLevel: 2, lessonsCompleted: 1, quizScores: [70], examScores: [], timeSpent: 20 },
      scratch: { currentLevel: 5, lessonsCompleted: 4, quizScores: [90, 85], examScores: [], timeSpent: 65 },
      python: { currentLevel: 2, lessonsCompleted: 1, quizScores: [65], examScores: [], timeSpent: 20 }
    },
    notes: ''
  },
  // Curso 5 (Grado 9)
  {
    id: 'st-21',
    name: 'Nicolás',
    lastName: 'Pardo',
    age: 14,
    grade: '9',
    enrolledCourses: ['course-5'],
    courseId: 'course-5',
    role: 'estudiante',
    status: 'Excelente',
    arduino: 90,
    scratch: 90,
    python: 85,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 8, lessonsCompleted: 7, quizScores: [95, 90, 100], examScores: [90], timeSpent: 120 },
      scratch: { currentLevel: 10, lessonsCompleted: 9, quizScores: [95, 90], examScores: [], timeSpent: 110 },
      python: { currentLevel: 5, lessonsCompleted: 4, quizScores: [85, 90], examScores: [], timeSpent: 65 }
    },
    notes: 'Destacada destreza en proyectos con sensores analógicos.'
  },
  {
    id: 'st-22',
    name: 'Mariana',
    lastName: 'Castaño',
    age: 15,
    grade: '9',
    enrolledCourses: ['course-5'],
    courseId: 'course-5',
    role: 'estudiante',
    status: 'Regular',
    arduino: 60,
    scratch: 80,
    python: 65,
    lastActive: '2026-10-16',
    progress: {
      arduino: { currentLevel: 3, lessonsCompleted: 2, quizScores: [65, 60], examScores: [], timeSpent: 45 },
      scratch: { currentLevel: 6, lessonsCompleted: 5, quizScores: [80, 85], examScores: [], timeSpent: 70 },
      python: { currentLevel: 3, lessonsCompleted: 2, quizScores: [65], examScores: [], timeSpent: 30 }
    },
    notes: 'Requiere apoyo con pines digitales y lógica condicional if-else.'
  },
  // Curso 6 (Grado 11)
  {
    id: 'st-23',
    name: 'Sebastián',
    lastName: 'Ortega',
    age: 16,
    grade: '11',
    enrolledCourses: ['course-6'],
    courseId: 'course-6',
    role: 'estudiante',
    status: 'Excelente',
    arduino: 95,
    scratch: 100,
    python: 98,
    lastActive: '2026-10-18',
    progress: {
      arduino: { currentLevel: 12, lessonsCompleted: 11, quizScores: [100, 95], examScores: [95], timeSpent: 180 },
      scratch: { currentLevel: 15, lessonsCompleted: 15, quizScores: [100], examScores: [100], timeSpent: 220 },
      python: { currentLevel: 13, lessonsCompleted: 12, quizScores: [100, 95, 100], examScores: [98], timeSpent: 190 }
    },
    notes: 'Nivel avanzado, resolviendo retos de optimización e IA.'
  },
  {
    id: 'st-24',
    name: 'Juliana',
    lastName: 'Silva',
    age: 17,
    grade: '11',
    enrolledCourses: ['course-6'],
    courseId: 'course-6',
    role: 'estudiante',
    status: 'Bueno',
    arduino: 85,
    scratch: 90,
    python: 88,
    lastActive: '2026-10-17',
    progress: {
      arduino: { currentLevel: 7, lessonsCompleted: 6, quizScores: [85], examScores: [], timeSpent: 90 },
      scratch: { currentLevel: 11, lessonsCompleted: 10, quizScores: [90], examScores: [], timeSpent: 130 },
      python: { currentLevel: 8, lessonsCompleted: 7, quizScores: [90, 85], examScores: [], timeSpent: 110 }
    },
    notes: 'Buen desempeño en lógica orientada a objetos.'
  }
];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [customContent, setCustomContent] = useState({});
  const [theme, setTheme] = useState('light'); // Modo claro por defecto
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'normal',
    soundEffects: true,
    notifications: true,
    academicPeriod: '2026 - Período B',
    institutionName: 'Colegio Técnico en Informática y Robótica',
    minPassingGrade: 70,
    allowFreeRetry: true
  });

  // MODO VISTA DE ESTUDIANTES (Simulador Pedagógico Docente)
  const [previewMode, setPreviewMode] = useState({
    active: false,
    grade: '8',
    unlockedAll: true
  });

  const enablePreview = (grade = '8') => {
    setPreviewMode(prev => ({
      ...prev,
      active: true,
      grade: String(grade)
    }));
  };

  const disablePreview = () => {
    setPreviewMode(prev => ({
      ...prev,
      active: false
    }));
  };

  const setPreviewGrade = (grade) => {
    setPreviewMode(prev => ({
      ...prev,
      grade: String(grade)
    }));
  };

  const togglePreviewUnlockAll = () => {
    setPreviewMode(prev => ({
      ...prev,
      unlockedAll: !prev.unlockedAll
    }));
  };

  useEffect(() => {
    // 1. Cargar tema (light por defecto)
    const storedTheme = localStorage.getItem('codecraft_theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);

    // 2. Cargar usuario
    const storedUser = localStorage.getItem('codecraft_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    // 3. Cargar cursos (asegurar que existan los 6 cursos para grados 6-11)
    const storedCourses = localStorage.getItem('codecraft_courses');
    if (storedCourses) {
      const parsedCourses = JSON.parse(storedCourses);
      if (parsedCourses.length < INITIAL_COURSES.length) {
        setCourses(INITIAL_COURSES);
        localStorage.setItem('codecraft_courses', JSON.stringify(INITIAL_COURSES));
      } else {
        setCourses(parsedCourses);
      }
    } else {
      setCourses(INITIAL_COURSES);
      localStorage.setItem('codecraft_courses', JSON.stringify(INITIAL_COURSES));
    }

    // 4. Cargar estudiantes (asegurar que existan estudiantes para todos los grados)
    const storedStudents = localStorage.getItem('codecraft_students');
    if (storedStudents) {
      const parsedStudents = JSON.parse(storedStudents);
      if (parsedStudents.length < INITIAL_STUDENTS.length) {
        setStudents(INITIAL_STUDENTS);
        localStorage.setItem('codecraft_students', JSON.stringify(INITIAL_STUDENTS));
      } else {
        setStudents(parsedStudents);
      }
    } else {
      setStudents(INITIAL_STUDENTS);
      localStorage.setItem('codecraft_students', JSON.stringify(INITIAL_STUDENTS));
    }

    // 5. Cargar mensajes
    const storedMessages = localStorage.getItem('codecraft_messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    } else {
      setMessages([]);
    }

    // 6. Cargar contenidos personalizados
    const storedContent = localStorage.getItem('codecraft_custom_content');
    if (storedContent) {
      setCustomContent(JSON.parse(storedContent));
    }

    // 7. Cargar configuraciones
    const storedSettings = localStorage.getItem('codecraft_settings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('codecraft_theme', nextTheme);
  };

  // Usuario efectivo: si el modo vista previa docente está activo, simula un estudiante completo del grado elegido
  const effectiveUser = React.useMemo(() => {
    if (previewMode.active) {
      const courseForGrade = courses.find(c => c.grade === String(previewMode.grade)) || courses[0];
      return {
        id: 'preview-simulated-student',
        role: 'estudiante',
        isPreview: true,
        nombre: 'Estudiante Ejemplo',
        name: 'Estudiante Ejemplo',
        apellido: `(${previewMode.grade}° Grado)`,
        lastName: `(${previewMode.grade}° Grado)`,
        grade: String(previewMode.grade),
        grado: String(previewMode.grade),
        age: parseInt(previewMode.grade, 10) + 5,
        edad: parseInt(previewMode.grade, 10) + 5,
        enrolledCourses: courseForGrade ? [courseForGrade.id] : ['course-1'],
        progress: {
          arduino: {
            currentLevel: previewMode.unlockedAll ? 15 : 4,
            lessonsCompleted: previewMode.unlockedAll ? 15 : 3,
            quizScores: [90, 85, 100],
            examScores: [85],
            timeSpent: 45
          },
          scratch: {
            currentLevel: previewMode.unlockedAll ? 15 : 8,
            lessonsCompleted: previewMode.unlockedAll ? 15 : 7,
            quizScores: [100, 95, 90, 85, 100],
            examScores: [90],
            timeSpent: 110
          },
          python: {
            currentLevel: previewMode.unlockedAll ? 15 : 3,
            lessonsCompleted: previewMode.unlockedAll ? 15 : 2,
            quizScores: [80, 85],
            examScores: [75],
            timeSpent: 30
          }
        }
      };
    }
    return user;
  }, [previewMode, user, courses]);

  const login = (userData) => {
    // Si es estudiante y no tiene cursos, asignar el correspondiente a su grado automáticamente
    let userCourses = userData.enrolledCourses || [];
    if (userData.role === 'estudiante' && userCourses.length === 0) {
      const match = courses.find(c => c.grade === String(userData.grade || userData.grado));
      if (match) {
        userCourses = [match.id];
      } else if (courses.length > 0) {
        userCourses = [courses[0].id];
      }
    }

    const userWithDefaults = {
      ...userData,
      id: userData.id || `user-${Date.now()}`,
      enrolledCourses: userCourses,
      progress: userData.progress || {
        arduino: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] },
        scratch: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] },
        python: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] }
      }
    };
    setUser(userWithDefaults);
    localStorage.setItem('codecraft_user', JSON.stringify(userWithDefaults));

    if (userWithDefaults.role === 'estudiante') {
      const exists = students.find(s => s.id === userWithDefaults.id);
      if (!exists) {
        const newStudent = {
          ...userWithDefaults,
          courseId: userWithDefaults.enrolledCourses[0] || 'course-1',
          status: 'Bueno',
          arduino: 0,
          scratch: 0,
          python: 0,
          lastActive: new Date().toISOString().split('T')[0]
        };
        const updatedStudents = [...students, newStudent];
        setStudents(updatedStudents);
        localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('codecraft_user');
  };

  // Matrícula y Abandono de Cursos por parte del Estudiante
  const enrollCourse = (courseId) => {
    if (!user) return;
    const currentEnrolled = user.enrolledCourses || [];
    if (currentEnrolled.includes(courseId)) return;

    const updatedEnrolled = [...currentEnrolled, courseId];
    const updatedUser = { ...user, enrolledCourses: updatedEnrolled };
    setUser(updatedUser);
    localStorage.setItem('codecraft_user', JSON.stringify(updatedUser));

    // Actualizar registro en lista de estudiantes
    const updatedStudents = students.map(s => {
      if (s.id === user.id) {
        return {
          ...s,
          enrolledCourses: updatedEnrolled,
          courseId: courseId
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
  };

  const leaveCourse = (courseId) => {
    if (!user) return;
    const updatedEnrolled = (user.enrolledCourses || []).filter(cId => cId !== courseId);
    const updatedUser = { ...user, enrolledCourses: updatedEnrolled };
    setUser(updatedUser);
    localStorage.setItem('codecraft_user', JSON.stringify(updatedUser));

    const updatedStudents = students.map(s => {
      if (s.id === user.id) {
        return {
          ...s,
          enrolledCourses: updatedEnrolled,
          courseId: updatedEnrolled[0] || null
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
  };

  const updateProgress = (language, progressData) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      progress: {
        ...user.progress,
        [language]: {
          ...user.progress[language],
          ...progressData
        }
      }
    };
    setUser(updatedUser);
    localStorage.setItem('codecraft_user', JSON.stringify(updatedUser));

    const updatedStudents = students.map(s => {
      if (s.id === user.id) {
        const completed = progressData.lessonsCompleted ?? s.progress?.[language]?.lessonsCompleted ?? 0;
        const calcPercent = Math.min(100, Math.round((completed / 15) * 100));
        return {
          ...s,
          ...updatedUser,
          [language]: calcPercent,
          lastActive: new Date().toISOString().split('T')[0]
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
  };

  const completeLesson = (language, levelId) => {
    if (!user) return;
    const currentProgress = user.progress[language] || { currentLevel: 1, lessonsCompleted: 0 };
    const newLevel = Math.max(currentProgress.currentLevel, parseInt(levelId) + 1);
    updateProgress(language, {
      currentLevel: Math.min(newLevel, 16),
      lessonsCompleted: Math.max(currentProgress.lessonsCompleted, parseInt(levelId))
    });
  };

  const saveQuizScore = (language, levelId, score) => {
    if (!user) return;
    const currentProgress = user.progress[language] || { quizScores: [] };
    const newScores = [...(currentProgress.quizScores || [])];
    newScores[parseInt(levelId) - 1] = score;
    updateProgress(language, { quizScores: newScores });
  };

  const saveExamScore = (language, score) => {
    if (!user) return;
    const currentProgress = user.progress[language] || { examScores: [] };
    updateProgress(language, { examScores: [...(currentProgress.examScores || []), score] });
  };

  // Cursos del Profesor (Crear y Eliminar)
  const addCourse = (courseData) => {
    const newCourse = {
      ...courseData,
      id: `course-${Date.now()}`,
      studentsCount: 0
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem('codecraft_courses', JSON.stringify(updated));
    return newCourse;
  };

  const deleteCourse = (courseId) => {
    const updatedCourses = courses.filter(c => c.id !== courseId);
    setCourses(updatedCourses);
    localStorage.setItem('codecraft_courses', JSON.stringify(updatedCourses));

    // Remover curso de los estudiantes matriculados
    const updatedStudents = students.map(s => {
      const remaining = (s.enrolledCourses || []).filter(id => id !== courseId);
      return {
        ...s,
        enrolledCourses: remaining,
        courseId: s.courseId === courseId ? (remaining[0] || null) : s.courseId
      };
    });
    setStudents(updatedStudents);
    localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
  };

  // Gestión de Estudiantes por el Docente (Añadir y Eliminar)
  const addStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `st-${Date.now()}`,
      role: 'estudiante',
      status: 'Bueno',
      arduino: 0,
      scratch: 0,
      python: 0,
      lastActive: new Date().toISOString().split('T')[0],
      enrolledCourses: [studentData.courseId],
      progress: {
        arduino: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] },
        scratch: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] },
        python: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] }
      },
      notes: ''
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('codecraft_students', JSON.stringify(updated));
    return newStudent;
  };

  const deleteStudent = (studentId) => {
    const updated = students.filter(s => s.id !== studentId);
    setStudents(updated);
    localStorage.setItem('codecraft_students', JSON.stringify(updated));
  };

  // Contenidos personalizados (Editor)
  const saveCustomContent = (language, levelId, content) => {
    const updated = {
      ...customContent,
      [`${language}-${levelId}`]: content
    };
    setCustomContent(updated);
    localStorage.setItem('codecraft_custom_content', JSON.stringify(updated));
  };

  // Mensajería Directa
  const sendMessage = ({ courseId, studentId, studentName, sender, text }) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      courseId,
      studentId,
      studentName,
      sender,
      text,
      timestamp: new Date().toISOString(),
      read: sender === 'student' ? false : true
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem('codecraft_messages', JSON.stringify(updated));
    return newMsg;
  };

  const markMessagesAsRead = (studentId) => {
    const updated = messages.map(m => m.studentId === studentId ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('codecraft_messages', JSON.stringify(updated));
  };

  const updateStudentNote = (studentId, note) => {
    const updatedStudents = students.map(s =>
      s.id === studentId ? { ...s, notes: note } : s
    );
    setStudents(updatedStudents);
    localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
  };

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('codecraft_settings', JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{
      user: effectiveUser,
      realUser: user,
      previewMode,
      enablePreview,
      disablePreview,
      setPreviewGrade,
      togglePreviewUnlockAll,
      courses,
      students,
      messages,
      customContent,
      settings,
      theme,
      toggleTheme,
      login,
      logout,
      enrollCourse,
      leaveCourse,
      updateProgress,
      completeLesson,
      saveQuizScore,
      saveExamScore,
      addCourse,
      deleteCourse,
      addStudent,
      deleteStudent,
      saveCustomContent,
      sendMessage,
      markMessagesAsRead,
      updateStudentNote,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};
