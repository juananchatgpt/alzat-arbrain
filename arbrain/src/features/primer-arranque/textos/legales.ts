/**
 * Textos legales del primer arranque de Alzat: aviso de privacidad, términos de uso y licencia.
 *
 * Alzat (12 nov 2026): versión de ALZAT para España. Sustituye a los de Arbrain (redactados para México con Daniel
 * Carreón como responsable): RGPD y LOPDGDD, ALZAT como responsable con los datos públicos de alzat.es (aviso legal y
 * privacidad), la conexión con arbrain.ai descrita como servicio de un tercero y la licencia con los dos autores.
 * Al cambiar una palabra, sube VERSION_TEXTOS: la app volverá a pedir la aceptación (la prueba de la huella lo exige).
 *
 * Formato: párrafos separados por línea en blanco; una línea que empieza con «## » es un subtítulo y «- » una viñeta.
 */

export const VERSION_TEXTOS = '2026-11-12-alzat'
export const AVISO_VERSION = 'Versión del 12 de noviembre de 2026. Si cambian, Alzat te los vuelve a pedir.'

/** El responsable (RGPD art. 13.1.a y LSSI art. 10): los mismos datos que publica alzat.es. Cambiarlos sube VERSION_TEXTOS. */
export const RESPONSABLE = {
  nombre: 'Juanan Sánchez Lerma',
  marca: 'ALZAT',
  nif: '20252772F',
  domicilio: 'C/ Ronda, 28, Pelahustán (Toledo), España',
  correo: 'info@alzat.es',
}

/** El autor de Arbrain, la base de Alzat (licencia Apache-2.0). */
export const AUTOR_BASE = 'Jorge Daniel Carreón Guzmán'

const CANAL = RESPONSABLE.correo
const CONTACTO = `escribiendo a ${CANAL}`
const ESCRIBENOS = `escribe a ${CANAL}`

export interface DocumentoLegal { id: 'privacidad' | 'terminos' | 'licencia'; titulo: string; resumen: string; cuerpo: string }

export const PRIVACIDAD: DocumentoLegal = {
  id: 'privacidad',
  titulo: 'Aviso de privacidad',
  resumen: 'Tu cerebro vive en tu computadora. A ALZAT no le llega nada de él.',
  cuerpo: `## Quién es responsable
${RESPONSABLE.nombre} (marca «${RESPONSABLE.marca}»), NIF ${RESPONSABLE.nif}, con domicilio en ${RESPONSABLE.domicilio} y correo ${RESPONSABLE.correo} («nosotros»), es el responsable de este aviso, conforme al Reglamento General de Protección de Datos (RGPD) y a la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).

Este aviso cubre la app Alzat, la versión de ALZAT de Arbrain (software de código abierto de ${AUTOR_BASE}). Los servicios que contrates con ALZAT (Radiografía, instalación, formación y mejora) se rigen por su contrato y por la política de privacidad de alzat.es.

## Lo que se queda contigo
Alzat corre en tu computadora o en el servidor que tú contrates. Tus conversaciones, tu memoria, tus archivos, tus lienzos, tu configuración, el registro de lo que hizo tu asistente y tu aceptación del modo autónomo se guardan ahí. Nosotros no los recibimos ni tenemos acceso a ellos.

Tus llaves de acceso a modelos de IA (Anthropic, OpenRouter u otras) se guardan en el llavero de tu sistema operativo y solo se usan para hablar con esos proveedores en tu nombre.

## Lo que tú mandas a otros proveedores
Cuando hablas con tu asistente, el texto de cada turno y lo que lee para responderte viajan al proveedor del modelo que elegiste, con tu propia llave y bajo los términos de ese proveedor. Esos proveedores pueden estar fuera del Espacio Económico Europeo (por ejemplo, en Estados Unidos): revisa sus garantías antes de usarlos con datos personales. Si enciendes computer use (macOS y Windows), también viajan las capturas de tu pantalla que tu asistente necesita: lo que esté a la vista puede ir en ellas.

Lo mismo con los servicios tuyos que conectes (tu correo, tu calendario, tu servidor, tu repositorio de respaldo): la información viaja a esas cuentas, bajo sus términos. Ese envío lo haces tú con tus cuentas; nosotros no lo vemos ni lo recibimos.

## Datos de tus clientes y de otras personas
Si guardas en tu cerebro datos de tus clientes, de tu equipo o de otras personas, el responsable de esos datos eres tú (o tu empresa): cumple el RGPD y la LOPDGDD e infórmales de cómo los usas. Alzat no nos los envía. Si ALZAT te presta un servicio en el que tiene que acceder a ellos, antes firmamos contigo un contrato de encargado del tratamiento (artículo 28 del RGPD).

No metas en tu cerebro datos de categorías especiales (salud, ideología, religión, vida sexual, origen étnico, datos biométricos) de otras personas sin una base legal clara, y valora el riesgo antes de mandarlos a un modelo en la nube.

## Lo que nos llega
Nada. Alzat no envía a ALZAT tus conversaciones, tu memoria, tus archivos ni datos de uso. Solo tratamos datos tuyos si nos escribes (para soporte o para ejercer tus derechos): lo que nos mandes, para responderte, con base en la relación que nos pides o en una obligación legal (artículo 6.1.b y 6.1.c del RGPD), y solo el tiempo necesario para atenderte y los plazos legales.

## La conexión con arbrain.ai (de un tercero, apagada por defecto)
Alzat conserva una función de Arbrain para quien está en el programa de ${AUTOR_BASE}: si pegas en Ajustes › Privacidad el código de una cuenta de arbrain.ai, la app envía a arbrain.ai una vez al día (y cuando pulsas «Enviar ahora») una señal de avance ligada a esa cuenta:
- la versión instalada;
- si tienes meta del mes, de la semana y del día (el texto, solo si marcas compartirlo);
- cuántos hábitos activos tienes y cuántos días los cumpliste en los últimos 7 (sus nombres, solo si marcas compartirlos);
- cuántas conversaciones tuviste en 7 días y cuántos eventos tiene tu calendario (solo números);
- cuántas ofertas, conversaciones de venta y cierres anotaste tú (solo números).
Además trae de arbrain.ai tu expediente y tu camino del programa. Esos datos los recibe y los trata arbrain.ai, bajo su propio aviso de privacidad; ALZAT no los recibe. Si no estás en ese programa, no la actives: Alzat funciona completo sin ella, y desconectarla detiene los envíos al instante.

Nunca sale por ella el texto de tus conversaciones, tu memoria, tus archivos ni datos de tus clientes o de otras personas.

## Decisiones automatizadas
No tomamos decisiones automatizadas con efectos jurídicos sobre ti ni elaboramos perfiles. Lo que hace tu asistente lo decides y lo revisas tú.

## Tus derechos
Puedes ejercer, de forma gratuita, tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar el consentimiento que hayas dado, ${CONTACTO} con el asunto «Protección de datos». Te respondemos en el plazo de un mes. Si consideras que no hemos atendido bien tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).

## Seguridad
Lo que guardas en tu cerebro queda protegido por la seguridad de tu computadora o de tu servidor: mantenlos actualizados, con contraseña y con copia de seguridad. Lo que nos escribas lo guardamos con medidas técnicas y organizativas razonables.

## Cambios a este aviso
Si cambia, Alzat te muestra la versión nueva y te pide aceptarla antes de seguir. La versión que aceptaste está siempre en Ajustes › Privacidad.`,
}

