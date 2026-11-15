import React, { useState, useRef } from 'react';
import './ScratchIDE.css';
import { IconClose } from '../common/Icons';

export const SCRATCH_CATEGORIES = [
  { id: 'motion', name: 'Movimiento', color: '#4C97FF' },
  { id: 'looks', name: 'Apariencia', color: '#9966FF' },
  { id: 'sound', name: 'Sonido', color: '#CF63CF' },
  { id: 'events', name: 'Eventos', color: '#FFBF00' },
  { id: 'control', name: 'Control', color: '#FFAB19' },
  { id: 'sensing', name: 'Sensores', color: '#5CB1D6' },
  { id: 'operators', name: 'Operadores', color: '#59C059' },
  { id: 'variables', name: 'Variables', color: '#FF8C1A' }
];

export const OFFICIAL_BLOCKS = {
  motion: [
    { id: 'm_move', shape: 'stack', text: 'mover', params: [{ id: 'steps', val: '10' }], suffix: 'pasos' },
    { id: 'm_turn_right', shape: 'stack', text: 'girar ↷', params: [{ id: 'deg', val: '15' }], suffix: 'grados' },
    { id: 'm_turn_left', shape: 'stack', text: 'girar ↶', params: [{ id: 'deg', val: '15' }], suffix: 'grados' },
    { id: 'm_goto_rand', shape: 'stack', text: 'ir a posición aleatoria' },
    { id: 'm_gotoxy', shape: 'stack', text: 'ir a x:', params: [{ id: 'x', val: '0' }], suffix: 'y:', params2: [{ id: 'y', val: '0' }] },
    { id: 'm_point_dir', shape: 'stack', text: 'apuntar en dirección', params: [{ id: 'dir', val: '90' }] },
    { id: 'm_bounce', shape: 'stack', text: 'si toca un borde, rebotar' }
  ],
  looks: [
    { id: 'l_say_sec', shape: 'stack', text: 'decir', params: [{ id: 'msg', val: '¡Hola!' }], suffix: 'durante', params2: [{ id: 'sec', val: '2' }], suffix2: 'segundos' },
    { id: 'l_say', shape: 'stack', text: 'decir', params: [{ id: 'msg', val: '¡Hola!' }] },
    { id: 'l_show', shape: 'stack', text: 'mostrar' },
    { id: 'l_hide', shape: 'stack', text: 'esconder' }
  ],
  sound: [
    { id: 's_play_miau', shape: 'stack', text: 'tocar sonido Miau hasta que termine' },
    { id: 's_stop', shape: 'stack', text: 'detener todos los sonidos' }
  ],
  events: [
    { id: 'e_when_flag', shape: 'hat', text: 'al hacer clic en ⚑' },
    { id: 'e_when_key', shape: 'hat', text: 'al presionar tecla espacio' },
    { id: 'e_when_click', shape: 'hat', text: 'al hacer clic en este objeto' }
  ],
  control: [
    { id: 'c_wait', shape: 'stack', text: 'esperar', params: [{ id: 'sec', val: '1' }], suffix: 'segundos' },
    { id: 'c_repeat', shape: 'c-block', text: 'repetir', params: [{ id: 'times', val: '10' }], body: [] },
    { id: 'c_forever', shape: 'c-block', text: 'por siempre', body: [] },
    { id: 'c_if', shape: 'c-block', text: 'si', hasCondition: true, condition: null, suffix: 'entonces', body: [] },
    { id: 'c_if_else', shape: 'e-block', text: 'si', hasCondition: true, condition: null, suffix: 'entonces', body: [], elseBody: [] },
    { id: 'c_stop', shape: 'stack', text: 'detener todos' }
  ],
  sensing: [
    { id: 'sn_touch_mouse', shape: 'boolean', text: '¿tocando el puntero del ratón?' },
    { id: 'sn_key_pressed', shape: 'boolean', text: '¿tecla espacio presionada?' },
    { id: 'sn_mouse_x', shape: 'reporter', text: 'posición x del ratón' },
    { id: 'sn_mouse_y', shape: 'reporter', text: 'posición y del ratón' }
  ],
  operators: [
    { id: 'op_add', shape: 'reporter', text: '', isOp: true, op: '+', leftVal: '', rightVal: '' },
    { id: 'op_sub', shape: 'reporter', text: '', isOp: true, op: '-', leftVal: '', rightVal: '' },
    { id: 'op_mul', shape: 'reporter', text: '', isOp: true, op: '*', leftVal: '', rightVal: '' },
    { id: 'op_div', shape: 'reporter', text: '', isOp: true, op: '/', leftVal: '', rightVal: '' },
    { id: 'op_random', shape: 'reporter', text: 'elegir número al azar entre', params: [{ id: 'min', val: '1' }], suffix: 'y', params2: [{ id: 'max', val: '10' }] },
    { id: 'op_gt', shape: 'boolean', text: '', isCmp: true, cmp: '>', leftVal: '', rightVal: '50' },
    { id: 'op_lt', shape: 'boolean', text: '', isCmp: true, cmp: '<', leftVal: '', rightVal: '50' },
    { id: 'op_eq', shape: 'boolean', text: '', isCmp: true, cmp: '=', leftVal: '', rightVal: '50' },
    { id: 'op_and', shape: 'boolean', text: '', isLogic: true, logic: 'y' },
    { id: 'op_or', shape: 'boolean', text: '', isLogic: true, logic: 'o' },
    { id: 'op_not', shape: 'boolean', text: 'no', isLogic: true }
  ],
  variables: [
    { id: 'v_my_var', shape: 'reporter', text: 'mi variable' },
    { id: 'v_set_var', shape: 'stack', text: 'dar a mi variable el valor', params: [{ id: 'val', val: '0' }] },
    { id: 'v_change_var', shape: 'stack', text: 'sumar a mi variable', params: [{ id: 'val', val: '1' }] }
  ]
};

