// Script para crear tarjetas DAFNI KLIX en Trello
// Estrategia de mejora de conversión, comunidad y Shop Performance Score

const TRELLO_API_KEY = 'cbde3fc64bf4f52c6bf13a28b431ce06';
const TRELLO_TOKEN = 'ATTA236f6926324c8495e332bf97d9caf12ea6bd5b49ccb6dd24a659400781cdeefb02C49F43';
const TRELLO_API_BASE = 'https://api.trello.com/1';

const BOARD_NAME = 'Dafni';

const DAFNI_CARDS = [
    // PAULINA - Comunidad y Creators
    {
        name: 'Reunión con Mabel para contexto de comunidad DAFNI',
        desc: `Paulina debe hablar con Mabel para entender el estado actual de la comunidad de creators DAFNI.

Objetivos de la reunión:
- Entender historial de la comunidad
- Qué ha funcionado y qué no
- Quiénes son los creators más activos
- Qué problemas han tenido
- Qué recursos existen actualmente
- Cómo está estructurada la comunicación

Preguntas clave:
- ¿Existe grupo de WhatsApp/Discord?
- ¿Qué tan activa es la comunidad?
- ¿Qué tipo de contenido están creando?
- ¿Qué feedback han dado los creators?
- ¿Qué necesitan para crear mejor contenido?

Entregables:
- Notas de la reunión
- Lista de creators activos
- Identificación de gaps en comunicación
- Recomendaciones iniciales

Responsable: Paulina + Mabel`,
        listName: 'En construcción'
    },
    {
        name: 'Desarrollar estrategia de comunicación para comunidad beauty/hair',
        desc: `Crear plan de comunicación específico para creators de beauty/hair tools.

Basado en investigación de mejores prácticas 2026:

ESTRATEGIA DE CONTENIDO PARA COMUNIDAD:

1. TUTORIALES SON CLAVE:
- Beauty shoppers buscan "how-to" content
- Crear biblioteca de tutoriales de uso de DAFNI
- Diferentes estilos de cabello, técnicas, resultados
- Compartir con creators como inspiración

2. VISUAL STORYTELLING:
- Before/After transformations
- "8-hour wear test" del peinado
- Diferentes condiciones de luz
- Textura real del cabello

3. CONTENIDO SEMANAL PARA GRUPO:

LUNES - Tutorial Spotlight:
- Compartir mejor tutorial de la semana
- Analizar por qué funcionó
- Dar crédito al creator

MIÉRCOLES - Trending Hooks:
- 3-5 hooks que están funcionando en hair content
- Audios trending
- Formatos virales

VIERNES - Creator Showcase:
- Destacar creator de la semana
- Sus mejores prácticas
- Resultados de ventas (si acepta compartir)

4. RECURSOS EDUCATIVOS:
- Guía de "Cómo usar DAFNI correctamente"
- Common mistakes y cómo evitarlos
- Tips para diferentes tipos de cabello
- Troubleshooting guide

5. ENGAGEMENT TACTICS:
- Q&A sessions mensuales
- Challenges temáticos ("Heatless curls week")
- Feedback loops (preguntar qué necesitan)
- Reconocimiento público de buenos resultados

6. TRUST BUILDING:
- Responder TODAS las preguntas
- Ser transparente sobre producto
- Compartir casos de éxito
- Admitir cuando algo no funciona para cierto tipo de cabello

Responsable: Paulina`,
        listName: 'En construcción'
    },
    {
        name: 'Crear recursos visuales y educativos para creators',
        desc: `Desarrollar biblioteca completa de assets para creators de DAFNI.

RECURSOS A CREAR:

1. VIDEO TUTORIALES (profesionales):
- Cómo usar DAFNI paso a paso
- Diferentes técnicas (straight, waves, curls)
- Para diferentes tipos de cabello (fino, grueso, rizado, lacio)
- Duración: 2-3 minutos cada uno
- Formato vertical para TikTok/Reels

2. GUÍAS VISUALES:
- Infografía "Do's and Don'ts"
- Temperatura correcta por tipo de cabello
- Tiempo de uso recomendado
- Cómo evitar daño

3. BEFORE/AFTER TEMPLATES:
- Plantillas editables para Instagram Stories
- Carruseles para feed
- Formato para TikTok

4. PRODUCT SHOTS:
- Hero shots alta resolución
- Lifestyle shots (usando el producto)
- Detail shots (tecnología, cepillo, etc.)
- Packaging shots

5. COPY LIBRARY:
- Claims aprobados sobre el producto
- Beneficios clave
- Diferenciadores vs competencia
- Hashtags recomendados
- Captions templates

6. TRENDING CONTENT UPDATES:
- Documento actualizado semanalmente
- Hooks que funcionan en hair care
- Audios trending
- Formatos virales del momento

7. FAQ DOCUMENT:
- Preguntas más comunes
- Respuestas aprobadas
- Cómo manejar objeciones

FORMATO DE ENTREGA:
- Google Drive o Dropbox compartido
- Organizado por tipo de recurso
- Fácil acceso para todos los creators
- Actualizado regularmente

Responsable: Paulina + Fredo (diseño) + equipo DAFNI (assets)`,
        listName: 'En construcción'
    },
    {
        name: 'Implementar programa de reconocimiento para creators',
        desc: `Crear sistema de reconocimiento y rewards para motivar a la comunidad.

PROGRAMA "DAFNI STARS":

TIER 1 - Rising Star (0-20 ventas):
- Bienvenida al programa
- Acceso a recursos exclusivos
- Comisión base

TIER 2 - Shining Star (21-50 ventas):
- Badge "Shining Star" en comunidad
- +3% comisión extra
- Feature en redes de DAFNI (1 vez)
- Early access a nuevos productos

TIER 3 - Super Star (51+ ventas):
- Badge "Super Star"
- +5% comisión extra
- Feature mensual en redes
- Producto gratis cada trimestre
- Invitación a eventos exclusivos

RECONOCIMIENTOS MENSUALES:

1. Creator del Mes:
- Mejor performance general
- Premio: $100 bonus + feature destacado
- Entrevista en newsletter

2. Best Tutorial:
- Mejor video educativo
- Premio: Producto gratis
- Video compartido en canales oficiales

3. Most Engaging:
- Mayor engagement en contenido
- Premio: $50 bonus
- Shoutout en comunidad

4. Transformation Queen/King:
- Mejor before/after
- Premio: Producto + feature
- Caso de estudio en marketing

INCENTIVOS ESPECIALES:

- First Sale Celebration: Shoutout cuando logran primera venta
- Milestone Rewards: 10, 25, 50, 100 ventas
- Referral Bonus: Traer otro creator al programa
- Consistency Bonus: Postear contenido 4 semanas seguidas

Responsable: Paulina + Oscar (aprobación de budget)`,
        listName: 'En construcción'
    },

    // ANDRÉS - Shop Performance & Conversion
    {
        name: 'Crear análisis financiero para convencer a DAFNI sobre descuentos',
        desc: `Desarrollar caso de negocio sólido para demostrar ROI de estrategia de descuentos.

Situación actual:
- DAFNI se niega rotundamente a hacer descuentos
- Hay buen tráfico pero conversión baja
- Necesitamos datos que los convenzan

ANÁLISIS A DESARROLLAR:

1. BENCHMARKS DE LA INDUSTRIA:
- Conversion rate promedio beauty eCommerce: 2-4%
- Conversion rate actual de DAFNI: [calcular]
- Gap de oportunidad

2. IMPACTO DE DESCUENTOS EN BEAUTY:
Investigación muestra:
- 10% discount: +15-25% en conversion rate
- 15% discount: +30-40% en conversion rate
- 20% discount: +50-60% en conversion rate

3. ESCENARIOS FINANCIEROS:

ESCENARIO BASE (sin descuentos):
- Tráfico mensual: X visitantes
- Conversion rate: Y%
- GMV: $46,226 (actual)
- Margen: Z%

ESCENARIO 1 (10% descuento):
- Mismo tráfico
- Conversion rate: +20%
- GMV proyectado: $55,471
- Margen reducido pero volumen compensa
- Ganancia neta: +X%

ESCENARIO 2 (15% descuento en flash sales):
- Tráfico aumenta por urgencia
- Conversion rate: +35%
- GMV proyectado: $62,405
- Margen: menor pero volumen mayor
- Ganancia neta: +Y%

ESCENARIO 3 (Descuentos estratégicos):
- 10% para nuevos clientes
- 15% en bundles
- 20% en flash sales (24-48h)
- Mix de márgenes optimizado
- GMV proyectado: $65,000+

4. LIFETIME VALUE (LTV):
- Cliente que compra con descuento tiene X% probabilidad de recompra
- LTV de cliente con descuento vs sin descuento
- Costo de adquisición se amortiza

5. COMPETENCIA:
- Qué descuentos ofrecen competidores
- Cómo afecta el posicionamiento
- Riesgo de perder market share

6. RECOMENDACIÓN:
- Estrategia de descuentos escalonada
- No descuentos permanentes (devalúan marca)
- Flash sales estratégicas
- Bundles con descuento
- First-time buyer discount

FORMATO DE PRESENTACIÓN:
- Deck ejecutivo (10-15 slides)
- Datos visualizados claramente
- Proyecciones conservadoras
- Plan de implementación
- Métricas de éxito

Responsable: Andrés + Oscar (análisis financiero)`,
        listName: 'En construcción'
    },
    {
        name: 'Diseñar e implementar inserto con QR code para paquetes',
        desc: `Crear solución para reducir malos reviews por dificultad de uso del producto.

Problema identificado:
- Product Satisfaction: 3.8/5.0 (bajo)
- Customers find product difficult to use
- Malos reviews por user error

SOLUCIÓN: QR CODE EDUCATIONAL INSERT

DISEÑO DEL INSERTO:

1. TAMAÑO Y FORMATO:
- Tarjeta 4x6 pulgadas
- Impresión a color, ambos lados
- Material: Cartulina premium
- Acabado: Mate o brillante

2. LADO FRONTAL:
- Logo DAFNI
- Headline: "¡Gracias por tu compra! Aprende a usar tu DAFNI como pro"
- QR code grande y centrado
- Texto: "Escanea para ver tutorial completo"
- Diseño limpio y atractivo

3. LADO POSTERIOR:
- Quick tips (3-5 bullets)
- "Antes de usar, asegúrate de..."
- Temperatura recomendada
- Tiempo de uso
- Tip de seguridad
- Link corto alternativo (para quien no use QR)

LANDING PAGE DEL QR:

URL: dafnihair.com/tutorial o similar

CONTENIDO:
- Video tutorial principal (2-3 min)
- Paso a paso con timestamps
- Tips por tipo de cabello
- Common mistakes
- FAQ
- Link a más recursos
- Botón para contactar soporte

VIDEOS A INCLUIR:
1. Tutorial básico (todos los tipos de cabello)
2. Tutorial para cabello fino
3. Tutorial para cabello grueso/rizado
4. Troubleshooting (qué hacer si no funciona)
5. Mantenimiento del producto

IMPLEMENTACIÓN:

1. DISEÑO:
- Fredo diseña inserto
- Aprobación de DAFNI
- Ajustes finales

2. LANDING PAGE:
- Crear página dedicada
- Subir videos
- Optimizar para mobile
- Testing de QR code

3. PRODUCCIÓN:
- Cotizar impresión
- Orden inicial (500-1000 piezas)
- Coordinar con fulfillment

4. DISTRIBUCIÓN:
- Incluir en TODOS los paquetes
- Instrucciones claras a equipo de fulfillment
- Verificar que se esté incluyendo

5. MEDICIÓN:
- Trackear escaneos de QR
- Monitorear reviews post-implementación
- Medir reducción en malos reviews

Meta: Reducir negative review rate de 0.58% a <0.40% en 60 días.

Responsable: Andrés + Fredo (diseño) + equipo DAFNI (aprobación)`,
        listName: 'En construcción'
    },
    {
        name: 'Crear SOP para recuperación de malos reviews',
        desc: `Desarrollar proceso sistemático para convertir malos reviews en oportunidades.

Problema:
- Product Satisfaction: 3.8/5.0
- Malos reviews impactan conversión
- Necesitamos recuperar clientes insatisfechos

SOP: BAD REVIEW RECOVERY PROTOCOL

PASO 1 - DETECCIÓN (Diario):
- Revisar nuevos reviews en TikTok Shop Seller Center
- Filtrar reviews de 1-3 estrellas
- Priorizar por severidad y visibilidad

PASO 2 - ANÁLISIS:
- Leer review completo
- Identificar problema específico:
  * User error (no sabía usar el producto)
  * Producto defectuoso
  * Expectativas incorrectas
  * Problema de envío/fulfillment
  * Otro

PASO 3 - BUSCAR ORDEN:
- En TikTok Shop Seller Center
- Buscar por nombre del reviewer
- Encontrar orden específica
- Verificar detalles (producto, fecha, etc.)

PASO 4 - CONTACTO INMEDIATO (<24 horas):

TEMPLATE PARA USER ERROR:
"Hola [Nombre], vimos tu review y lamentamos mucho que hayas tenido dificultades con tu DAFNI. Queremos ayudarte a sacarle el máximo provecho. Te enviamos un video tutorial personalizado para tu tipo de cabello: [link]. También nos gustaría enviarte [regalo/descuento] como disculpa. ¿Podemos ayudarte?"

TEMPLATE PARA PRODUCTO DEFECTUOSO:
"Hola [Nombre], lamentamos muchísimo que tu DAFNI haya llegado con problemas. Esto no es normal y queremos resolverlo inmediatamente. Te enviaremos un reemplazo sin costo + [regalo extra] como disculpa por las molestias. ¿Nos compartes tu dirección actual?"

TEMPLATE PARA EXPECTATIVAS:
"Hola [Nombre], gracias por tu feedback. Entendemos que el resultado no fue el esperado. DAFNI funciona mejor en [tipo de cabello]. ¿Te gustaría que te ayudemos con tips específicos para tu cabello o prefieres un reembolso completo? Queremos que quedes satisfecha."

PASO 5 - ACCIÓN CORRECTIVA:

OPCIONES:
- Enviar producto de reemplazo
- Ofrecer reembolso parcial/completo
- Enviar tutorial personalizado
- Dar descuento para próxima compra
- Enviar producto complementario gratis
- Sesión 1-on-1 de soporte

PASO 6 - SEGUIMIENTO:
- Esperar 3-5 días
- Verificar si usaron el tutorial/producto
- Preguntar si están satisfechos ahora
- Si es apropiado, pedir amablemente:

"Nos alegra mucho que ahora estés disfrutando tu DAFNI. Si consideras que tu experiencia mejoró, ¿te importaría actualizar tu review? No hay presión, solo queremos que refleje tu experiencia completa."

PASO 7 - DOCUMENTACIÓN:
- Registrar en spreadsheet:
  * Fecha del review
  * Problema identificado
  * Acción tomada
  * Costo de la solución
  * Resultado (review cambiado? cliente satisfecho?)
- Analizar patrones mensualmente

MÉTRICAS DE ÉXITO:
- % de malos reviews contactados: 100%
- % de clientes que responden: >50%
- % de reviews mejorados: >30%
- Costo promedio de recuperación: <$X
- ROI del programa

IMPORTANTE:
- Ser genuino, no robótico
- Ofrecer soluciones reales
- No presionar para cambiar review
- Enfocarse en resolver el problema
- Aprender de cada caso

Responsable: Andrés + equipo customer service DAFNI`,
        listName: 'En construcción'
    },
    {
        name: 'Configurar customer service bot y notificaciones',
        desc: `Optimizar sistema de customer service para mejorar score de 3.7 a 4.5+.

Problema actual:
- Customer Service Score: 3.7/5.0
- After-sales handling time: 30.4 hours (target: 29.7h)
- Necesita mejora urgente

CONFIGURACIÓN DEL BOT:

1. ACCEDER A SELLER CENTER:
- Settings > Messaging > Auto-Reply
- Activar chat bot

2. MENSAJES AUTOMÁTICOS:

BIENVENIDA INMEDIATA:
"¡Hola! Gracias por contactar a DAFNI. Estamos aquí para ayudarte con tu producto de styling. ¿En qué podemos asistirte?

Respuestas rápidas:
1️⃣ Cómo usar mi DAFNI
2️⃣ Mi orden/envío
3️⃣ Devoluciones
4️⃣ Producto defectuoso
5️⃣ Otro"

FUERA DE HORARIO:
"Gracias por tu mensaje. Nuestro horario de atención es Lun-Vie 9am-6pm EST. Te responderemos en cuanto estemos disponibles (generalmente <2 horas en horario laboral)."

FAQ AUTOMÁTICAS:

Si selecciona "1️⃣ Cómo usar":
"¡Perfecto! Aquí está nuestro tutorial completo: [link]
¿Tienes algún tipo de cabello específico? También tenemos guías para:
- Cabello fino
- Cabello grueso/rizado
- Cabello dañado"

Si selecciona "2️⃣ Mi orden":
"Para ayudarte con tu orden, ¿podrías compartir tu número de orden? Lo encuentras en el email de confirmación."

Si selecciona "3️⃣ Devoluciones":
"Nuestra política de devolución es 30 días. Proceso:
1. Contáctanos con tu # de orden
2. Te enviamos etiqueta de devolución
3. Reembolso en 5-7 días
¿Cuál es tu # de orden?"

Si selecciona "4️⃣ Producto defectuoso":
"Lamentamos mucho esto. Queremos resolverlo inmediatamente. ¿Podrías enviarnos:
1. # de orden
2. Foto del problema
3. Descripción breve
Te enviaremos reemplazo lo antes posible."

3. NOTIFICACIONES:

CONFIGURAR:
- Push notifications en app (ON)
- Email alerts para equipo (ON)
- SMS alerts para urgentes (ON)
- Sound alerts (ON)

ASIGNAR RESPONSABLES:
- Persona 1: Horario mañana (9am-2pm)
- Persona 2: Horario tarde (2pm-6pm)
- Backup: [nombre]

4. TIEMPOS DE RESPUESTA:

METAS:
- Primera respuesta automática: <30 segundos
- Primera respuesta humana: <2 horas
- Resolución completa: <24 horas
- After-sales handling: <29 horas (target TikTok)

5. TEMPLATES DE RESPUESTA HUMANA:

Crear 15-20 templates para:
- Problemas comunes de uso
- Preguntas sobre ingredientes/materiales
- Issues de envío
- Devoluciones
- Quejas
- Agradecimientos

6. ESCALACIÓN:

Cuándo escalar a Andrés:
- Cliente muy molesto
- Problema técnico complejo
- Solicitud de reembolso >$100
- Amenaza de mal review
- Problema de fulfillment recurrente

7. MONITOREO:

Dashboard semanal:
- # de mensajes recibidos
- Tiempo promedio de respuesta
- Satisfaction score
- Temas más comunes
- Issues sin resolver

8. TRAINING:

- Capacitar al equipo en uso del bot
- Roleplay de situaciones comunes
- Actualizar templates mensualmente
- Revisar casos difíciles en equipo

Meta: Customer Service Score de 3.7 a 4.5+ en 45 días.

Responsable: Andrés + equipo DAFNI customer service`,
        listName: 'En construcción'
    },
    {
        name: 'Mejorar Product Satisfaction Score (3.8 → 4.5+)',
        desc: `Plan integral para aumentar satisfacción del producto.

Situación actual:
- Product Satisfaction: 3.8/5.0 (Top opportunity para mejorar score general)
- Negative review rate: 0.58% (target: 0.53%)
- Non-buyer fault r&r: 1.15% (target: 0.94%)

ESTRATEGIA MULTI-FRENTE:

1. EDUCACIÓN PREVENTIVA:
✅ QR code en paquete (tarea separada)
✅ Tutorial videos
✅ Quick start guide impreso
- Email post-compra con tips
- Serie de emails educativos (día 1, 3, 7, 14)

2. EXPECTATIVAS CORRECTAS:
- Mejorar descripción de producto en listing
- Especificar para qué tipo de cabello funciona mejor
- Mostrar resultados reales (no solo ideales)
- Advertir sobre curva de aprendizaje

3. QUALITY CONTROL:
- Revisar proceso de fulfillment
- Verificar que productos no lleguen dañados
- Mejorar empaque protector
- Spot checks aleatorios

4. PROACTIVE SUPPORT:
- Email automático día 3: "¿Cómo va tu experiencia?"
- Ofrecer ayuda antes de que pidan
- Video call support para casos difíciles
- WhatsApp support para dudas rápidas

5. RECOVERY PROTOCOL:
✅ SOP para malos reviews (tarea separada)
- Contactar clientes insatisfechos
- Resolver problemas rápidamente
- Convertir detractores en promotores

6. INCENTIVOS PARA BUENOS REVIEWS:
- Email post-uso: "¿Te gustó tu DAFNI?"
- Si respuesta positiva: "Nos encantaría que compartas tu experiencia"
- Pequeño incentivo (5-10% descuento próxima compra)
- NO comprar reviews, solo incentivar feedback honesto

7. MONITOREO CONTINUO:
- Review diario de nuevos reviews
- Análisis semanal de patrones
- Identificar problemas recurrentes
- Ajustar producto/proceso según feedback

8. MEJORAS AL PRODUCTO:
- Compilar feedback para equipo de producto
- Sugerir mejoras de diseño
- Considerar versión 2.0 con learnings
- Mejorar manual de usuario

MÉTRICAS A TRACKEAR:

Semanalmente:
- Negative review rate
- Average star rating
- Review sentiment (positivo/negativo/neutral)
- Common complaints

Mensualmente:
- Product Satisfaction Score
- Trend de mejora
- ROI de iniciativas
- Customer feedback themes

TIMELINE:

Semana 1-2: Implementar educación preventiva
Semana 3-4: Activar recovery protocol
Semana 5-6: Optimizar based on data
Semana 7-8: Escalar lo que funciona

Meta: Product Satisfaction de 3.8 a 4.5+ en 60 días.

Responsable: Andrés + equipo DAFNI`,
        listName: 'En construcción'
    },

    // RECOMENDACIONES ESTRATÉGICAS
    {
        name: '💡 RECOMENDACIÓN: Activar TikTok LIVEs para demos de producto',
        desc: `OPORTUNIDAD: LIVE está prácticamente sin usar ($20 de $46K = 0.04%).

Por qué LIVEs son PERFECTOS para DAFNI:

1. PRODUCTO VISUAL:
- Hair styling es inherentemente visual
- Necesita demostración en tiempo real
- Before/After en vivo es poderoso
- Resuelve dudas sobre "¿realmente funciona?"

2. EDUCACIÓN EN VIVO:
- Mostrar cómo usar correctamente
- Responder preguntas en tiempo real
- Diferentes técnicas para diferentes cabellos
- Troubleshooting en vivo

3. FORMATOS SUGERIDOS:

"TRANSFORMATION LIVE":
- Host con cabello sin peinar
- Usa DAFNI en vivo
- Muestra proceso completo
- Resultado final
- Q&A
- Oferta especial solo durante LIVE

"TUTORIAL TUESDAY":
- Cada semana diferente técnica
- Invitar guest con tipo de cabello específico
- Demostración paso a paso
- Tips and tricks
- Descuento para viewers

"ASK ME ANYTHING":
- Experto en hair styling
- Responde todas las preguntas sobre DAFNI
- Demos según lo que pregunten
- Casos de uso específicos

4. COLABORACIONES:
- Invitar a creators del programa
- Co-host LIVEs
- Mostrar sus técnicas
- Cross-promotion

5. TIMING ESTRATÉGICO:
- Mañanas (getting ready routine)
- Tardes (after work)
- Fines de semana (más tiempo)

6. PROMOCIÓN:
- Anunciar LIVEs en comunidad
- Posts previos
- Recordatorios
- Incentivos para asistir (sorteos)

7. CONVERSIÓN:
- Ofertas exclusivas durante LIVE
- Countdown timers
- Limited quantity deals
- Bundle offers

Meta: Generar 5-10% del GMV desde LIVEs en 60 días ($2,300-$4,600).

Responsable: Andrés (coordinar) + creators (hosts)`,
        listName: 'En construcción'
    },
    {
        name: '💡 RECOMENDACIÓN: Programa de embajadores de marca',
        desc: `Crear tier élite de creators que se conviertan en embajadores oficiales de DAFNI.

CONCEPTO: DAFNI AMBASSADORS

Por qué funciona en beauty:
- Creators de beauty son altamente influyentes
- Relaciones a largo plazo > transacciones únicas
- Embajadores generan contenido consistente
- Autenticidad y trust son clave

ESTRUCTURA DEL PROGRAMA:

CRITERIOS DE SELECCIÓN:
- Mínimo 50 ventas generadas
- Engagement rate >3%
- Contenido de calidad consistente
- Alineación con valores de marca
- Audiencia relevante (beauty/hair)

BENEFICIOS PARA EMBAJADORES:

1. COMPENSACIÓN:
- Retainer mensual ($200-500)
- Comisión premium (20-25%)
- Bonos por performance

2. PRODUCTOS:
- Producto gratis ilimitado
- Early access a nuevos lanzamientos
- Productos exclusivos para embajadores

3. EXPOSICIÓN:
- Feature permanente en website
- Highlight en redes sociales
- Invitaciones a eventos
- Press opportunities

4. SOPORTE:
- Account manager dedicado
- Contenido personalizado
- Sesiones de estrategia 1-on-1
- Acceso directo a equipo DAFNI

EXPECTATIVAS:

CONTENIDO:
- Mínimo 4 posts/mes sobre DAFNI
- 1 tutorial detallado/mes
- Participar en 2 LIVEs/mes
- Stories regulares

ENGAGEMENT:
- Responder comentarios sobre DAFNI
- Compartir tips con su audiencia
- Ser voice of the brand
- Feedback honesto sobre producto

EXCLUSIVIDAD:
- No promocionar competidores directos
- 6-12 meses de compromiso
- Renovación anual

SELECCIÓN INICIAL:
- Identificar top 5-10 creators actuales
- Invitación personalizada
- Onboarding especial
- Kick-off event (virtual o presencial)

MEDICIÓN:

Por embajador:
- GMV generado
- Engagement de su contenido
- Nuevos customers atraídos
- Brand sentiment

Programa general:
- ROI del programa
- Brand awareness
- Content quality
- Community growth

TIMELINE:
- Mes 1: Identificar y reclutar
- Mes 2: Onboarding y training
- Mes 3-6: Ejecución y optimización
- Mes 6: Evaluación y renovación

Inversión estimada: $2,000-5,000/mes
ROI esperado: 3-5x

Responsable: Paulina + Oscar (aprobación)`,
        listName: 'En construcción'
    },
    {
        name: '💡 RECOMENDACIÓN: A/B testing de listings para mejorar conversión',
        desc: `Implementar testing sistemático para optimizar conversión de product listings.

Problema:
- Buen tráfico pero conversión baja
- Ya están trabajando en mejorar listings
- Necesitan enfoque data-driven

FRAMEWORK DE A/B TESTING:

TEST 1 - IMÁGENES PRINCIPALES:

Variante A (actual):
- Product shot en fondo blanco
- Ángulo estándar

Variante B:
- Before/After como imagen principal
- Resultado dramático
- Texto overlay: "2 minutos para cabello perfecto"

Métrica: Click-through rate, Add to cart rate

TEST 2 - TÍTULO DEL PRODUCTO:

Variante A (actual):
- Descriptivo técnico
- "DAFNI Hair Straightening Brush"

Variante B:
- Benefit-focused
- "DAFNI - Cabello Lacio Perfecto en 2 Minutos"

Variante C:
- Social proof
- "DAFNI - El Cepillo #1 en TikTok para Cabello Lacio"

Métrica: Conversion rate

TEST 3 - PRECIO Y OFERTAS:

Variante A:
- Precio regular sin descuento

Variante B:
- 10% descuento con timer
- "Oferta termina en 24h"

Variante C:
- Bundle deal
- "Compra 2, ahorra 15%"

Métrica: Purchase rate, AOV

TEST 4 - DESCRIPCIÓN:

Variante A:
- Descripción técnica
- Features del producto

Variante B:
- Benefits-focused
- "Imagina tener cabello de salón todos los días"
- Bullets de beneficios

Variante C:
- Social proof heavy
- "Más de 10,000 clientes satisfechas"
- Testimoniales destacados

Métrica: Time on page, Conversion rate

TEST 5 - VIDEOS:

Variante A:
- Video de producto branded

Variante B:
- UGC video de creator
- Testimonial auténtico

Variante C:
- Tutorial completo
- Paso a paso de uso

Métrica: Video completion rate, Conversion rate

METODOLOGÍA:

1. PRIORIZACIÓN:
- Empezar con tests de mayor impacto potencial
- Un test a la vez para aislar variables
- Duración mínima: 7-14 días por test

2. TAMAÑO DE MUESTRA:
- Mínimo 1,000 visitantes por variante
- Significancia estadística >95%
- Usar herramientas de TikTok Shop si disponibles

3. IMPLEMENTACIÓN:
- Documentar hipótesis antes de test
- Screenshot de ambas variantes
- Tracking preciso de métricas

4. ANÁLISIS:
- Comparar métricas clave
- Identificar ganador
- Implementar permanentemente
- Documentar learnings

5. ITERACIÓN:
- Usar ganador como nuevo baseline
- Crear nueva variante para probar
- Mejora continua

HERRAMIENTAS:

- TikTok Shop Analytics
- Google Sheets para tracking
- Screenshots para documentación
- Heatmaps si es posible (Hotjar, etc.)

TIMELINE:

Semana 1-2: Test de imágenes
Semana 3-4: Test de título
Semana 5-6: Test de precio
Semana 7-8: Test de descripción
Semana 9-10: Test de videos

Meta: Aumentar conversion rate 20-30% en 10 semanas.

Responsable: Andrés + equipo DAFNI`,
        listName: 'En construcción'
    },
    {
        name: '💡 RECOMENDACIÓN: Programa de referidos para customers',
        desc: `Convertir customers satisfechos en canal de adquisición.

Por qué funciona en beauty:
- Recomendaciones personales son poderosas
- Beauty es social por naturaleza
- Word-of-mouth tiene alto trust
- Customers felices quieren compartir

PROGRAMA "SHARE THE LOVE":

MECÁNICA:

Para el REFERRER (quien refiere):
- Comparte link único
- Amiga compra usando el link
- Referrer recibe $10 crédito
- Crédito acumulable, sin límite

Para el REFEREE (nueva cliente):
- Recibe 15% descuento en primera compra
- Usa link de amiga
- Descuento aplicado automáticamente

IMPLEMENTACIÓN EN TIKTOK SHOP:

1. POST-PURCHASE EMAIL:
Día 7 después de compra:
"¿Amando tu DAFNI? ¡Comparte el amor!
Invita a tus amigas y ambas ganan:
- Tú: $10 crédito por cada amiga
- Ellas: 15% descuento
Tu link único: [link]"

2. IN-PACKAGE INSERT:
- Tarjeta con QR code
- "Comparte con tus amigas"
- Instrucciones simples
- Beneficios claros

3. SOCIAL SHARING:
- Botones para compartir en TikTok, Instagram
- Template pre-escrito
- Fácil de usar

INCENTIVOS ADICIONALES:

TIERS:
- 1 referido: $10 crédito
- 3 referidos: $35 crédito + producto gratis
- 5 referidos: $60 crédito + upgrade a VIP
- 10 referidos: $150 crédito + embajadora oficial

BONOS ESPECIALES:
- Mes con más referidos: $100 bonus
- Primera en referir 10: Producto lifetime gratis
- Referidos que compran >$100: Bonus doble

TRACKING:

Dashboard para customers:
- Cuántas amigas han usado su link
- Cuánto crédito han ganado
- Próximo tier
- Cómo usar su crédito

Analytics para DAFNI:
- # de referidos totales
- Conversion rate de referidos
- CAC de canal de referidos vs otros
- LTV de customers referidos
- Top referrers

PROMOCIÓN DEL PROGRAMA:

- Email a customer base existente
- Anuncio en TikTok
- Stories de Instagram
- In-app notification
- Creators promocionando

TÉRMINOS:

- Crédito válido por 12 meses
- Mínimo $50 de compra para usar crédito
- No cash value
- Referidos deben ser nuevos customers
- Límite razonable anti-abuse

PROYECCIÓN:

Si 10% de customers refieren 2 amigas c/u:
- 1,533 customers actuales
- 153 referrers activos
- 306 nuevos customers
- CAC: ~$10 (vs $30-50 en ads)
- ROI: 3-5x

Meta: 200+ nuevos customers via referidos en 90 días.

Responsable: Andrés + equipo DAFNI (implementación técnica)`,
        listName: 'En construcción'
    }
];