export const TERMINOS: DocumentoLegal = {
  id: 'terminos',
  titulo: 'Términos de uso',
  resumen: 'Tú controlas a tus agentes y eres responsable de lo que autorizas.',
  cuerpo: `## Quién te da Alzat
Alzat es software de código abierto que publica ${RESPONSABLE.nombre} (marca «${RESPONSABLE.marca}», NIF ${RESPONSABLE.nif}) («nosotros»), basado en Arbrain, de ${AUTOR_BASE}, bajo la licencia Apache-2.0. Estos términos regulan el uso de la app. Los servicios de ALZAT (Radiografía, instalación, formación y mejora) tienen su propio contrato; en lo que ese contrato regule, manda el contrato.

## Quién puede usarlo
Debes ser mayor de edad y poder obligarte legalmente. Si usas Alzat para una empresa, aceptas estos términos también en su nombre.

## El servicio
Alzat es software que se instala y corre en tu computadora o en tu servidor. Te permite trabajar con agentes de IA («tu asistente») que leen y escriben en la carpeta de tu cerebro, trabajan contigo en el chat y, si tú lo enciendes en macOS o Windows, operan tu computadora.

## Tus llaves y tus costos
Usas tus propias llaves (Anthropic, OpenRouter u otras). Eres responsable de su costo, de guardarlas y de cumplir los términos de cada proveedor. Si usas una suscripción personal en lugar de una llave de API, revisa que los términos de ese proveedor lo permitan.

## Agentes y computer use
Los agentes actúan en tu computadora. Tú eliges cuánto te preguntan antes de actuar: «Preguntar siempre», «Automático en mi carpeta» (te pide confirmar con un clic antes de enviar, pagar, borrar o publicar y antes de lo que sale de tu computadora) o «Autónomo», que actúa sin pedirte un clic en cada paso y que aceptas aparte, con su propio texto, sus dos casillas y un registro que puedes retirar. En cualquier nivel, Alzat no mueve dinero ni entra a tu banco, no toca tus llaves ni contraseñas y no borra en masa. Tú decides qué autorizas y eres responsable de ello.

Computer use (que un agente mire tu pantalla, haga clic y escriba en tus apps) existe en macOS y Windows, no en Linux. Viene apagado y se apaga cada vez que cierras la app (en «Autónomo» queda como lo dejaste); solo tú lo enciendes, desde la app. Mientras está encendido, el agente toma capturas de tu pantalla que se envían al proveedor del modelo que elegiste. No lo uses con tu banco, pagos, impuestos ni cripto: Alzat bloquea esos sitios, pero ningún bloqueo es perfecto.

## Datos de otras personas
Si con Alzat tratas datos de tus clientes o de otras personas, tú eres su responsable: cumple el RGPD y la LOPDGDD y avísales de cómo los usas.

## Usos prohibidos
No uses Alzat para enviar spam, suplantar a otras personas, extraer datos contra los términos de terceros, acceder sin autorización a sistemas o cuentas, vigilar a otras personas ni para nada ilegal.

## Sin garantía
Alzat se entrega gratis y «tal cual», sin garantía de resultados ni de que funcione sin errores, como dice su licencia Apache-2.0, salvo lo que diga tu contrato de servicios con ALZAT. Respalda tu información importante.

## Limitación de responsabilidad
En la medida que la ley aplicable lo permita, no respondemos por daños indirectos, pérdida de datos, de ingresos o de ganancias, ni por las consecuencias de lo que tus agentes hacen a partir de tus pedidos. Nada de esto limita nuestra responsabilidad por dolo o culpa grave, ni los derechos que la ley te da y que no se pueden renunciar, incluidos los del Texto Refundido de la Ley General para la Defensa de los Consumidores y Usuarios si eres consumidor.

## Servicios de terceros
La conexión con arbrain.ai y los modelos de IA son servicios de terceros, con sus propios términos. Usarlos es opcional y no afecta a tu licencia de uso.

## Cambios a estos términos
Si cambian, Alzat te muestra la versión nueva y te pide aceptarla antes de seguir. Nada cambia para ti sin tu aceptación.

## Ley aplicable y contacto
Estos términos se rigen por la ley española. Si eres consumidor, conservas los derechos que te da la normativa de consumo y puedes acudir a los juzgados de tu domicilio; si vives en otro país, conservas además los que las leyes de tu país no permiten renunciar. Cualquier otra controversia se resolverá ante los juzgados y tribunales competentes conforme a la ley.

Dudas y aclaraciones: ${ESCRIBENOS}. Para reportar una falla de seguridad, ${ESCRIBENOS} con el asunto «Seguridad»: no la publiques hasta que la hayamos corregido.`,
}