const ScratchIDE = () => {
  const [activeCategory, setActiveCategory] = useState('events');
  const [workspaceBlocks, setWorkspaceBlocks] = useState([
    {
      instanceId: 'inst_start_flag',
      id: 'e_when_flag',
      shape: 'hat',
      text: 'al hacer clic en ⚑',
      color: '#FFBF00',
      x: 60,
      y: 40
    },
    {
      instanceId: 'inst_start_move',
      id: 'm_move',
      shape: 'stack',
      text: 'mover',
      color: '#4C97FF',
      params: [{ id: 'steps', val: '10' }],
      suffix: 'pasos',
      x: 60,
      y: 95
    }
  ]);

  const [zoom, setZoom] = useState(1);
  const [activeDragId, setActiveDragId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [catState, setCatState] = useState({
    x: 0,
    y: 0,
    direction: 90,
    visible: true,
    size: 100,
    saying: '',
    isRunning: false
  });

  const canvasRef = useRef(null);

  const curCat = SCRATCH_CATEGORIES.find(c => c.id === activeCategory) || SCRATCH_CATEGORIES[0];
  const categoryBlocks = OFFICIAL_BLOCKS[activeCategory] || [];

  // ARRASTRE DESDE LA PALETA DE BLOQUES
  const handlePaletteDragStart = (e, block) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      ...block,
      color: curCat.color,
      isNew: true
    }));
  };

  // SOLTAR EN EL CANVAS O DENTRO DE UNA RANURA C/E
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.isNew) {
        const rect = canvasRef.current.getBoundingClientRect();
        const dropX = Math.round((e.clientX - rect.left) / zoom);
        const dropY = Math.round((e.clientY - rect.top) / zoom);

        // IMÁN MAGNÉTICO: Si se suelta cerca del último bloque, encajar verticalmente
        let finalX = dropX;
        let finalY = dropY;

        if (workspaceBlocks.length > 0 && data.shape !== 'reporter' && data.shape !== 'boolean') {
          const last = workspaceBlocks[workspaceBlocks.length - 1];
          const dist = Math.hypot(dropX - last.x, dropY - (last.y + 44));
          if (dist < 50) {
            finalX = last.x;
            finalY = last.y + 46;
          }
        }

        const newInst = {
          ...data,
          instanceId: 'inst_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          x: finalX,
          y: finalY,
          body: data.body ? [] : undefined,
          elseBody: data.elseBody ? [] : undefined,
          condition: data.condition || null
        };

        setWorkspaceBlocks(prev => [...prev, newInst]);
      }
    } catch (err) {
      console.warn('Error al soltar bloque:', err);
    }
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  // MOVILIDAD LIBRE DE BLOQUES DENTRO DE LA MESA DE TRABAJO (Drag & Move en Canvas)
  const handleBlockMouseDown = (e, instId) => {
    if (e.target.tagName === 'INPUT' || e.target.closest('button')) return;
    e.stopPropagation();

    const targetBlock = workspaceBlocks.find(b => b.instanceId === instId);
    if (!targetBlock) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    setActiveDragId(instId);
    setDragOffset({
      x: mouseX - targetBlock.x,
      y: mouseY - targetBlock.y
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!activeDragId) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    let newX = Math.round(mouseX - dragOffset.x);
    let newY = Math.round(mouseY - dragOffset.y);

    // Detección magnética con otros bloques
    workspaceBlocks.forEach(other => {
      if (other.instanceId !== activeDragId && other.shape !== 'reporter' && other.shape !== 'boolean') {
        const dist = Math.hypot(newX - other.x, newY - (other.y + 46));
        if (dist < 28) {
          newX = other.x;
          newY = other.y + 46;
        }
      }
    });

    setWorkspaceBlocks(prev =>
      prev.map(b => b.instanceId === activeDragId ? { ...b, x: newX, y: newY } : b)
    );
  };

  const handleCanvasMouseUp = () => {
    setActiveDragId(null);
  };

  const removeBlock = (instId) => {
    setWorkspaceBlocks(prev => prev.filter(b => b.instanceId !== instId));
  };

  // INSERCIÓN DE CÁPSULAS DENTRO DE RANURAS C/E O ENTRADAS
  const handleSlotDrop = (e, targetBlockId, targetSlot) => {
    e.preventDefault();
    e.stopPropagation();
    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;
    try {
      const data = JSON.parse(rawData);
      setWorkspaceBlocks(prev => prev.map(b => {
        if (b.instanceId === targetBlockId) {
          if (targetSlot === 'condition') {
            return { ...b, condition: data.text || data.id };
          }
          if (targetSlot === 'body') {
            const nested = { ...data, instanceId: 'inst_n_' + Date.now() };
            return { ...b, body: [...(b.body || []), nested] };
          }
          if (targetSlot === 'elseBody') {
            const nested = { ...data, instanceId: 'inst_ne_' + Date.now() };
            return { ...b, elseBody: [...(b.elseBody || []), nested] };
          }
        }
        return b;
      }));
    } catch (err) {
      console.warn('Error en inserción en ranura:', err);
    }
  };

  // EJECUCIÓN OFICIAL DE SCRATCH CON MOVIMIENTO, GIROS Y BUCLES
  const handleRunGreenFlag = () => {
    let nextX = catState.x;
    let nextY = catState.y;
    let nextDir = catState.direction;
    let nextSay = '';

    const executeSeq = (blocks) => {
      blocks.forEach(blk => {
        if (blk.id === 'm_move') {
          const steps = parseInt(blk.params?.[0]?.val || 10, 10);
          const rad = (nextDir - 90) * (Math.PI / 180);
          nextX += Math.round(steps * Math.cos(rad));
          nextY += Math.round(steps * Math.sin(rad));
        } else if (blk.id === 'm_turn_right') {
          const deg = parseInt(blk.params?.[0]?.val || 15, 10);
          nextDir = (nextDir + deg) % 360;
        } else if (blk.id === 'm_turn_left') {
          const deg = parseInt(blk.params?.[0]?.val || 15, 10);
          nextDir = (nextDir - deg + 360) % 360;
        } else if (blk.id === 'm_gotoxy') {
          nextX = parseInt(blk.params?.[0]?.val || 0, 10);
          nextY = parseInt(blk.params2?.[0]?.val || 0, 10);
        } else if (blk.id === 'm_point_dir') {
          nextDir = parseInt(blk.params?.[0]?.val || 90, 10);
        } else if (blk.id === 'l_say_sec' || blk.id === 'l_say') {
          nextSay = blk.params?.[0]?.val || '¡Hola!';
        } else if (blk.shape === 'c-block' && blk.body) {
          executeSeq(blk.body);
        }
      });
    };

    executeSeq(workspaceBlocks);

    nextX = Math.max(-230, Math.min(230, nextX));
    nextY = Math.max(-170, Math.min(170, nextY));

    setCatState(prev => ({
      ...prev,
      x: nextX,
      y: nextY,
      direction: nextDir,
      saying: nextSay,
      isRunning: true
    }));
  };

  const handleStopAll = () => {
    setCatState(prev => ({ ...prev, saying: '', isRunning: false }));
  };

  const handleResetStage = () => {
    setCatState({
      x: 0,
      y: 0,
      direction: 90,
      visible: true,
      size: 100,
      saying: '',
      isRunning: false
    });
  };

  return (
    <div className="scratch-pro-ide-wrapper">
      {/* 1. BARRA LATERAL DE CATEGORÍAS */}
      <aside className="scratch-categories-rail">
        {SCRATCH_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={`scratch-cat-item ${activeCategory === cat.id ? 'active' : ''}`}
            style={{ '--cat-color': cat.color }}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="cat-circle-dot" style={{ backgroundColor: cat.color }} />
            <span className="cat-name-label">{cat.name}</span>
          </button>
        ))}
      </aside>

      {/* 2. PALETA DE BLOQUES CON FORMAS RÍGIDAS DE SCRATCH */}
      <section className="scratch-blocks-palette-area">
        <div className="palette-section-header" style={{ color: curCat.color }}>
          {curCat.name}
        </div>
        <div className="palette-blocks-container">
          {categoryBlocks.map(block => (
            <div
              key={block.id}
              className={`scratch-block ${block.shape}`}
              style={{ backgroundColor: curCat.color }}
              draggable
              onDragStart={e => handlePaletteDragStart(e, block)}
            >
              {block.shape !== 'reporter' && block.shape !== 'boolean' && block.shape !== 'hat' && (
                <div className="puzzle-tab-top" />
              )}

              {/* Contenido condicional C / E / Reporter / Stack */}
              {block.shape === 'c-block' ? (
                <>
                  <div className="c-block-header">
                    <span>{block.text}</span>
                    {block.hasCondition && (
                      <span className="block-slot-capsule hex-slot">
                        {block.condition || '<condición>'}
                      </span>
                    )}
                    {(block.params || []).map((p, i) => (
                      <span key={i} className="block-param-pill">{p.val}</span>
                    ))}
                    {block.suffix && <span>{block.suffix}</span>}
                  </div>
                  <div className="c-mouth-inner" style={{ borderColor: curCat.color }}>
                    <span className="c-mouth-placeholder">bloques dentro</span>
                  </div>
                  <div className="c-block-bottom" />
                </>
              ) : block.shape === 'e-block' ? (
                <>
                  <div className="c-block-header">
                    <span>si</span>
                    <span className="block-slot-capsule hex-slot">{'<condición>'}</span>
                    <span>entonces</span>
                  </div>
                  <div className="c-mouth-inner" style={{ borderColor: curCat.color }}>
                    <span className="c-mouth-placeholder">si es verdadero</span>
                  </div>
                  <div className="e-block-middle">
                    <span>si no</span>
                  </div>
                  <div className="e-mouth-inner" style={{ borderColor: curCat.color }}>
                    <span className="c-mouth-placeholder">si es falso</span>
                  </div>
                  <div className="e-block-bottom" />
                </>
              ) : block.isOp || block.isCmp ? (
                <div className="block-content-row">
                  <span className="block-slot-capsule" />
                  <span>{block.op || block.cmp}</span>
                  <span className="block-slot-capsule" />
                </div>
              ) : (
                <div className="block-content-row">
                  <span>{block.text}</span>
                  {(block.params || []).map((p, i) => (
                    <span key={i} className="block-param-pill">{p.val}</span>
                  ))}
                  {block.suffix && <span>{block.suffix}</span>}
                  {(block.params2 || []).map((p, i) => (
                    <span key={`p2-${i}`} className="block-param-pill">{p.val}</span>
                  ))}
                  {block.suffix2 && <span>{block.suffix2}</span>}
                </div>
              )}

              {block.shape !== 'reporter' && block.shape !== 'boolean' && block.shape !== 'c-block' && block.shape !== 'e-block' && (
                <div className="puzzle-tab-bottom" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. ESPACIO DE TRABAJO AMPLIO (CANVAS CON MOVILIDAD LIBRE Y ENCAJE C/E) */}
      <main className="scratch-workspace-main">
        <div className="workspace-controls-bar">
          <div className="zoom-btn-group">
            <button type="button" onClick={() => setZoom(z => Math.min(1.8, z + 0.1))} title="Acercar">+</button>
            <span className="zoom-text">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Alejar">-</button>
            <button type="button" onClick={() => setZoom(1)} title="Restablecer zoom 100%">100%</button>
          </div>
          <button type="button" className="btn-clear-blocks" onClick={() => setWorkspaceBlocks([])}>
            Limpiar Pizarra
          </button>
        </div>

        <div
          ref={canvasRef}
          className="scratch-canvas-plane"
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
        >
          <div
            className="canvas-zoom-container"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            {workspaceBlocks.length === 0 && (
              <div className="empty-workspace-watermark">
                Arrastra y encadena bloques aquí. Puedes moverlos libremente en cualquier momento.
              </div>
            )}

            {workspaceBlocks.map(inst => (
              <div
                key={inst.instanceId}
                className={`workspace-block-placed scratch-block ${inst.shape}`}
                style={{
                  left: `${inst.x}px`,
                  top: `${inst.y}px`,
                  backgroundColor: inst.color || '#4C97FF'
                }}
                onMouseDown={e => handleBlockMouseDown(e, inst.instanceId)}
              >
                {inst.shape !== 'reporter' && inst.shape !== 'boolean' && inst.shape !== 'hat' && (
                  <div className="puzzle-tab-top" />
                )}

                {/* Render de Bloque C en Mesa */}
                {inst.shape === 'c-block' ? (
                  <>
                    <div className="c-block-header">
                      <span>{inst.text}</span>
                      {inst.hasCondition && (
                        <div
                          className="block-slot-capsule hex-slot"
                          onDrop={e => handleSlotDrop(e, inst.instanceId, 'condition')}
                          onDragOver={e => e.preventDefault()}
                        >
                          {inst.condition || '<condición>'}
                        </div>
                      )}
                      {(inst.params || []).map((p, i) => (
                        <input
                          key={i}
                          type="text"
                          className="block-input-param"
                          defaultValue={p.val}
                          onClick={e => e.stopPropagation()}
                        />
                      ))}
                      {inst.suffix && <span>{inst.suffix}</span>}
                    </div>

                    {/* Ranura expandible que crece al agregar código */}
                    <div
                      className="c-mouth-inner"
                      style={{ borderColor: inst.color || '#FFAB19' }}
                      onDrop={e => handleSlotDrop(e, inst.instanceId, 'body')}
                      onDragOver={e => e.preventDefault()}
                    >
                      {(!inst.body || inst.body.length === 0) ? (
                        <span className="c-mouth-placeholder">Arrastra bloques dentro de la ranura</span>
                      ) : (
                        inst.body.map((child, idx) => (
                          <div
                            key={idx}
                            className={`scratch-block ${child.shape}`}
                            style={{ backgroundColor: child.color || '#4C97FF' }}
                          >
                            <span>{child.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="c-block-bottom" />
                  </>
                ) : inst.shape === 'e-block' ? (
                  /* Render de Bloque E en Mesa (si / sino con 2 bocas expandibles) */
                  <>
                    <div className="c-block-header">
                      <span>si</span>
                      <div
                        className="block-slot-capsule hex-slot"
                        onDrop={e => handleSlotDrop(e, inst.instanceId, 'condition')}
                        onDragOver={e => e.preventDefault()}
                      >
                        {inst.condition || '<condición>'}
                      </div>
                      <span>entonces</span>
                    </div>
                    <div
                      className="c-mouth-inner"
                      style={{ borderColor: inst.color || '#FFAB19' }}
                      onDrop={e => handleSlotDrop(e, inst.instanceId, 'body')}
                      onDragOver={e => e.preventDefault()}
                    >
                      {(!inst.body || inst.body.length === 0) ? (
                        <span className="c-mouth-placeholder">Si se cumple la condición</span>
                      ) : (
                        inst.body.map((child, idx) => (
                          <div
                            key={idx}
                            className={`scratch-block ${child.shape}`}
                            style={{ backgroundColor: child.color || '#4C97FF' }}
                          >
                            <span>{child.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="e-block-middle">
                      <span>si no</span>
                    </div>
                    <div
                      className="e-mouth-inner"
                      style={{ borderColor: inst.color || '#FFAB19' }}
                      onDrop={e => handleSlotDrop(e, inst.instanceId, 'elseBody')}
                      onDragOver={e => e.preventDefault()}
                    >
                      {(!inst.elseBody || inst.elseBody.length === 0) ? (
                        <span className="c-mouth-placeholder">Si no se cumple</span>
                      ) : (
                        inst.elseBody.map((child, idx) => (
                          <div
                            key={idx}
                            className={`scratch-block ${child.shape}`}
                            style={{ backgroundColor: child.color || '#4C97FF' }}
                          >
                            <span>{child.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="e-block-bottom" />
                  </>
                ) : (
                  <div className="block-content-row">
                    <span>{inst.text}</span>
                    {(inst.params || []).map((p, i) => (
                      <input
                        key={i}
                        type="text"
                        className="block-input-param"
                        defaultValue={p.val}
                        onClick={e => e.stopPropagation()}
                      />
                    ))}
                    {inst.suffix && <span>{inst.suffix}</span>}
                    {(inst.params2 || []).map((p, i) => (
                      <input
                        key={`p2-${i}`}
                        type="text"
                        className="block-input-param"
                        defaultValue={p.val}
                        onClick={e => e.stopPropagation()}
                      />
                    ))}
                    {inst.suffix2 && <span>{inst.suffix2}</span>}
                  </div>
                )}

                {inst.shape !== 'reporter' && inst.shape !== 'boolean' && inst.shape !== 'c-block' && inst.shape !== 'e-block' && (
                  <div className="puzzle-tab-bottom" />
                )}

                <button
                  type="button"
                  className="btn-delete-block"
                  onClick={(e) => { e.stopPropagation(); removeBlock(inst.instanceId); }}
                  title="Eliminar bloque"
                >
                  <IconClose size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 4. ESCENARIO DEL GATO OFICIAL Y TELEMETRÍA */}
      <aside className="scratch-stage-section">
        <div className="stage-control-bar">
          <button
            type="button"
            className="btn-green-flag"
            onClick={handleRunGreenFlag}
            title="Al hacer clic en bandera verde (Ejecutar)"
          >
            <span style={{ color: '#00E676', fontSize: '1.2rem' }}>⚑</span>
          </button>
          <button
            type="button"
            className="btn-red-stop"
            onClick={handleStopAll}
            title="Detener todo"
          >
            <span style={{ color: '#FF5252', fontSize: '1.2rem' }}>⏹</span>
          </button>
          <button
            type="button"
            className="btn-reset-pos"
            onClick={handleResetStage}
            title="Centrar personaje en (0, 0)"
          >
            Reiniciar Posición
          </button>
        </div>

        <div className="stage-screen-canvas">
          <div className="stage-axis-cross">
            <span className="origin-marker">(0, 0)</span>
          </div>

          {catState.visible && (
            <div
              className="scratch-cat-sprite"
              style={{
                left: `calc(50% + ${catState.x}px)`,
                top: `calc(50% - ${catState.y}px)`,
                transform: `translate(-50%, -50%) rotate(${catState.direction - 90}deg) scale(${catState.size / 100})`
              }}
            >
              {catState.saying && (
                <div className="sprite-speech-bubble">
                  {catState.saying}
                </div>
              )}

              <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="55" r="32" fill="#FFA500" stroke="#000" strokeWidth="3" />
                <polygon points="25,32 18,10 40,25" fill="#FFA500" stroke="#000" strokeWidth="3" />
                <polygon points="75,32 82,10 60,25" fill="#FFA500" stroke="#000" strokeWidth="3" />
                <ellipse cx="38" cy="50" rx="6" ry="8" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
                <ellipse cx="62" cy="50" rx="6" ry="8" fill="#FFFFFF" stroke="#000" strokeWidth="2" />
                <circle cx="40" cy="50" r="3" fill="#000" />
                <circle cx="64" cy="50" r="3" fill="#000" />
                <polygon points="50,58 46,63 54,63" fill="#FF4081" />
                <line x1="25" y1="58" x2="10" y2="56" stroke="#000" strokeWidth="2" />
                <line x1="25" y1="64" x2="10" y2="66" stroke="#000" strokeWidth="2" />
                <line x1="75" y1="58" x2="90" y2="56" stroke="#000" strokeWidth="2" />
                <line x1="75" y1="64" x2="90" y2="66" stroke="#000" strokeWidth="2" />
                <path d="M44 68 Q50 74 56 68" stroke="#000" strokeWidth="2" fill="none" />
              </svg>
            </div>
          )}
        </div>

        <div className="stage-telemetry-bar">
          <span>X: <strong>{catState.x}</strong></span>
          <span>Y: <strong>{catState.y}</strong></span>
          <span>Dirección: <strong>{catState.direction}°</strong></span>
          <span>Tamaño: <strong>{catState.size}%</strong></span>
        </div>
      </aside>
    </div>
  );
};

export default ScratchIDE;
