export const lessonContent = {
  arduino: {
    1: {
      title: 'Hola Mundo LED y Señal Digital',
      theory: `
        <h3>1. Fundamentos de la Electrónica y Microcontroladores</h3>
        <p>Un microcontrolador es un computador en miniatura contenido en un circuito integrado. A diferencia de una computadora normal, está diseñado para interactuar con el mundo físico mediante <strong>sensores</strong> y <strong>actuadores</strong>.</p>
        
        <h3>2. Estructura Obligatoria en Arduino (C++)</h3>
        <p>Todo sketch de Arduino requiere dos funciones fundamentales con sintaxis estricta:</p>
        <ul>
          <li><code>void setup()</code>: Se ejecuta una sola vez al encender o reiniciar el microcontrolador. Se utiliza para configurar puertos de entrada o salida y parámetros de comunicación.</li>
          <li><code>void loop()</code>: Se ejecuta en un bucle continuo e infinito mientras la placa reciba energía.</li>
        </ul>

        <h3>3. El LED y la Resistencia</h3>
        <p>Un <strong>LED</strong> (Light Emitting Diode) es un componente semiconductor polarizado: posee un ánodo (positivo, pata larga) y un cátodo (negativo, pata corta). Al conectarlo a un pin digital de Arduino, debemos configurar el pin como <code>OUTPUT</code> con <code>pinMode(pin, OUTPUT);</code> y enviar un estado alto (5V) con <code>digitalWrite(pin, HIGH);</code>.</p>
      `,
      example: {
        code: `// Programa de inicialización de LED en Arduino
void setup() {
  pinMode(13, OUTPUT); // Pin 13 como salida
}

void loop() {
  digitalWrite(13, HIGH); // Envía 5V (enciende)
  delay(1000);            // Pausa de 1000 milisegundos
  digitalWrite(13, LOW);  // Envía 0V (apaga)
  delay(1000);            // Pausa de 1000 milisegundos
}`,
        explanation: 'Se configura el puerto digital 13 como salida en el setup(). En loop(), la función digitalWrite genera un estado HIGH que enciende el diodo, delay suspende la ejecución por 1 segundo y luego LOW lo apaga.'
      },
      practice: {
        instructions: 'Configura el pin digital 8 como salida. Dentro de void loop(), enciende el LED, espera 2000 ms, apágalo y espera 1000 ms. Respeta estrictamente los puntos y comas y nombres exactos de funciones.',
        initialCode: `void setup() {
  // Configura el pin 8 como OUTPUT aquí
}

void loop() {
  // Escribe la secuencia digitalWrite y delay
}`,
        expectedOutput: 'pinMode(8,OUTPUT);digitalWrite(8,HIGH);delay(2000);digitalWrite(8,LOW);delay(1000);'
      },
      challenge: {
        description: 'Un faro marítimo emite 3 destellos rápidos seguidos de una pausa de 2 segundos. Programa un ciclo for que repita el destello 3 veces (encendido 200ms, apagado 200ms) y fuera del for coloca una pausa de 2000ms.',
        hints: [
          'Declara la variable de control del bucle: for (int i = 0; i < 3; i++) { ... }',
          'Dentro de los corchetes del for alterna HIGH y LOW con delay(200);',
          'Ubica el delay(2000); después de la llave de cierre del for para completar la secuencia del faro.'
        ]
      }
    },
    2: {
      title: 'Control de Semáforo y Secuencias Digitales',
      theory: `
        <h3>1. Coordinación de Múltiples Salidas</h3>
        <p>En proyectos de automatización e ingeniería vial, los semáforos inteligentes coordinan múltiples actuadores luminosos asegurando que no existan estados peligrosos (por ejemplo, verde simultáneo en vías cruzadas).</p>
        
        <h3>2. Organización y Convenciones de Pines</h3>
        <p>Es una buena práctica de ingeniería definir constantes para los números de pines al inicio del programa para evitar números mágicos dispersos:</p>
        <pre><code>const int PIN_VERDE = 2;\nconst int PIN_AMARILLO = 3;\nconst int PIN_ROJO = 4;</code></pre>
      `,
      example: {
        code: `const int LED_VERDE = 2;
const int LED_AMARILLO = 3;
const int LED_ROJO = 4;

void setup() {
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARILLO, OUTPUT);
  pinMode(LED_ROJO, OUTPUT);
}

void loop() {
  digitalWrite(LED_VERDE, HIGH);
  delay(3000);
  digitalWrite(LED_VERDE, LOW);
  
  digitalWrite(LED_AMARILLO, HIGH);
  delay(1000);
  digitalWrite(LED_AMARILLO, LOW);
  
  digitalWrite(LED_ROJO, HIGH);
  delay(3000);
  digitalWrite(LED_ROJO, LOW);
}`,
        explanation: 'El flujo secuencial activa el pin verde por 3 segundos, lo apaga, activa el amarillo por 1 segundo, lo apaga y finalmente mantiene el rojo por 3 segundos antes de reiniciar el ciclo loop.'
      },
      practice: {
        instructions: 'Declara y configura los pines 10, 11 y 12 como OUTPUT. Enciende el pin 10 durante 1500 ms, luego apágalo y activa el pin 11 por 500 ms.',
        initialCode: `void setup() {
  // Configuración de pines 10, 11 y 12
}

void loop() {
  // Secuencia de encendido y apagado
}`,
        expectedOutput: 'pinMode(10,OUTPUT);pinMode(11,OUTPUT);pinMode(12,OUTPUT);'
      },
      challenge: {
        description: 'Simula un semáforo peatonal con botón de solicitud: cuando el semáforo vehicular esté en rojo, el peatonal debe estar en verde por 4 segundos con una advertencia parpadeante previa.',
        hints: [
          'Usa variables para llevar el tiempo o ejecuta secuencias delay() controladas.',
          'Para el parpadeo de advertencia usa un bucle for de 3 iteraciones encendiendo y apagando en 250ms.'
        ]
      }
    },
    3: {
      title: 'Pulsadores y Entradas Digitales (Pull-up)',
      theory: `
        <h3>1. Estados Lógicos y Ruido Eléctrico</h3>
        <p>Un microcontrolador lee voltajes. Cuando un pin queda desconectado en el aire ("flotante"), el ruido electromagnético ambiental puede hacer que la lectura oscile erráticamente entre 0 y 1.</p>
        
        <h3>2. Resistencia Pull-up Interna</h3>
        <p>Arduino incluye resistencias internas de pull-up que podemos activar con <code>pinMode(pin, INPUT_PULLUP);</code>. En esta configuración, cuando el botón no está presionado se lee <strong>HIGH (1)</strong> y cuando se pulsa y conecta a tierra (GND) se lee <strong>LOW (0)</strong>.</p>
      `,
      example: {
        code: `const int BOTON = 7;
const int LED = 13;

void setup() {
  pinMode(BOTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  int valor = digitalRead(BOTON);
  if (valor == LOW) {
    digitalWrite(LED, HIGH); // Presionado
  } else {
    digitalWrite(LED, LOW);  // Reposo
  }
}`,
        explanation: 'digitalRead consulta el nivel de voltaje del pin 7. Si es LOW (botón presionado con pull-up), se activa la salida del LED.'
      },
      practice: {
        instructions: 'Configura el pin 2 con INPUT_PULLUP y el pin 9 como OUTPUT. Lee el estado en una variable int estado = digitalRead(2); y si es LOW, enciende el pin 9.',
        initialCode: `void setup() {
  // Tu código aquí
}

void loop() {
  // Lectura condicional
}`,
        expectedOutput: 'pinMode(2,INPUT_PULLUP);digitalRead(2);'
      },
      challenge: {
        description: 'Crea un interruptor con memoria (Bistable / Toggle): cada vez que se presione el botón una vez, el LED debe cambiar de estado (si estaba apagado se enciende y viceversa).',
        hints: [
          'Necesitas una variable booleana como estadoLed = !estadoLed;',
          'Añade un delay(250) para evitar el efecto rebote mecánico (debounce) del pulsador.'
        ]
      }
    },
    4: {
      title: 'Monitor Serial y Telemetría',
      theory: `
        <h3>1. Comunicación UART Asíncrona</h3>
        <p>El Monitor Serial permite transmitir texto e información diagnóstica entre el Arduino y la computadora a través del cable USB usando el protocolo serie UART.</p>
        
        <h3>2. Velocidad en Baudios</h3>
        <p>Para establecer la comunicación se utiliza <code>Serial.begin(9600);</code> en el setup. 9600 baudios significa que se transmiten 9600 bits de información por segundo.</p>
      `,
      example: {
        code: `void setup() {
  Serial.begin(9600);
  Serial.println("SISTEMA TELEMETRICO INICIADO");
}

void loop() {
  int lectura = analogRead(A0);
  Serial.print("Valor del sensor A0: ");
  Serial.println(lectura);
  delay(1000);
}`,
        explanation: 'Serial.print envía el texto sin salto de línea, mientras que Serial.println añade un salto de línea al final del mensaje.'
      },
      practice: {
        instructions: 'Inicia el puerto serial a 9600 baudios en setup(). En loop(), imprime "SISTEMA ACTIVO" cada 2000 ms usando Serial.println y delay.',
        initialCode: `void setup() {
  // Inicia comunicación serial
}

void loop() {
  // Envío periódico
}`,
        expectedOutput: 'Serial.begin(9600);Serial.println("SISTEMA ACTIVO");delay(2000);'
      },
      challenge: {
        description: 'Construye un voltímetro digital: lee el pin A0 (0 a 1023) y calcula el voltaje real en voltios (0 a 5.0V) con la fórmula: float volt = lectura * (5.0 / 1023.0); e imprímelo por serial con 2 decimales.',
        hints: [
          'Usa el tipo de dato float para manejar números decimales con precisión.',
          'Serial.print("Voltaje: "); Serial.println(volt);'
        ]
      }
    },
    5: {
      title: 'Modulación por Ancho de Pulso (PWM)',
      theory: `
        <h3>1. ¿Cómo simula Arduino voltajes analógicos?</h3>
        <p>Los microcontroladores no pueden generar voltajes variables como 2.5V de forma nativa. Para simularlo, utilizan <strong>PWM (Pulse Width Modulation)</strong>, alternando rápidamente entre 0V y 5V a alta frecuencia.</p>
        
        <h3>2. Ciclo de Trabajo (Duty Cycle)</h3>
        <p>La función <code>analogWrite(pin, valor);</code> recibe un valor entre 0 (0% encendido) y 255 (100% encendido). Un valor de 128 representa un ciclo de trabajo del 50%, entregando un voltaje promedio equivalente a 2.5V para regular la intensidad de una lámpara o la velocidad de un motor.</p>
      `,
      example: {
        code: `const int PIN_LED = 9; // Debe ser pin con soporte PWM (~9)

void setup() {
  pinMode(PIN_LED, OUTPUT);
}

void loop() {
  // Aumenta brillo progresivamente
  for (int brillo = 0; brillo <= 255; brillo += 5) {
    analogWrite(PIN_LED, brillo);
    delay(20);
  }
}`,
        explanation: 'Un bucle for incrementa la variable brillo de 0 a 255. En cada paso, analogWrite actualiza el ancho del pulso generando un efecto de respiración luminosa suave.'
      },
      practice: {
        instructions: 'Configura el pin PWM 6 como salida. Ajusta su nivel a media potencia (128) con analogWrite.',
        initialCode: `void setup() {
  // Configura pin 6
}

void loop() {
  // Envía señal PWM
}`,
        expectedOutput: 'pinMode(6,OUTPUT);analogWrite(6,128);'
      },
      challenge: {
        description: 'Crea un efecto de desvanecimiento continuo (fade-in y fade-out): el brillo debe subir de 0 a 255 y luego descender de 255 a 0 gradualmente.',
        hints: [
          'Usa dos ciclos for consecutivos: uno con brillo++ y el segundo con brillo--.',
          'Añade un delay corto (ej: 15ms) en cada paso para que el ojo humano aprecie la transición.'
        ]
      }
    }
  },

  scratch: {
    1: {
      title: 'Primeros Pasos con Bloques y Coordenadas',
      theory: `
        <h3>1. El Paradigma de Programación Visual por Bloques</h3>
        <p>Scratch sustituye la escritura de sintaxis textual propensa a errores por bloques visuales ensamblables que encajan como piezas de rompecabezas. Si dos bloques no son compatibles lógicamente, la interfaz no permite su conexión.</p>

        <h3>2. El Escenario Cartesiano</h3>
        <p>El escenario de Scratch es un plano bidimensional (X, Y). El centro exacto de la pantalla es (X: 0, Y: 0). Moverse hacia la derecha aumenta X, hacia la izquierda disminuye X. Moverse hacia arriba aumenta Y y hacia abajo disminuye Y.</p>

        <h3>3. Evento de Inicio</h3>
        <p>Todo script requiere un <strong>bloque de inicio</strong> o sombrero (hat block). El más común es <code>al presionar bandera verde</code>, que actúa como el punto de entrada al programa.</p>
      `,
      example: {
        code: `[al presionar bandera verde]
[ir a x: (0) y: (0)]
[apuntar en dirección (90)]
[mover (50) pasos]
[decir [¡Hola Explorador!] por (2) segundos]`,
        explanation: 'Al pulsar la bandera verde, el personaje se sitúa en el centro del escenario, apunta hacia la derecha (90°), avanza 50 unidades y muestra un globo de diálogo.'
      },
      practice: {
        instructions: 'Arrastra el bloque [al presionar bandera verde], añade [ir a x: (0) y: (0)] y luego [mover (30) pasos]. Ejecuta para comprobar la posición final del objeto.',
        initialCode: `[al presionar bandera verde]`,
        expectedOutput: 'ir a x: (0) y: (0)'
      },
      challenge: {
        description: 'Haz que el personaje se mueva dibujando un cuadrado imaginario en la pantalla: avanza 60 pasos, gira 90 grados y repite este proceso 4 veces usando un bloque de repetición.',
        hints: [
          'Inserta el bloque [repetir (4)]',
          'Dentro del bloque de repetición anida: [mover (60) pasos] y [girar a la derecha (90) grados]'
        ]
      }
    },
    2: {
      title: 'Animación con Disfraces y Diálogos',
      theory: `
        <h3>1. Disfraces y Animación Cuadro por Cuadro</h3>
        <p>Los objetos en Scratch pueden tener múltiples disfraces (imágenes). Al alternar entre ellos con un intervalo de tiempo corto, se crea la ilusión de movimiento, similar al principio de la animación tradicional.</p>
        
        <h3>2. Pausas Temporales</h3>
        <p>La computadora ejecuta instrucciones a millones de operaciones por segundo. Para que un cambio de disfraz sea perceptible, es indispensable incluir el bloque <code>esperar (0.2) segundos</code> entre cada cuadro.</p>
      `,
      example: {
        code: `[al presionar bandera verde]
[repetir (10)]
  [siguiente disfraz]
  [mover (10) pasos]
  [esperar (0.2) segundos]`,
        explanation: 'En cada repetición del bucle, el personaje cambia de imagen, avanza 10 píxeles y descansa 0.2 segundos, simulando una caminata fluida.'
      },
      practice: {
        instructions: 'Crea una secuencia con bandera verde, cambia el disfraz con [cambiar disfraz a [disfraz2]] y muestra un diálogo de saludo durante 3 segundos.',
        initialCode: `[al presionar bandera verde]`,
        expectedOutput: 'cambiar disfraz'
      },
      challenge: {
        description: 'Programa una conversación entre dos personajes: el primero saluda, espera a que el segundo responda y luego expresa una emoción cambiando su tamaño.',
        hints: [
          'Calcula el tiempo con [esperar (X) segundos] para coordinar los diálogos.',
          'Utiliza el bloque [cambiar tamaño por (20)] para enfatizar la sorpresa.'
        ]
      }
    },
    3: {
      title: 'Control por Teclado y Detección de Bordes',
      theory: `
        <h3>1. Eventos Asíncronos de Entrada</h3>
        <p>En el desarrollo de videojuegos, el jugador interactúa en tiempo real. Scratch permite capturar eventos de teclado mediante bloques de eventos como <code>al presionar tecla [flecha arriba]</code>.</p>
        
        <h3>2. Modificación de Coordenadas</h3>
        <p>Para mover verticalmente se usa <code>cambiar y por (10)</code> (arriba) o <code>cambiar y por (-10)</code> (abajo). Para movimiento horizontal se usa <code>cambiar x por (10)</code> o <code>cambiar x por (-10)</code>.</p>
      `,
      example: {
        code: `[al presionar tecla [flecha derecha]]
[apuntar en dirección (90)]
[cambiar x por (10)]

[al presionar tecla [flecha izquierda]]
[apuntar en dirección (-90)]
[cambiar x por (-10)]`,
        explanation: 'Cada bloque de evento responde de forma independiente a la pulsación de la tecla asignada, modificando la orientación y la coordenada correspondiente.'
      },
      practice: {
        instructions: 'Crea los bloques para mover al personaje arriba al presionar la flecha arriba cambiando Y por 10.',
        initialCode: `[al presionar bandera verde]`,
        expectedOutput: 'cambiar y por'
      },
      challenge: {
        description: 'Añade la instrucción [rebotar si toca un borde] para evitar que el personaje se salga de los límites del escenario al desplazarse.',
        hints: [
          'Ubica [rebotar si toca un borde] inmediatamente después de cambiar la posición.',
          'Configura el estilo de rotación en izquierda-derecha para que el personaje no quede de cabeza al rebotar.'
        ]
      }
    },
    4: {
      title: 'Variables y Puntuación en Juegos',
      theory: `
        <h3>1. ¿Qué es una Variable en Programación?</h3>
        <p>Una variable es un contenedor con nombre que almacena un dato que puede cambiar a lo largo del tiempo, como la puntuación, las vidas restantes o el tiempo transcurrido en una partida.</p>
        
        <h3>2. Inicialización Crítica</h3>
        <p>Un error común es olvidar reiniciar las variables al iniciar una nueva partida. Siempre se debe utilizar <code>fijar [puntos] a (0)</code> debajo de la bandera verde.</p>
      `,
      example: {
        code: `[al presionar bandera verde]
[fijar [puntos] a (0)]
[por siempre]
  [si <tocando [manzana]?> entonces]
    [cambiar [puntos] por (1)]
    [iniciar sonido [pop]]
    [esperar (0.5) segundos]`,
        explanation: 'El bucle por siempre inspecciona continuamente si hay contacto con el objetivo. Si la condición es verdadera, incrementa los puntos en 1 y reproduce una retroalimentación sonora.'
      },
      practice: {
        instructions: 'Crea una variable llamada "puntos", inicialízala en 0 con [fijar [puntos] a (0)] y auméntala en 1 con [cambiar [puntos] por (1)].',
        initialCode: `[al presionar bandera verde]`,
        expectedOutput: 'fijar [puntos] a (0)'
      },
      challenge: {
        description: 'Construye un sistema de vidas: inicia en 3 vidas. Si el personaje toca un obstáculo pierde 1 vida, y si las vidas llegan a 0 se ejecuta el bloque [detener [todos]].',
        hints: [
          'Usa el operador de comparación < [vidas] = (0) > dentro de un bloque [si ... entonces].',
          'Coloca [detener [todos]] dentro del condicional de derrota.'
        ]
      }
    },
    5: {
      title: 'Bucles Anidados y Clones',
      theory: `
        <h3>1. Bucles dentro de Bucles (Anidamiento)</h3>
        <p>Un bucle anidado es una estructura repetitiva que se encuentra dentro de otra. Se utiliza comúnmente para recorrer patrones matriciales (filas y columnas) o generar patrones geométricos complejos.</p>

        <h3>2. Generación Dinámica de Clones</h3>
        <p>En lugar de crear 50 objetos manualmente, podemos generar réplicas dinámicas con <code>crear clon de [mí mismo]</code> y programar su comportamiento independiente con <code>al comenzar como clon</code>.</p>
      `,
      example: {
        code: `[al presionar bandera verde]
[repetir (5)]
  [crear clon de [mí mismo]]
  [esperar (1) segundos]

[al comenzar como clon]
[ir a x: (elegir número al azar entre (-200) y (200)) y: (150)]
[por siempre]
  [cambiar y por (-5)]
  [si <y < (-160)> entonces]
    [eliminar este clon]`,
        explanation: 'El objeto original genera un nuevo clon cada segundo. Cada clon aparece en una posición horizontal aleatoria superior y cae simulando lluvia o lluvia de meteoritos hasta desaparecer al tocar el suelo.'
      },
      practice: {
        instructions: 'Inserta el bloque de evento [al comenzar como clon] y haz que avance 20 pasos antes de cambiar su disfraz.',
        initialCode: `[al comenzar como clon]`,
        expectedOutput: 'mover (20) pasos'
      },
      challenge: {
        description: 'Diseña un generador de estrellas fugaces usando clones que desciendan en diagonal y varíen su tamaño aleatoriamente.',
        hints: [
          'Modifica tanto X como Y simultáneamente para lograr movimiento diagonal.',
          'Usa [fijar tamaño a (elegir número al azar entre (50) y (120))%] al iniciar cada clon.'
        ]
      }
    }
  },

  python: {
    1: {
      title: 'Sintaxis, Tipos de Datos y Función print()',
      theory: `
        <h3>1. ¿Por qué Python en Ciencia y Tecnología?</h3>
        <p>Python es un lenguaje de programación de alto nivel, interpretado y multiparadigma, conocido por su sintaxis limpia y legible. Es el estándar mundial en inteligencia artificial, ciencia de datos, desarrollo web y robótica.</p>

        <h3>2. Tipos de Datos Primitivos</h3>
        <ul>
          <li><strong>str (Cadena de texto):</strong> Texto delimitado por comillas simples o dobles: <code>"Hola Mundo"</code></li>
          <li><strong>int (Entero):</strong> Números sin decimales: <code>42</code>, <code>-10</code></li>
          <li><strong>float (Flotante):</strong> Números reales con punto decimal: <code>3.1416</code>, <code>0.05</code></li>
          <li><strong>bool (Booleano):</strong> Verdadero o Falso: <code>True</code>, <code>False</code></li>
        </ul>

        <h3>3. La Función print() y f-strings</h3>
        <p>Para mostrar información en consola se utiliza <code>print()</code>. En Python moderno (3.6+), las <strong>f-strings</strong> facilitan incrustar variables directamente dentro de cadenas con llaves <code>{variable}</code>.</p>
      `,
      example: {
        code: `# Declaración de variables y tipos de datos
nombre = "CodeCraft"
version = 2.0
alumnos = 35
activo = True

# Salida formateada con f-string
print(f"Plataforma: {nombre} v{version}")
print(f"Total de estudiantes matriculados: {alumnos}")
print(f"Estado del sistema operativo: {activo}")`,
        explanation: 'Se definen cuatro variables de distintos tipos y se imprimen mediante f-strings, evaluando limpiamente los identificadores dentro de las llaves.'
      },
      practice: {
        instructions: 'Declara dos variables: lenguaje = "Python" y nivel = 1. Luego usa print() para mostrar: Aprendiendo Python en nivel 1.',
        initialCode: `# Escribe aquí tus variables y la función print
`,
        expectedOutput: 'Aprendiendo Python en nivel 1'
      },
      challenge: {
        description: 'Crea un conversor de temperatura: define una variable celsius = 25.0, calcula los grados Fahrenheit con la fórmula (celsius * 9/5) + 32 y muestra el resultado en consola.',
        hints: [
          'fahrenheit = (celsius * 9/5) + 32',
          'print(f"Temperatura en Fahrenheit: {fahrenheit}")'
        ]
      }
    },
    2: {
      title: 'Operadores Aritméticos y Entrada de Datos',
      theory: `
        <h3>1. Operaciones Matemáticas en Código</h3>
        <p>Python funciona como una calculadora de alta precisión. Los operadores aritméticos son:</p>
        <ul>
          <li><code>+</code> Suma, <code>-</code> Resta, <code>*</code> Multiplicación, <code>/</code> División real</li>
          <li><code>//</code> División entera (descarta decimales), <code>%</code> Módulo (residuo de la división)</li>
          <li><code>**</code> Potenciación (ej: <code>2 ** 3 = 8</code>)</li>
        </ul>

        <h3>2. Precedencia de Operadores</h3>
        <p>Al igual que en álgebra tradicional, las multiplicaciones y divisiones se evalúan antes que las sumas y restas. Para forzar un orden específico se utilizan paréntesis <code>(a + b) * c</code>.</p>
      `,
      example: {
        code: `# Cálculo del área y perímetro de un rectángulo
base = 12.5
altura = 4.0

area = base * altura
perimetro = 2 * (base + altura)

print(f"Dimensiones: Base={base}cm, Altura={altura}cm")
print(f"Área calculada: {area} cm²")
print(f"Perímetro calculado: {perimetro} cm")`,
        explanation: 'Se aplican fórmulas geométricas estándar respetando los paréntesis en el cálculo del perímetro.'
      },
      practice: {
        instructions: 'Calcula el promedio de tres notas: nota1 = 80, nota2 = 90, nota3 = 70. Imprime el promedio con print(f"Promedio: {promedio}").',
        initialCode: `# Calcula el promedio
nota1 = 80
nota2 = 90
nota3 = 70
`,
        expectedOutput: 'Promedio: 80.0'
      },
      challenge: {
        description: 'Calcula el índice de masa corporal (IMC) de una persona: peso = 65 (kg), altura = 1.72 (m). Fórmula: peso / (altura ** 2). Muestra el IMC resultante.',
        hints: [
          'imc = peso / (altura ** 2)',
          'print(f"Tu IMC es: {imc}")'
        ]
      }
    },
    3: {
      title: 'Estructuras Condicionales y Lógica Booleana',
      theory: `
        <h3>1. Toma de Decisiones con if, elif, else</h3>
        <p>Los programas necesitan ejecutar rutas distintas según las condiciones del entorno. En Python, la estructura se compone de:</p>
        <pre><code>if condicion:\n    # Bloque si es verdadero\nelif otra_condicion:\n    # Bloque alternativo\nelse:\n    # Bloque por defecto</code></pre>

        <h3>2. La Indentación Estricta de Python</h3>
        <p>A diferencia de lenguajes como C++ o JavaScript que utilizan llaves <code>{}</code>, Python utiliza la <strong>indentación (4 espacios en blanco)</strong> para delimitar bloques. Una mala indentación genera un error sintáctico de tipo <code>IndentationError</code>.</p>
      `,
      example: {
        code: `calificacion = 85

if calificacion >= 90:
    print("Excelente: Nivel Sobresaliente")
elif calificacion >= 70:
    print("Aprobado: Buen desempeño")
else:
    print("Necesita Refuerzo: Por debajo de la meta")`,
        explanation: 'El flujo analiza sucesivamente las condiciones en orden descendente y ejecuta únicamente el bloque identado correspondiente a la primera condición verdadera.'
      },
      practice: {
        instructions: 'Define edad = 16. Escribe un condicional que imprima "Mayor de edad" si edad >= 18, o "Menor de edad" en caso contrario.',
        initialCode: `edad = 16
# Escribe el if / else con 4 espacios de indentación
`,
        expectedOutput: 'Menor de edad'
      },
      challenge: {
        description: 'Simula el sistema de control de acceso a una atracción mecánica: la persona debe tener estatura >= 1.40 metros Y edad >= 12 años para ingresar.',
        hints: [
          'Usa el operador lógico and: if estatura >= 1.40 and edad >= 12:',
          'Recuerda identar la instrucción dentro del condicional.'
        ]
      }
    },
    4: {
      title: 'Bucles for, range() y Acumuladores',
      theory: `
        <h3>1. Bucle Determinado con for</h3>
        <p>Un bucle <code>for</code> se utiliza cuando conocemos de antemano el número de iteraciones o cuando deseamos recorrer los elementos de una colección secuencial.</p>

        <h3>2. La Función range()</h3>
        <ul>
          <li><code>range(stop)</code>: de 0 hasta stop - 1. (ej: <code>range(5) -> 0, 1, 2, 3, 4</code>)</li>
          <li><code>range(start, stop)</code>: desde start hasta stop - 1.</li>
          <li><code>range(start, stop, step)</code>: avanza con incrementos de step.</li>
        </ul>
      `,
      example: {
        code: `# Sumatoria de los primeros números naturales
acumulador = 0

for i in range(1, 6):
    acumulador = acumulador + i
    print(f"Paso {i}: Suma acumulada = {acumulador}")

print(f"Total final: {acumulador}")`,
        explanation: 'En cada iteración, la variable de control i toma un valor del rango y se añade a la variable acumulador, imprimiendo el progreso paso a paso.'
      },
      practice: {
        instructions: 'Crea un bucle for que itere de 0 a 4 usando range(5) e imprima cada número.',
        initialCode: `# Bucle for con range
for i in range(5):
    print(i)
`,
        expectedOutput: '4'
      },
      challenge: {
        description: 'Imprime la tabla de multiplicar del 7, desde 7 x 1 hasta 7 x 10, con formato: 7 x 1 = 7, 7 x 2 = 14...',
        hints: [
          'Usa for factor in range(1, 11):',
          'Dentro del bucle: print(f"7 x {factor} = {7 * factor}")'
        ]
      }
    },
    5: {
      title: 'Estructuras de Datos: Listas y Métodos',
      theory: `
        <h3>1. Colecciones de Datos Ordenadas (Listas)</h3>
        <p>Una lista en Python es una estructura de datos mutable, indexada y heterogénea delimitada por corchetes <code>[]</code>.</p>

        <h3>2. Indexación en Base Cero</h3>
        <p>El primer elemento de una lista tiene el índice <code>0</code>, el segundo tiene el índice <code>1</code>. También se admite indexación negativa: <code>lista[-1]</code> hace referencia al último elemento.</p>

        <h3>3. Métodos Principales</h3>
        <p><code>append(item)</code> para agregar al final, <code>len(lista)</code> para conocer la cantidad de elementos y <code>pop()</code> para extraer el último elemento.</p>
      `,
      example: {
        code: `sensores = ["Temperatura", "Humedad", "Ultrasonido"]

# Añadir un nuevo sensor
sensores.append("Luz LDR")

print(f"Total de sensores: {len(sensores)}")
print(f"Primer sensor registrado: {sensores[0]}")
print(f"Último sensor registrado: {sensores[-1]}")

for s in sensores:
    print(f"- Sensor conectado: {s}")`,
        explanation: 'Demuestra cómo inicializar una lista, agregar elementos con append, medir su longitud con len y recorrer cada elemento con un ciclo for.'
      },
      practice: {
        instructions: 'Crea una lista llamada notas con los valores [85, 92, 78]. Añade la nota 95 con append e imprime la longitud de la lista con len(notas).',
        initialCode: `notas = [85, 92, 78]
# Tu código aquí
`,
        expectedOutput: '4'
      },
      challenge: {
        description: 'Filtra una lista de números: dada numeros = [12, -5, 8, -2, 15, 0], crea una nueva lista positivos que solo contenga los números mayores a 0 e imprímela.',
        hints: [
          'Inicializa positivos = []',
          'Recorre con for n in numeros: y verifica if n > 0: positivos.append(n)'
        ]
      }
    }
  }
};
