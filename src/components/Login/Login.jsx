import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState(null); // 'estudiante' | 'profesor'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    grado: '',
    codigo: '',
    selectedStudentId: '' // Para inicio rápido de sesión
  });
  
  const [error, setError] = useState('');
  const { login, realUser, students, findExistingStudent } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (realUser) {
      if (realUser.role === 'profesor') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    }
  }, [realUser, navigate]);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
    setAuthMode('login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Manejar selección rápida de estudiante registrado
  const handleQuickStudentSelect = (e) => {
    const studentId = e.target.value;
    if (!studentId) {
      setFormData(prev => ({
        ...prev,
        selectedStudentId: '',
        nombre: '',
        apellido: ''
      }));
      return;
    }
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        selectedStudentId: student.id,
        nombre: student.name || student.nombre || '',
        apellido: student.lastName || student.apellido || '',
        edad: student.age || student.edad || '',
        grado: student.grade || student.grado || ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // --- FLUJO PROFESOR ---
    if (role === 'profesor') {
      if (!formData.codigo) {
        setError('Por favor ingresa la clave de acceso de docente.');
        return;
      }
      if (formData.codigo !== 'profesor2024') {
        setError('Código o contraseña de profesor incorrecta. (Clave por defecto: profesor2024)');
        return;
      }

      const teacherUser = {
        name: formData.nombre || 'Profesor Titular',
        nombre: formData.nombre || 'Profesor Titular',
        lastName: formData.apellido || '',
        apellido: formData.apellido || '',
        role: 'profesor',
        id: 'teacher-main'
      };

      login(teacherUser);
      navigate('/teacher');
      return;
    }

    // --- FLUJO ESTUDIANTE: INICIO DE SESIÓN ---
    if (role === 'estudiante' && authMode === 'login') {
      if (!formData.nombre.trim()) {
        setError('Por favor ingresa tu nombre para iniciar sesión.');
        return;
      }

      const existing = findExistingStudent(formData.nombre, formData.apellido);
      if (!existing) {
        setError(
          `No se encontró ningún estudiante con el nombre "${formData.nombre}${formData.apellido ? ' ' + formData.apellido : ''}". Puedes verificar tus datos o hacer clic en "Registrarme como nuevo estudiante".`
        );
        return;
      }

      // Iniciar sesión con los datos y el progreso del estudiante existente
      const loggedUser = {
        ...existing,
        name: existing.name || existing.nombre,
        nombre: existing.name || existing.nombre,
        lastName: existing.lastName || existing.apellido,
        apellido: existing.lastName || existing.apellido,
        grade: String(existing.grade || existing.grado || '6'),
        grado: String(existing.grade || existing.grado || '6'),
        age: existing.age || existing.edad || 12,
        edad: existing.age || existing.edad || 12,
        role: 'estudiante'
      };

      login(loggedUser);
      navigate('/student');
      return;
    }

    // --- FLUJO ESTUDIANTE: REGISTRO NUEVO ---
    if (role === 'estudiante' && authMode === 'register') {
      if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.edad || !formData.grado) {
        setError('Por favor completa todos los campos del formulario de registro.');
        return;
      }

      // Validar si ya existe
      const existing = findExistingStudent(formData.nombre, formData.apellido);
      if (existing) {
        setError('Ya existe un estudiante registrado con este nombre y apellido. Cambia a la pestaña "Iniciar Sesión".');
        return;
      }

      // Normalizar grado
      const cleanGrade = String(formData.grado).replace('°', '').trim();

      const newUserData = {
        name: formData.nombre.trim(),
        nombre: formData.nombre.trim(),
        lastName: formData.apellido.trim(),
        apellido: formData.apellido.trim(),
        grade: cleanGrade,
        grado: cleanGrade,
        age: parseInt(formData.edad, 10),
        edad: parseInt(formData.edad, 10),
        role: 'estudiante',
        id: `st-${Date.now()}`
      };

      login(newUserData);
      navigate('/student');
    }
  };

  const renderBackgroundParticles = () => {
    const symbols = ['{ }', '< >', '( )', '/>', ';', '=>', '[]', '#'];
    return [...Array(20)].map((_, i) => (
      <div 
        key={i} 
        className={`particle particle-${i % 5}`}
        style={{
          left: `${Math.random() * 100}vw`,
          animationDuration: `${10 + Math.random() * 20}s`,
          animationDelay: `${-Math.random() * 20}s`
        }}
      >
        {symbols[Math.floor(Math.random() * symbols.length)]}
      </div>
    ));
  };

  return (
    <div className="login-container">
      <div className="particles-container">
        {renderBackgroundParticles()}
      </div>

      <div className="login-glass-card">
        <div className="login-header">
          <div className="logo-icon">&lt;/&gt;</div>
          <h1>CodeCraft Academy</h1>
          <p>Plataforma Interactiva para el Aprendizaje de la Programación</p>
        </div>

        {!role ? (
          <div className="role-selection fade-in">
            <h2>¿Quién eres?</h2>
            <div className="role-cards">
              <div className="role-card" onClick={() => handleRoleSelect('estudiante')}>
                <div className="role-icon">👨‍💻</div>
                <h3>Estudiante</h3>
                <p>Aprende, juega y crea proyectos en Scratch, Arduino y Python.</p>
              </div>
              <div className="role-card" onClick={() => handleRoleSelect('profesor')}>
                <div className="role-icon">👨‍🏫</div>
                <h3>Profesor</h3>
                <p>Monitorea y analiza el avance de tus clases y cursos.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="login-form fade-in">
            {/* PESTAÑAS PARA ALTERNAR ENTRE INICIAR SESIÓN Y REGISTRARSE */}
            {role === 'estudiante' && (
              <div className="auth-mode-tabs">
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                  }}
                >
                  🔑 Iniciar Sesión
                </button>
                <button
                  type="button"
                  className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('register');
                    setError('');
                  }}
                >
                  📝 Registrarse
                </button>
              </div>
            )}

            <h2>
              {role === 'profesor' 
                ? 'Acceso Docente' 
                : authMode === 'login' 
                  ? 'Iniciar Sesión (Estudiante)' 
                  : 'Registro de Nuevo Estudiante'
              }
            </h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* --- CASO 1: PROFESOR --- */}
              {role === 'profesor' && (
                <>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre del Profesor (Opcional)</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      value={formData.nombre} 
                      onChange={handleChange} 
                      placeholder="Ej. Profesor Carlos"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="codigo">Contraseña o Código de Acceso Docente</label>
                    <input 
                      type="password" 
                      id="codigo" 
                      name="codigo" 
                      value={formData.codigo} 
                      onChange={handleChange} 
                      placeholder="Ingresa la clave secreta (por defecto: profesor2024)"
                      autoFocus
                    />
                    <small className="field-hint">Clave por defecto: <code>profesor2024</code></small>
                  </div>
                </>
              )}

              {/* --- CASO 2: ESTUDIANTE - INICIAR SESIÓN --- */}
              {role === 'estudiante' && authMode === 'login' && (
                <>
                  {/* Selector rápido si hay alumnos registrados */}
                  {students && students.length > 0 && (
                    <div className="form-group">
                      <label htmlFor="selectedStudentId">⚡ Selección rápida de cuenta existente:</label>
                      <select 
                        id="selectedStudentId" 
                        name="selectedStudentId" 
                        value={formData.selectedStudentId} 
                        onChange={handleQuickStudentSelect}
                      >
                        <option value="">-- Elige tu perfil de la lista o escribe abajo --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name || s.nombre} {s.lastName || s.apellido} ({s.grade || s.grado}° Grado)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="nombre">Tu Nombre</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      value={formData.nombre} 
                      onChange={handleChange} 
                      placeholder="Ej. Luis o Andrés"
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellido">Tu Apellido (Opcional si es único)</label>
                    <input 
                      type="text" 
                      id="apellido" 
                      name="apellido" 
                      value={formData.apellido} 
                      onChange={handleChange} 
                      placeholder="Ej. Pérez o Morales"
                    />
                  </div>

                  <div className="auth-switch-note">
                    <span>¿No tienes una cuenta creada aún? </span>
                    <button 
                      type="button" 
                      className="link-btn" 
                      onClick={() => {
                        setAuthMode('register');
                        setError('');
                      }}
                    >
                      Regístrate aquí
                    </button>
                  </div>
                </>
              )}

              {/* --- CASO 3: ESTUDIANTE - REGISTRARSE --- */}
              {role === 'estudiante' && authMode === 'register' && (
                <>
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input 
                      type="text" 
                      id="nombre" 
                      name="nombre" 
                      value={formData.nombre} 
                      onChange={handleChange} 
                      placeholder="Ej. Camila"
                      autoFocus
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input 
                      type="text" 
                      id="apellido" 
                      name="apellido" 
                      value={formData.apellido} 
                      onChange={handleChange} 
                      placeholder="Ej. Rojas"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="edad">Edad</label>
                      <input 
                        type="number" 
                        id="edad" 
                        name="edad" 
                        min="8" 
                        max="99" 
                        value={formData.edad} 
                        onChange={handleChange} 
                        placeholder="Años"
                      />
                    </div>

                    <div className="form-group half">
                      <label htmlFor="grado">Grado Escolar</label>
                      <select id="grado" name="grado" value={formData.grado} onChange={handleChange}>
                        <option value="">Selecciona...</option>
                        <option value="6">6° (Sexto)</option>
                        <option value="7">7° (Séptimo)</option>
                        <option value="8">8° (Octavo)</option>
                        <option value="9">9° (Noveno)</option>
                        <option value="10">10° (Décimo)</option>
                        <option value="11">11° (Once)</option>
                      </select>
                    </div>
                  </div>

                  <div className="auth-switch-note">
                    <span>¿Ya te habías registrado antes? </span>
                    <button 
                      type="button" 
                      className="link-btn" 
                      onClick={() => {
                        setAuthMode('login');
                        setError('');
                      }}
                    >
                      Inicia sesión aquí
                    </button>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setRole(null)}>
                  ← Volver
                </button>
                <button type="submit" className="btn-primary">
                  {role === 'profesor' 
                    ? 'Entrar al Panel' 
                    : authMode === 'login' 
                      ? 'Entrar a Mis Clases' 
                      : 'Crear Mi Cuenta'
                  }
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
