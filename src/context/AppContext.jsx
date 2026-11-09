import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [customContent, setCustomContent] = useState({});
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
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

  // 1. CARGA INICIAL DESDE SUPABASE Y LOCALSTORAGE
  useEffect(() => {
    // Tema
    const storedTheme = localStorage.getItem('codecraft_theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);

    // Usuario activo actual en sesión
    const storedUser = localStorage.getItem('codecraft_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Cargar datos reales desde Supabase
    fetchSupabaseData();
  }, []);

  const fetchSupabaseData = async () => {
    setLoading(true);
    try {
      // a. Cursos
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });

      if (!coursesError && coursesData) {
        setCourses(coursesData);
        localStorage.setItem('codecraft_courses', JSON.stringify(coursesData));
      } else {
        const localCourses = localStorage.getItem('codecraft_courses');
        if (localCourses) setCourses(JSON.parse(localCourses));
      }

      // b. Estudiantes / Perfiles con progreso y cursos
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id, role, name, last_name, grade, age, last_active,
          enrollments ( course_id ),
          progress ( language_id, current_level, lessons_completed, quiz_scores, exam_scores, time_spent )
        `)
        .eq('role', 'estudiante');

      if (!profilesError && profilesData) {
        const formattedStudents = profilesData.map(p => {
          const progMap = {
            arduino: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 },
            scratch: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 },
            python: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 }
          };

          (p.progress || []).forEach(pr => {
            if (progMap[pr.language_id]) {
              progMap[pr.language_id] = {
                currentLevel: pr.current_level,
                lessonsCompleted: pr.lessons_completed,
                quizScores: pr.quiz_scores || [],
                examScores: pr.exam_scores || [],
                timeSpent: pr.time_spent || 0
              };
            }
          });

          const enrolledCourses = (p.enrollments || []).map(e => e.course_id);

          return {
            id: p.id,
            name: p.name,
            nombre: p.name,
            lastName: p.last_name || '',
            apellido: p.last_name || '',
            grade: p.grade,
            grado: p.grade,
            age: p.age,
            edad: p.age,
            role: 'estudiante',
            enrolledCourses,
            courseId: enrolledCourses[0] || null,
            progress: progMap,
            arduino: Math.min(100, Math.round(((progMap.arduino?.lessonsCompleted || 0) / 15) * 100)),
            scratch: Math.min(100, Math.round(((progMap.scratch?.lessonsCompleted || 0) / 15) * 100)),
            python: Math.min(100, Math.round(((progMap.python?.lessonsCompleted || 0) / 15) * 100)),
            lastActive: p.last_active || new Date().toISOString().split('T')[0]
          };
        });

        setStudents(formattedStudents);
        localStorage.setItem('codecraft_students', JSON.stringify(formattedStudents));
      } else {
        const localStudents = localStorage.getItem('codecraft_students');
        if (localStudents) setStudents(JSON.parse(localStudents));
      }

      // c. Mensajes
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
        localStorage.setItem('codecraft_messages', JSON.stringify(messagesData));
      }

      // d. Contenido personalizado
      const { data: contentData } = await supabase
        .from('custom_content')
        .select('*');

      if (contentData) {
        const map = {};
        contentData.forEach(c => { map[c.lesson_key] = c.content; });
        setCustomContent(map);
        localStorage.setItem('codecraft_custom_content', JSON.stringify(map));
      }

      // e. Configuraciones
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (settingsData?.data) {
        setSettings(settingsData.data);
      }
    } catch (err) {
      console.warn('Conexión con Supabase en espera de tablas o configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('codecraft_theme', nextTheme);
  };

  // Usuario simulado para modo Vista de Estudiantes
  const effectiveUser = React.useMemo(() => {
    if (previewMode.active) {
      const courseForGrade = courses.find(c => String(c.grade) === String(previewMode.grade)) || courses[0];
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
        enrolledCourses: courseForGrade ? [courseForGrade.id] : [],
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

  // AUTENTICACIÓN POR CORREO Y CONTRASEÑA (SUPABASE + LOCAL)
  const authenticateUser = async (email, password, expectedRole) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, role, email, password, name, last_name, grade, age,
          enrollments ( course_id ),
          progress ( language_id, current_level, lessons_completed, quiz_scores, exam_scores, time_spent )
        `)
        .eq('email', email.trim().toLowerCase())
        .single();

      if (error || !data) {
        // Fallback a almacenamiento local si la tabla aún no tiene datos o está offline
        const localStudents = JSON.parse(localStorage.getItem('codecraft_students') || '[]');
        const foundLocal = localStudents.find(s => s.email?.toLowerCase() === email.trim().toLowerCase());
        
        if (foundLocal && foundLocal.password === password) {
          if (expectedRole && foundLocal.role !== expectedRole) {
            return { success: false, message: `Esta cuenta está registrada como ${foundLocal.role}, no como ${expectedRole}.` };
          }
          login(foundLocal);
          return { success: true, user: foundLocal };
        }

        // Caso especial profesor por defecto
        if (expectedRole === 'profesor' && password === 'profesor2024') {
          const defaultProf = {
            id: 'teacher-main',
            role: 'profesor',
            email: email.trim().toLowerCase(),
            name: 'Profesor Titular',
            nombre: 'Profesor Titular',
            lastName: '',
            apellido: ''
          };
          login(defaultProf);
          return { success: true, user: defaultProf };
        }

        return { success: false, message: 'Usuario no encontrado con este correo electrónico.' };
      }

      if (data.password !== password) {
        return { success: false, message: 'Contraseña incorrecta. Por favor verifica tus datos.' };
      }

      if (expectedRole && data.role !== expectedRole) {
        return { success: false, message: `Esta cuenta pertenece al rol de ${data.role}. Selecciona la opción correcta en la pantalla inicial.` };
      }

      // Reconstruir mapa de progreso
      const progMap = {
        arduino: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 },
        scratch: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 },
        python: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 }
      };

      (data.progress || []).forEach(pr => {
        if (progMap[pr.language_id]) {
          progMap[pr.language_id] = {
            currentLevel: pr.current_level,
            lessonsCompleted: pr.lessons_completed,
            quizScores: pr.quiz_scores || [],
            examScores: pr.exam_scores || [],
            timeSpent: pr.time_spent || 0
          };
        }
      });

      const enrolledCourses = (data.enrollments || []).map(e => e.course_id);

      const loggedUser = {
        id: data.id,
        role: data.role,
        email: data.email,
        password: data.password,
        name: data.name,
        nombre: data.name,
        lastName: data.last_name || '',
        apellido: data.last_name || '',
        grade: data.grade || null,
        grado: data.grade || null,
        age: data.age || 12,
        edad: data.age || 12,
        enrolledCourses,
        courseId: enrolledCourses[0] || null,
        progress: progMap
      };

      login(loggedUser);
      return { success: true, user: loggedUser };
    } catch (err) {
      console.error('Error al autenticar:', err);
      return { success: false, message: 'Error de conexión al autenticar.' };
    }
  };

  // REGISTRO DE NUEVO USUARIO (CORREO, CONTRASEÑA, GRADO)
  const registerUser = async (newUserData) => {
    try {
      const emailClean = newUserData.email.trim().toLowerCase();

      // Verificar si ya existe en Supabase
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', emailClean)
        .maybeSingle();

      if (existingUser) {
        return { success: false, message: 'Ya existe una cuenta registrada con este correo electrónico.' };
      }

      const userId = `${newUserData.role === 'profesor' ? 'prof' : 'st'}-${Date.now()}`;
      const profileRecord = {
        id: userId,
        role: newUserData.role,
        email: emailClean,
        password: newUserData.password,
        name: newUserData.name,
        last_name: newUserData.lastName || '',
        grade: newUserData.grade || null,
        age: newUserData.age || null,
        last_active: new Date().toISOString().split('T')[0]
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(profileRecord);

      if (insertError) {
        console.error('Error al insertar en Supabase profiles:', insertError);
        return { 
          success: false, 
          message: `Error al guardar en la base de datos: ${insertError.message || 'Verifica la conexión'}` 
        };
      }

      // Inicializar progreso si es estudiante
      if (newUserData.role === 'estudiante') {
        for (const lang of ['arduino', 'scratch', 'python']) {
          await supabase.from('progress').upsert({
            student_id: userId,
            language_id: lang,
            current_level: 1,
            lessons_completed: 0,
            quiz_scores: [],
            exam_scores: [],
            time_spent: 0
          });
        }
      }

      const fullUser = {
        ...profileRecord,
        nombre: profileRecord.name,
        apellido: profileRecord.last_name,
        grado: profileRecord.grade,
        edad: profileRecord.age,
        enrolledCourses: [],
        progress: {
          arduino: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 },
          scratch: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 },
          python: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 }
        }
      };

      login(fullUser);
      return { success: true, user: fullUser };
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      return { success: false, message: 'No se pudo completar el registro en la base de datos.' };
    }
  };

  // LOGIN / REGISTRO SINCRONIZADO CON SUPABASE
  const login = async (userData) => {
    const userWithDefaults = {
      ...userData,
      id: userData.id || `user-${Date.now()}`,
      enrolledCourses: userData.enrolledCourses || [],
      progress: userData.progress || {
        arduino: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] },
        scratch: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] },
        python: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0, difficulties: [] }
      }
    };

    setUser(userWithDefaults);
    localStorage.setItem('codecraft_user', JSON.stringify(userWithDefaults));

    // Guardar en Supabase si es estudiante
    if (userWithDefaults.role === 'estudiante') {
      try {
        await supabase.from('profiles').upsert({
          id: userWithDefaults.id,
          role: 'estudiante',
          name: userWithDefaults.name || userWithDefaults.nombre,
          last_name: userWithDefaults.lastName || userWithDefaults.apellido || '',
          grade: String(userWithDefaults.grade || userWithDefaults.grado || '6'),
          age: parseInt(userWithDefaults.age || userWithDefaults.edad || 12, 10),
          last_active: new Date().toISOString().split('T')[0]
        });

        // Guardar progresos base
        for (const lang of ['arduino', 'scratch', 'python']) {
          const pr = userWithDefaults.progress[lang];
          await supabase.from('progress').upsert({
            student_id: userWithDefaults.id,
            language_id: lang,
            current_level: pr.currentLevel,
            lessons_completed: pr.lessonsCompleted,
            quiz_scores: pr.quizScores,
            exam_scores: pr.examScores,
            time_spent: pr.timeSpent
          }, { onConflict: 'student_id,language_id' });
        }
      } catch (e) {
        console.warn('Guardado en Supabase (offline fallback):', e);
      }

      // Actualizar estado local
      const existsIndex = students.findIndex(s => s.id === userWithDefaults.id || (
        s.name?.toLowerCase() === (userWithDefaults.name || userWithDefaults.nombre || '').toLowerCase() &&
        s.lastName?.toLowerCase() === (userWithDefaults.lastName || userWithDefaults.apellido || '').toLowerCase()
      ));

      if (existsIndex >= 0) {
        const updated = [...students];
        updated[existsIndex] = { ...updated[existsIndex], ...userWithDefaults };
        setStudents(updated);
        localStorage.setItem('codecraft_students', JSON.stringify(updated));
      } else {
        const updated = [...students, userWithDefaults];
        setStudents(updated);
        localStorage.setItem('codecraft_students', JSON.stringify(updated));
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('codecraft_user');
  };

  const findExistingStudent = (nombre, apellido) => {
    if (!nombre) return null;
    const cleanNombre = nombre.trim().toLowerCase();
    const cleanApellido = (apellido || '').trim().toLowerCase();

    return students.find(s => {
      const sNombre = (s.name || s.nombre || '').trim().toLowerCase();
      const sApellido = (s.lastName || s.apellido || '').trim().toLowerCase();
      if (cleanApellido) {
        return sNombre === cleanNombre && sApellido === cleanApellido;
      }
      return sNombre === cleanNombre;
    });
  };

  // MATRÍCULA DE CURSOS (Sincronizada con Supabase)
  const enrollCourse = async (courseId) => {
    if (!user) return;
    const currentEnrolled = user.enrolledCourses || [];
    if (currentEnrolled.includes(courseId)) return;

    const updatedEnrolled = [...currentEnrolled, courseId];
    const updatedUser = { ...user, enrolledCourses: updatedEnrolled };
    setUser(updatedUser);
    localStorage.setItem('codecraft_user', JSON.stringify(updatedUser));

    // Guardar en Supabase
    try {
      await supabase.from('enrollments').upsert({
        student_id: user.id,
        course_id: courseId
      }, { onConflict: 'student_id,course_id' });
    } catch (e) {
      console.warn('Error al guardar enrollment en Supabase:', e);
    }

    const updatedStudents = students.map(s => {
      if (s.id === user.id) {
        return { ...s, enrolledCourses: updatedEnrolled, courseId };
      }
      return s;
    });
    setStudents(updatedStudents);
    localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
  };

  const leaveCourse = async (courseId) => {
    if (!user) return;
    const updatedEnrolled = (user.enrolledCourses || []).filter(cId => cId !== courseId);
    const updatedUser = { ...user, enrolledCourses: updatedEnrolled };
    setUser(updatedUser);
    localStorage.setItem('codecraft_user', JSON.stringify(updatedUser));

    try {
      await supabase.from('enrollments')
        .delete()
        .eq('student_id', user.id)
        .eq('course_id', courseId);
    } catch (e) {
      console.warn('Error al eliminar enrollment en Supabase:', e);
    }

    const updatedStudents = students.map(s => {
      if (s.id === user.id) {
        return { ...s, enrolledCourses: updatedEnrolled, courseId: updatedEnrolled[0] || null };
      }
      return s;
    });
    setStudents(updatedStudents);
    localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
  };

  // PROGRESO DE LECCIONES (Sincronizado con Supabase)
  const updateProgress = async (language, progressData) => {
    if (!user) return;
    const updatedProgress = {
      ...(user.progress?.[language] || {}),
      ...progressData
    };

    const updatedUser = {
      ...user,
      progress: {
        ...user.progress,
        [language]: updatedProgress
      }
    };
    setUser(updatedUser);
    localStorage.setItem('codecraft_user', JSON.stringify(updatedUser));

    try {
      await supabase.from('progress').upsert({
        student_id: user.id,
        language_id: language,
        current_level: updatedProgress.currentLevel || 1,
        lessons_completed: updatedProgress.lessonsCompleted || 0,
        quiz_scores: updatedProgress.quizScores || [],
        exam_scores: updatedProgress.examScores || [],
        time_spent: updatedProgress.timeSpent || 0
      }, { onConflict: 'student_id,language_id' });
    } catch (e) {
      console.warn('Error al guardar progreso en Supabase:', e);
    }

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
    const currentProgress = user.progress?.[language] || { currentLevel: 1, lessonsCompleted: 0 };
    const newLevel = Math.max(currentProgress.currentLevel, parseInt(levelId) + 1);
    updateProgress(language, {
      currentLevel: Math.min(newLevel, 16),
      lessonsCompleted: Math.max(currentProgress.lessonsCompleted, parseInt(levelId))
    });
  };

  const saveQuizScore = (language, levelId, score) => {
    if (!user) return;
    const currentProgress = user.progress?.[language] || { quizScores: [] };
    const newScores = [...(currentProgress.quizScores || [])];
    newScores[parseInt(levelId) - 1] = score;
    updateProgress(language, { quizScores: newScores });
  };

  const saveExamScore = (language, score) => {
    if (!user) return;
    const currentProgress = user.progress?.[language] || { examScores: [] };
    updateProgress(language, { examScores: [...(currentProgress.examScores || []), score] });
  };

  // CURSOS (Crear y Eliminar con Supabase)
  const addCourse = async (courseData) => {
    const newCourse = {
      ...courseData,
      id: courseData.id || `course-${Date.now()}`,
      studentsCount: 0
    };

    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem('codecraft_courses', JSON.stringify(updated));

    try {
      await supabase.from('courses').insert({
        id: newCourse.id,
        code: newCourse.code,
        name: newCourse.name,
        grade: String(newCourse.grade),
        description: newCourse.description || '',
        schedule: newCourse.schedule || '',
        color: newCourse.color || '#00BCD4'
      });
    } catch (e) {
      console.warn('Error al crear curso en Supabase:', e);
    }
  };

  const deleteCourse = async (courseId) => {
    const updated = courses.filter(c => c.id !== courseId);
    setCourses(updated);
    localStorage.setItem('codecraft_courses', JSON.stringify(updated));

    try {
      await supabase.from('courses').delete().eq('id', courseId);
    } catch (e) {
      console.warn('Error al eliminar curso en Supabase:', e);
    }
  };

  const addStudent = async (studentData) => {
    const newStudent = {
      ...studentData,
      id: studentData.id || `st-${Date.now()}`,
      role: 'estudiante',
      status: 'Bueno',
      arduino: 0,
      scratch: 0,
      python: 0,
      lastActive: new Date().toISOString().split('T')[0],
      enrolledCourses: studentData.courseId ? [studentData.courseId] : [],
      progress: {
        arduino: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 },
        scratch: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 },
        python: { currentLevel: 1, lessonsCompleted: 0, quizScores: [], examScores: [], timeSpent: 0 }
      }
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem('codecraft_students', JSON.stringify(updated));

    try {
      await supabase.from('profiles').insert({
        id: newStudent.id,
        role: 'estudiante',
        name: newStudent.name || newStudent.nombre,
        last_name: newStudent.lastName || newStudent.apellido || '',
        grade: String(newStudent.grade || newStudent.grado || '6'),
        age: parseInt(newStudent.age || newStudent.edad || 12, 10)
      });

      if (studentData.courseId) {
        await supabase.from('enrollments').insert({
          student_id: newStudent.id,
          course_id: studentData.courseId
        });
      }
    } catch (e) {
      console.warn('Error al guardar estudiante en Supabase:', e);
    }
  };

  const deleteStudent = async (studentId) => {
    const updated = students.filter(s => s.id !== studentId);
    setStudents(updated);
    localStorage.setItem('codecraft_students', JSON.stringify(updated));

    try {
      await supabase.from('profiles').delete().eq('id', studentId);
    } catch (e) {
      console.warn('Error al borrar estudiante en Supabase:', e);
    }
  };

  // CONTENIDO PERSONALIZADO Y MENSAJERÍA
  const saveCustomContent = async (langKey, levelId, data) => {
    const lessonKey = `${langKey}-${levelId}`;
    const updated = { ...customContent, [lessonKey]: data };
    setCustomContent(updated);
    localStorage.setItem('codecraft_custom_content', JSON.stringify(updated));

    try {
      await supabase.from('custom_content').upsert({
        lesson_key: lessonKey,
        content: data
      });
    } catch (e) {
      console.warn('Error al guardar custom content en Supabase:', e);
    }
  };

  const sendMessage = async (messageData) => {
    const newMsg = {
      ...messageData,
      id: `msg-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    localStorage.setItem('codecraft_messages', JSON.stringify(updated));

    try {
      await supabase.from('messages').insert({
        id: newMsg.id,
        student_id: newMsg.studentId,
        student_name: newMsg.studentName,
        sender: newMsg.sender,
        text: newMsg.text,
        time: newMsg.time,
        read: newMsg.read || false
      });
    } catch (e) {
      console.warn('Error al enviar mensaje en Supabase:', e);
    }
  };

  const markMessagesAsRead = async (studentId) => {
    const updated = messages.map(m => (m.studentId === studentId || m.student_id === studentId) ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('codecraft_messages', JSON.stringify(updated));

    try {
      await supabase.from('messages').update({ read: true }).eq('student_id', studentId);
    } catch (e) {
      console.warn('Error al marcar leído en Supabase:', e);
    }
  };

  const updateStudentNote = (studentId, note) => {
    const updatedStudents = students.map(s => s.id === studentId ? { ...s, notes: note } : s);
    setStudents(updatedStudents);
    localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
  };

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('codecraft_settings', JSON.stringify(updated));

    try {
      await supabase.from('settings').upsert({ id: 'global', data: updated });
    } catch (e) {
      console.warn('Error al actualizar settings en Supabase:', e);
    }
  };

  // ACTUALIZAR PERFIL DE USUARIO (DATOS PERSONALES, IDENTIFICACIÓN, CONTRASEÑA)
  const updateUserProfile = async (updatedFields) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('codecraft_user', JSON.stringify(updatedUser));

    // Si es estudiante, actualizar en lista de students
    if (user.role === 'estudiante') {
      const updatedStudents = students.map(s => s.id === user.id ? { ...s, ...updatedFields } : s);
      setStudents(updatedStudents);
      localStorage.setItem('codecraft_students', JSON.stringify(updatedStudents));
    }

    try {
      await supabase.from('profiles').update({
        name: updatedFields.name || updatedFields.nombre,
        last_name: updatedFields.lastName || updatedFields.apellido,
        age: updatedFields.age || updatedFields.edad,
        grade: updatedFields.grade || updatedFields.grado,
        password: updatedFields.password
      }).eq('id', user.id);
    } catch (e) {
      console.warn('Error al actualizar perfil en Supabase:', e);
    }
  };

  // EDITAR MENSAJE EN TIEMPO REAL
  const editMessage = async (messageId, newText) => {
    const updated = messages.map(m => m.id === messageId ? { ...m, text: newText, edited: true, edited_at: new Date().toISOString() } : m);
    setMessages(updated);
    localStorage.setItem('codecraft_messages', JSON.stringify(updated));

    try {
      await supabase.from('messages').update({ text: newText }).eq('id', messageId);
    } catch (e) {
      console.warn('Error al editar mensaje en Supabase:', e);
    }
  };

  // GESTIÓN DE HORARIOS DE CURSOS Y CANCELACIONES DE CLASES
  const updateCourseSchedule = async ({ courseId, schedule, scheduleDays, startTime, endTime }) => {
    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, schedule, scheduleDays, startTime, endTime };
      }
      return c;
    });
    setCourses(updatedCourses);
    localStorage.setItem('codecraft_courses', JSON.stringify(updatedCourses));

    try {
      await supabase.from('courses').update({ schedule }).eq('id', courseId);
    } catch (e) {
      console.warn('Error al actualizar horario de curso en Supabase:', e);
    }
  };

  const toggleCourseDateCancellation = async (courseId, dateStr) => {
    const updatedCourses = courses.map(c => {
      if (c.id === courseId) {
        const cancelled = c.cancelledDates || [];
        const isAlreadyCancelled = cancelled.includes(dateStr);
        const newCancelled = isAlreadyCancelled
          ? cancelled.filter(d => d !== dateStr)
          : [...cancelled, dateStr];
        return { ...c, cancelledDates: newCancelled };
      }
      return c;
    });
    setCourses(updatedCourses);
    localStorage.setItem('codecraft_courses', JSON.stringify(updatedCourses));
  };

  // GESTIÓN DE TAREAS Y ENTREGAS
  const addTask = async (newTaskData) => {
    const task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      submissions: []
    };
    const updated = [...tasks, task];
    setTasks(updated);
    localStorage.setItem('codecraft_tasks', JSON.stringify(updated));
    return task;
  };

  const submitTask = async (taskId, submissionData) => {
    const now = new Date();
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const dueDateTime = new Date(`${t.dueDate}T${t.dueTime || '23:59'}`);
        const isLate = now > dueDateTime;
        const newSub = {
          ...submissionData,
          submittedAt: now.toISOString(),
          isLate
        };
        const subs = (t.submissions || []).filter(s => s.studentId !== submissionData.studentId);
        return { ...t, submissions: [...subs, newSub] };
      }
      return t;
    });
    setTasks(updated);
    localStorage.setItem('codecraft_tasks', JSON.stringify(updated));
  };

  // FUNCIÓN PARA LIMPIAR TODOS LOS DATOS LOCALES
  const clearAllLocalData = () => {
    localStorage.removeItem('codecraft_user');
    localStorage.removeItem('codecraft_students');
    localStorage.removeItem('codecraft_courses');
    localStorage.removeItem('codecraft_messages');
    localStorage.removeItem('codecraft_custom_content');
    setUser(null);
    setStudents([]);
    setCourses([]);
    setMessages([]);
    setCustomContent({});
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
      loading,
      toggleTheme,
      login,
      logout,
      authenticateUser,
      registerUser,
      findExistingStudent,
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
      tasks,
      editMessage,
      updateUserProfile,
      updateCourseSchedule,
      toggleCourseDateCancellation,
      addTask,
      submitTask,
      updateStudentNote,
      updateSettings,
      clearAllLocalData,
      fetchSupabaseData
    }}>
      {children}
    </AppContext.Provider>
  );
};