async function addCardsToDafniBoard() {
    try {
        console.log('===============================================');
        console.log('DAFNI KLIX - Agregando tareas al board');
        console.log('===============================================\n');

        // 1. Buscar el board DAFNI KLIX
        console.log('Buscando board DAFNI KLIX...\n');
        const boardsResponse = await fetch(
            `${TRELLO_API_BASE}/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const boards = await boardsResponse.json();
        const dafniBoard = boards.find(b => b.name === BOARD_NAME && !b.closed);

        if (!dafniBoard) {
            console.log(`Board "${BOARD_NAME}" no encontrado.\n`);
            console.log('Por favor verifica el nombre exacto del board en Trello.');
            return;
        }

        console.log(`Board encontrado: ${BOARD_NAME} (${dafniBoard.id})\n`);

        // 2. Obtener listas del board
        const listsResponse = await fetch(
            `${TRELLO_API_BASE}/boards/${dafniBoard.id}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const lists = await listsResponse.json();

        let targetList = lists.find(l => l.name === 'En construcción');

        if (!targetList) {
            console.log('Lista "En construcción" no encontrada, creándola...\n');
            const createListResponse = await fetch(
                `${TRELLO_API_BASE}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'En construcción',
                        idBoard: dafniBoard.id,
                        pos: 'top'
                    })
                }
            );
            targetList = await createListResponse.json();
        }

        console.log(`Lista "En construcción" lista: ${targetList.id}\n`);

        // 3. Crear tarjetas
        console.log('Creando tarjetas de DAFNI KLIX...\n');

        let created = 0;
        for (const cardData of DAFNI_CARDS) {
            const cardResponse = await fetch(
                `${TRELLO_API_BASE}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: cardData.name,
                        desc: cardData.desc,
                        idList: targetList.id,
                        pos: 'bottom'
                    })
                }
            );

            if (cardResponse.ok) {
                console.log(`  Creada: ${cardData.name}`);
                created++;
            } else {
                const error = await cardResponse.text();
                console.log(`  Error: ${cardData.name} - ${error}`);
            }

            await new Promise(resolve => setTimeout(resolve, 150));
        }

        console.log(`\n${created} tarjetas creadas exitosamente!\n`);

        console.log('===============================================');
        console.log('PROCESO COMPLETADO');
        console.log('===============================================');
        console.log(`\nBoard: ${BOARD_NAME}`);
        console.log(`URL: ${dafniBoard.url || dafniBoard.shortUrl}`);
        console.log(`Tarjetas creadas: ${DAFNI_CARDS.length}`);
        console.log(`\nTodas las tareas están en "En construcción" para revisión!\n`);

    } catch (error) {
        console.error('\nERROR:', error.message);
    }
}

addCardsToDafniBoard();
