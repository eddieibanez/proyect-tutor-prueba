import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    grado: '',
    codigo: ''
  });
  const [error, setError] = useState('');
  const { login, realUser } = useContext(AppContext);
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
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre || !formData.apellido || !formData.edad || !formData.grado) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (role === 'profesor' && formData.codigo !== 'profesor2024') {
      setError('Código de acceso de profesor incorrecto.');
      return;
    }

    const userData = {
      ...formData,
      name: formData.nombre,
      lastName: formData.apellido,
      grade: formData.grado,
      age: formData.edad,
      role,
      id: Date.now().toString()
    };

    login(userData);
    
    if (role === 'profesor') {
      navigate('/teacher');
    } else {
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
          <p>Tu aventura en la programación comienza aquí</p>
        </div>

        {!role ? (
          <div className="role-selection fade-in">
            <h2>¿Quién eres?</h2>
            <div className="role-cards">
              <div className="role-card" onClick={() => handleRoleSelect('estudiante')}>
                <div className="role-icon">👨‍💻</div>
                <h3>Estudiante</h3>
                <p>Aprende, juega y crea proyectos increíbles.</p>
              </div>
              <div className="role-card" onClick={() => handleRoleSelect('profesor')}>
                <div className="role-icon">👨‍🏫</div>
                <h3>Profesor</h3>
                <p>Gestiona tus clases y evalúa a tus alumnos.</p>
              </div>
            </div>
          </div>
        ) : (
          <form className="login-form fade-in" onSubmit={handleSubmit}>
            <h2>Registro de {role === 'estudiante' ? 'Estudiante' : 'Profesor'}</h2>
            
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input 
                type="text" 
                id="nombre" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                placeholder="Ej. Juan"
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
                placeholder="Ej. Pérez"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="edad">Edad</label>
                <input 
                  type="number" 
                  id="edad" 
                  name="edad" 
                  min="10" 
                  max="99" 
                  value={formData.edad} 
                  onChange={handleChange} 
                  placeholder="Años"
                />
              </div>

              <div className="form-group half">
                <label htmlFor="grado">Grado</label>
                <select id="grado" name="grado" value={formData.grado} onChange={handleChange}>
                  <option value="">Selecciona...</option>
                  <option value="6°">6° (Sexto)</option>
                  <option value="7°">7° (Séptimo)</option>
                  <option value="8°">8° (Octavo)</option>
                  <option value="9°">9° (Noveno)</option>
                  <option value="10°">10° (Décimo)</option>
                  <option value="11°">11° (Once)</option>
                </select>
              </div>
            </div>

            {role === 'profesor' && (
              <div className="form-group">
                <label htmlFor="codigo">Código de Acceso</label>
                <input 
                  type="password" 
                  id="codigo" 
                  name="codigo" 
                  value={formData.codigo} 
                  onChange={handleChange} 
                  placeholder="Ingresa el código secreto"
                />
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setRole(null)}>
                Volver
              </button>
              <button type="submit" className="btn-primary">
                Comenzar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
