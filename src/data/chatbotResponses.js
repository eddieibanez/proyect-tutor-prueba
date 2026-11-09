export const chatbotResponses = {
  greetings: [
    "¡Hola! Soy CodeBot 🤖, tu asistente virtual. ¿En qué te puedo ayudar hoy?",
    "¡Saludos, joven programador! ¿Listo para una nueva aventura de código?",
    "¡Hola! Qué bueno verte por aquí. ¿Qué estamos construyendo hoy?",
    "¡Buen día! Estoy listo para ayudarte a aprender a programar. ¿Por dónde empezamos?",
    "¡Hola, hola! 🚀 ¿Necesitas ayuda con algún reto?",
    "¡Hey! Soy CodeBot. Estoy aquí para guiarte en tus proyectos. ¿Qué tienes en mente?",
    "¡Hola! Me encanta ver cómo aprendes. ¿Cuál es nuestro objetivo de hoy?",
    "¡Bienvenido de vuelta! ¿Continuamos con nuestra lección de programación?",
    "¡Saludos! 🌟 ¿Tienes alguna duda sobre lo que estamos aprendiendo?",
    "¡Hola! Prepárate para programar cosas increíbles. ¿Qué necesitas?"
  ],
  encouragement: [
    "¡Vas por muy buen camino! Sigue así.",
    "¡Excelente esfuerzo! Programar toma tiempo, pero lo estás logrando.",
    "¡No te rindas! Cada error es una oportunidad para aprender algo nuevo.",
    "¡Me encanta cómo piensas! Esa es la actitud de un verdadero programador.",
    "¡Lo estás haciendo genial! Poco a poco irás entendiendo todo mucho mejor.",
    "¡Eres muy creativo! Sigue explorando nuevas ideas.",
    "¡Buen trabajo! Estás construyendo habilidades increíbles.",
    "¡Tú puedes con este reto! Confío en tus habilidades de resolución de problemas.",
    "¡Sigue intentándolo! La práctica hace al maestro.",
    "¡Qué buena dedicación! Estoy orgulloso de tu progreso."
  ],
  guidingQuestions: [
    "¿Qué crees que pasaría si intentas cambiar el orden de las instrucciones?",
    "¿Has intentado pensar en el problema paso a paso? Cuéntame cuál es el primer paso.",
    "Piensa en qué tipo de variable necesitarías para guardar esa información...",
    "¿Recuerdas qué aprendimos sobre los bucles? ¿Cómo podrían ayudarnos aquí?",
    "Si fueras la computadora, ¿cómo leerías ese código?",
    "¿Qué parte del código crees que se está ejecutando justo antes del problema?",
    "¿Qué condición necesitamos para que esto funcione correctamente?",
    "¿Cómo le explicarías este problema a un amigo? A veces eso ayuda a encontrar la solución.",
    "¿Cuál es el resultado que esperas obtener y cuál es el que estás obteniendo realmente?",
    "¿Qué crees que falta para completar este paso?"
  ],
  topicHints: {
    arduino: {
      led: [
        "Para encender un LED, recuerda usar 'pinMode' en el 'setup' y 'digitalWrite' en el 'loop'.",
        "¿Estás seguro de que declaraste el pin del LED como salida (OUTPUT)?",
        "Recuerda que 'HIGH' enciende el LED y 'LOW' lo apaga.",
        "Si quieres que parpadee, tal vez necesites usar 'delay' entre el encendido y el apagado.",
        "Revisa si el pin que usaste en el código es el mismo donde conectaste el LED en la placa."
      ],
      sensor: [
        "Para leer un sensor, quizás debas usar 'analogRead' o 'digitalRead' dependiendo del tipo de sensor.",
        "¿Guardaste el valor del sensor en una variable para usarlo después?",
        "Recuerda revisar en el Monitor Serie para ver qué valores está leyendo tu sensor.",
        "Si es un sensor analógico, recuerda conectarlo a los pines A0, A1, etc.",
        "¿Has configurado correctamente el pin del sensor como entrada (INPUT)?"
      ],
      motor: [
        "Para mover un servomotor, ¿incluiste la librería '#include <Servo.h>'?",
        "Recuerda crear el objeto del motor y luego usar 'attach' en el 'setup'.",
        "Para cambiar la posición de un servomotor, usa el comando 'write' con el ángulo deseado.",
        "¿Estás dando suficiente energía al motor? A veces necesitan una fuente de poder externa.",
        "Si usas un motor DC, revisa si necesitas un puente H para cambiar la dirección."
      ],
      general: [
        "Recuerda que cada instrucción en Arduino debe terminar con un punto y coma (;).",
        "Revisa si abriste y cerraste correctamente todas las llaves { }.",
        "El código en el 'setup' se ejecuta una vez, el código en el 'loop' se repite siempre.",
        "Las mayúsculas y minúsculas son importantes en Arduino. 'pinMode' no es lo mismo que 'Pinmode'.",
        "Usa el Monitor Serie para imprimir mensajes y saber qué está haciendo tu código."
      ]
    },
    scratch: {
      movimiento: [
        "Para mover un personaje, busca los bloques azules de 'Movimiento'.",
        "¿Has intentado usar el bloque 'mover 10 pasos'?",
        "Si quieres que rebote al tocar el borde, hay un bloque específico para eso en la sección de Movimiento.",
        "Para ir a una posición específica, usa los bloques de 'ir a x: y:'.",
        "Si quieres que se mueva hacia el ratón, prueba con 'apuntar hacia puntero del ratón'."
      ],
      sonido: [
        "Para poner sonido, ve a la categoría fucsia de 'Sonido'.",
        "¿Quieres que el sonido termine antes de continuar? Usa 'tocar sonido hasta que termine'.",
        "También puedes grabar tus propios sonidos en la pestaña de 'Sonidos'.",
        "Si quieres cambiar el volumen, usa los bloques de 'cambiar volumen' o 'fijar volumen'.",
        "¿Has probado cambiar el efecto de tono del sonido?"
      ],
      variables: [
        "Las variables son como cajas donde guardas información. Ve a la sección naranja de 'Variables'.",
        "Para empezar a sumar puntos, primero necesitas crear una variable llamada 'Puntos'.",
        "Recuerda fijar tu variable a 0 al inicio del juego (al presionar la bandera verde).",
        "Para aumentar los puntos, usa el bloque 'sumar a [variable] 1'.",
        "Puedes hacer que las variables se muestren o se oculten en la pantalla del juego."
      ],
      eventos: [
        "Todo código en Scratch necesita un evento para empezar. Busca los bloques amarillos de 'Eventos'.",
        "¿Pusiste el bloque 'al presionar bandera verde' para iniciar tu programa?",
        "Puedes usar 'al presionar tecla [espacio]' para hacer que el personaje salte.",
        "Si quieres que los personajes se comuniquen, usa los bloques de 'enviar mensaje' y 'al recibir mensaje'.",
        "También puedes iniciar acciones 'al hacer clic en este objeto'."
      ]
    },
    python: {
      variables: [
        "En Python, puedes crear una variable simplemente escribiendo su nombre y usando el signo '=' para asignarle un valor.",
        "Recuerda que los nombres de las variables no pueden empezar con números ni tener espacios.",
        "¿De qué tipo de dato es tu variable? ¿Un texto (string) o un número (int)?",
        "Puedes cambiar el valor de una variable en cualquier momento de tu programa.",
        "Si guardas un texto en una variable, no olvides usar comillas (simples ' o dobles \")."
      ],
      listas: [
        "Las listas en Python se crean usando corchetes [ ].",
        "Recuerda que el primer elemento de una lista está en la posición 0, no en la 1.",
        "Para añadir un nuevo elemento al final de la lista, usa '.append()'.",
        "Si quieres saber cuántos elementos tiene tu lista, usa la función 'len()'.",
        "Puedes usar un bucle 'for' para recorrer todos los elementos de tu lista."
      ],
      funciones: [
        "Para crear tu propia función en Python, usa la palabra clave 'def'.",
        "No olvides poner dos puntos (:) al final de la línea donde defines la función.",
        "Recuerda que todo el código dentro de la función debe estar indentado (llevar espacios al principio).",
        "Si quieres que tu función devuelva un valor, usa la palabra clave 'return'.",
        "Definir una función no la ejecuta; tienes que 'llamarla' por su nombre para que funcione."
      ],
      condicionales: [
        "Si quieres que el programa tome decisiones, usa 'if', 'elif' y 'else'.",
        "Recuerda usar doble igual '==' cuando quieres comparar si dos cosas son iguales.",
        "No olvides los dos puntos (:) al final de la línea del 'if'.",
        "La indentación es clave en Python para saber qué código va dentro del bloque condicional.",
        "Puedes combinar condiciones usando 'and' y 'or'."
      ]
    }
  },
  errorHelp: [
    "¡Uy! Parece que algo no salió como esperábamos. No te preocupes, el debugging es parte de ser programador.",
    "Un error es solo la forma que tiene la computadora de pedirte que le expliques mejor lo que quieres. ¿Qué estabas intentando hacer?",
    "Vamos a resolver esto juntos. ¿En qué línea dice el programa que está el error?",
    "No te frustres, hasta los mejores programadores cometen errores todos los días. ¿Qué te parece si revisamos el código paso a paso?",
    "¡Tranquilo! Un 'bug' es solo un pequeño acertijo que resolver. ¿Qué mensaje de error te aparece?",
    "A veces ayuda hacer una pausa, respirar y volver a mirar el código con ojos frescos. ¿Lo intentamos?",
    "Los errores son pistas. ¿Qué nos está intentando decir la computadora?",
    "¿Has probado buscar qué significa ese mensaje de error? ¡Es una gran técnica de investigación!",
    "No te rindas. Encontrar y corregir errores es una de las habilidades más importantes en la programación.",
    "Vamos a investigar. Cuéntame, ¿qué debería hacer el código y qué está haciendo en realidad?"
  ],
  debugSteps: [
    "Paso 1: Lee el mensaje de error con cuidado, a veces te dice exactamente qué está mal.",
    "Paso 2: Revisa si te falta algún punto y coma (;), paréntesis () o llaves {}.",
    "Paso 3: Verifica si escribiste bien el nombre de todas las variables y funciones (cuidado con mayúsculas y minúsculas).",
    "Paso 4: Explícale a tu patito de hule (o a mí) línea por línea lo que hace tu código. A veces así encuentras el problema.",
    "Paso 5: Intenta 'comentar' partes de tu código para aislar el problema y ver dónde falla exactamente.",
    "Paso 6: Usa herramientas para imprimir mensajes (como print o Serial.print) y ver qué valores tienen tus variables.",
    "Paso 7: Asegúrate de que las conexiones físicas (si usas Arduino) coincidan con los pines de tu código.",
    "Paso 8: Revisa si las condiciones de tus bucles (for, while) están bien para que no se queden infinitos.",
    "Paso 9: Compara tu código con algún ejemplo que sepas que funciona para ver las diferencias.",
    "Paso 10: Si te sientes atascado, tómate un descanso de 5 minutos. ¡A veces la solución aparece cuando no la buscas!"
  ],
  farewell: [
    "¡Hasta luego! Vuelve cuando quieras seguir programando.",
    "¡Nos vemos pronto! Sigue practicando tus habilidades de código.",
    "¡Adiós! Ha sido genial programar contigo hoy.",
    "¡Hasta la próxima aventura de programación!",
    "¡Chao! Recuerda que la práctica hace al maestro.",
    "¡Nos vemos! Estoy aquí siempre que necesites ayuda con tu código.",
    "¡Hasta pronto! Sigue siendo tan creativo.",
    "¡Que tengas un gran día! No olvides guardar tu proyecto.",
    "¡Adiós, joven desarrollador! Estaré aquí para la próxima.",
    "¡Nos vemos! Sigue explorando y aprendiendo cosas nuevas."
  ]
};