export const LICENCIA: DocumentoLegal = {
  id: 'licencia',
  titulo: 'Licencia',
  resumen: 'Código abierto bajo Apache-2.0: úsalo, modifícalo y compártelo. Las marcas no van incluidas.',
  cuerpo: `## Lo que recibes
Alzat es software de código abierto bajo la licencia Apache License 2.0 (el archivo LICENSE que viaja con la app). Se basa en Arbrain, de ${AUTOR_BASE}; las modificaciones de ALZAT son de ${RESPONSABLE.nombre}, y las dos partes se distribuyen bajo esa misma licencia. Recibes el código y el derecho a usarlo, copiarlo, modificarlo y distribuirlo, también con fines comerciales, en los términos de esa licencia. Los componentes de terceros que incluye conservan sus propias licencias (archivo NOTICE).

## Lo que puedes hacer
- Usar Alzat en tus computadoras y servidores para tu propio trabajo y el de tu negocio.
- Modificarlo, adaptarlo y redistribuirlo, con o sin cambios, siempre que entregues una copia de la licencia, conserves los avisos de copyright, de licencia y el archivo NOTICE, y señales en los archivos que cambiaste que los cambiaste.

## Lo que la licencia no incluye
- Las marcas ALZAT y Alzat, Arbrain y Levy, y sus logotipos, no se licencian: no presentes una copia modificada como si fuera Alzat o Arbrain ni uses esas marcas para tu producto sin permiso. Sí puedes decir, de buena fe, que tu trabajo se basa en Alzat o en Arbrain.
- Los servicios de ALZAT (Radiografía, instalación, formación y mejora) tienen su propio contrato; la licencia del código no los cubre.

## Marca
ALZAT, Alzat y su logotipo son signos distintivos de ${RESPONSABLE.nombre}. Arbrain, Levy y sus logotipos son signos distintivos de ${AUTOR_BASE}.

## Sin garantía
Como dice la Apache-2.0 (secciones 7 y 8), el software se entrega «tal cual», sin garantías, y quienes lo escriben no responden por daños derivados de su uso, salvo lo que la ley aplicable no permita excluir. Lo que guardaste en tu computadora es tuyo.`,
}

export const DOCUMENTOS_LEGALES: readonly DocumentoLegal[] = [PRIVACIDAD, TERMINOS, LICENCIA]
