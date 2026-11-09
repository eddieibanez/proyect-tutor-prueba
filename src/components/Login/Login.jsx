import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState(null); // 'estudiante' | 'profesor'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    edad: '',
    grado: '6'
  });
  
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const { login, realUser, authenticateUser, registerUser } = useContext(AppContext);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrim = (formData.email || '').trim().toLowerCase();
    const passTrim = (formData.password || '').trim();

    if (!emailTrim || !passTrim) {
      setError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setError('Por favor introduce un formato de correo electrónico válido.');
      return;
    }

    setLoadingAction(true);

    try {
      // --- MODO INICIO DE SESIÓN ---
      if (authMode === 'login') {
        const result = await authenticateUser(emailTrim, passTrim, role);
        if (!result.success) {
          setError(result.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
          setLoadingAction(false);
          return;
        }

        if (role === 'profesor') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
        return;
      }

      // --- MODO REGISTRO ---
      if (authMode === 'register') {
        if (!formData.nombre.trim()) {
          setError('Por favor indica tu nombre.');
          setLoadingAction(false);
          return;
        }

        if (passTrim.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setLoadingAction(false);
          return;
        }

        if (role === 'estudiante' && !formData.grado) {
          setError('Por favor selecciona tu grado escolar.');
          setLoadingAction(false);
          return;
        }

        const newUserData = {
          email: emailTrim,
          password: passTrim,
          name: formData.nombre.trim(),
          nombre: formData.nombre.trim(),
          lastName: (formData.apellido || '').trim(),
          apellido: (formData.apellido || '').trim(),
          role: role,
          age: formData.edad ? parseInt(formData.edad, 10) : (role === 'estudiante' ? parseInt(formData.grado, 10) + 5 : 30),
          grade: role === 'estudiante' ? String(formData.grado).replace('°', '').trim() : null,
          grado: role === 'estudiante' ? String(formData.grado).replace('°', '').trim() : null
        };

        const regResult = await registerUser(newUserData);
        if (!regResult.success) {
          setError(regResult.message || 'No se pudo completar el registro. Intenta nuevamente.');
          setLoadingAction(false);
          return;
        }

        if (role === 'profesor') {
          navigate('/teacher');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error inesperado al procesar la solicitud.');
    } finally {
      setLoadingAction(false);
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
                <p>Aprende, resuelve retos y crea proyectos en Scratch, Arduino y Python.</p>
              </div>
              <div className="role-card" onClick={() => handleRoleSelect('profesor')}>
                <div className="role-icon">👨‍🏫</div>
                <h3>Profesor</h3>
                <p>Gestiona cursos, monitorea diagnósticos en tiempo real y edita temas.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="login-form fade-in">
            {/* PESTAÑAS PARA ALTERNAR ENTRE INICIAR SESIÓN Y REGISTRARSE */}
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
                📝 Registrarme
              </button>
            </div>

            <h2>
              {role === 'profesor' 
                ? (authMode === 'login' ? 'Acceso de Docente' : 'Registro de Docente')
                : (authMode === 'login' ? 'Iniciar Sesión (Estudiante)' : 'Crear Cuenta de Estudiante')
              }
            </h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* CAMPOS COMUNES: CORREO Y CONTRASEÑA */}
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder={role === 'profesor' ? 'docente@colegio.edu.co' : 'estudiante@colegio.edu.co'}
                  autoFocus
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Ingresa tu contraseña"
                  required
                />
                {authMode === 'register' && (
                  <small className="field-hint">Mínimo 6 caracteres</small>
                )}
              </div>

              {/* CAMPOS ADICIONALES PARA REGISTRO */}
              {authMode === 'register' && (
                <>
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="nombre">Nombre</label>
                      <input 
                        type="text" 
                        id="nombre" 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        placeholder="Ej. Juan"
                        required
                      />
                    </div>
                    <div className="form-group half">
                      <label htmlFor="apellido">Apellido</label>
                      <input 
                        type="text" 
                        id="apellido" 
                        name="apellido" 
                        value={formData.apellido} 
                        onChange={handleChange} 
                        placeholder="Ej. Gómez"
                      />
                    </div>
                  </div>

                  {role === 'estudiante' && (
                    <div className="form-row">
                      <div className="form-group half">
                        <label htmlFor="grado">Grado Escolar *</label>
                        <select 
                          id="grado" 
                          name="grado" 
                          value={formData.grado} 
                          onChange={handleChange}
                          required
                        >
                          <option value="6">6° Grado (Primaria)</option>
                          <option value="7">7° Grado (Secundaria)</option>
                          <option value="8">8° Grado (Secundaria)</option>
                          <option value="9">9° Grado (Secundaria)</option>
                          <option value="10">10° Grado (Media)</option>
                          <option value="11">11° Grado (Media)</option>
                        </select>
                      </div>

                      <div className="form-group half">
                        <label htmlFor="edad">Edad (Años)</label>
                        <input 
                          type="number" 
                          id="edad" 
                          name="edad" 
                          min="8" 
                          max="99" 
                          value={formData.edad} 
                          onChange={handleChange} 
                          placeholder="Ej. 12"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="auth-switch-note">
                {authMode === 'login' ? (
                  <>
                    <span>¿No tienes una cuenta aún? </span>
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
                  </>
                ) : (
                  <>
                    <span>¿Ya tienes una cuenta creada? </span>
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
                  </>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setRole(null)}>
                  ← Volver
                </button>
                <button type="submit" className="btn-primary" disabled={loadingAction}>
                  {loadingAction ? 'Procesando...' : authMode === 'login' ? 'Entrar a la Plataforma' : 'Crear Cuenta'}
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
