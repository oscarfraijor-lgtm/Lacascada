// Script para crear tarjetas GR FUEL en Trello
// Reactivación de programa de afiliados y crecimiento TikTok Shop

const TRELLO_API_KEY = 'cbde3fc64bf4f52c6bf13a28b431ce06';
const TRELLO_TOKEN = 'ATTA236f6926324c8495e332bf97d9caf12ea6bd5b49ccb6dd24a659400781cdeefb02C49F43';
const TRELLO_API_BASE = 'https://api.trello.com/1';

const BOARD_NAME = 'GR FUEL';

const GRFUEL_CARDS = [
    // CRÍTICO - Shop Performance Score
    {
        name: '🚨 URGENTE: Activar Shop Performance Score (NOT RATED)',
        desc: `PRIORIDAD MÁXIMA - La tienda NO tiene rating de performance. Esto limita visibilidad y puede resultar en penalizaciones.

Situación actual: "Not rated / 5.0"

Acciones inmediatas:
- Revisar qué falta para obtener rating inicial
- Verificar que fulfillment esté configurado correctamente
- Asegurar que customer service esté respondiendo
- Completar mínimo de órdenes necesarias para rating
- Monitorear métricas diariamente

Dimensiones del score:
- Product satisfaction
- Fulfillment and logistics
- Customer service

Meta: Obtener rating inicial de 4.5+ en los próximos 14 días.

Por qué es crítico: Sin rating, TikTok limita la exposición de la tienda. No podemos crecer sin un score saludable.

Responsable: Andrés`,
        listName: 'En construcción'
    },

    // PAULINA - Reactivación de Afiliados
    {
        name: 'Reactivar 154 creators del programa anterior',
        desc: `Contactar a los 154 creators filtrados del programa anterior (800-900 originales).

Contexto:
- GR FUEL (ex GYM RAT FUEL) tuvo programa de afiliados hace ~1 año
- Enviaron 800-900 muestras pero NUNCA hicieron follow-up
- Programa abandonado sin nurturing
- Ahora tenemos lista curada de 154 mejores creators

Plan de reactivación:

1. CREAR RECURSO VISUAL:
- Diseño atractivo anunciando "Estamos de vuelta en TikTok"
- Mensaje: Nueva etapa, nuevo compromiso con la comunidad
- Incluir beneficios del nuevo programa
- CTA claro para reconectar

2. MENSAJE DE OUTREACH:
"Hey [nombre]! Hace un tiempo te enviamos producto de GYM RAT FUEL (ahora GR FUEL). Estamos de vuelta en TikTok con un programa completamente renovado y queremos reconectar contigo. ¿Te interesaría ser parte de nuestra nueva comunidad de creators? [Link al recurso visual]"

3. SEGMENTACIÓN:
- Prioridad 1: Creators que SÍ postearon contenido antes
- Prioridad 2: Creators con buen engagement
- Prioridad 3: Resto de la lista

4. SEGUIMIENTO:
- Trackear respuestas
- Identificar quiénes están interesados
- Ofrecer producto nuevamente a los que respondan

Meta: Reactivar al menos 30-40 creators (20-25% de la lista) en 30 días.

Responsable: Paulina`,
        listName: 'En construcción'
    },
    {
        name: 'Crear comunidad de creators GR FUEL (WhatsApp/Discord)',
        desc: `Construir comunidad exclusiva para creators de GR FUEL - LO QUE FALTÓ LA PRIMERA VEZ.

Por qué falló antes: No hubo nurturing, no hubo comunidad, no hubo seguimiento.

Setup de comunidad:

PLATAFORMA:
- WhatsApp Business para grupo íntimo (top performers)
- Discord para comunidad más amplia (opcional)

ESTRUCTURA DEL GRUPO:
- Bienvenida y reglas claras
- Paulina como community manager principal
- Involucrar al dueño de GR FUEL ocasionalmente

CONTENIDO SEMANAL:
- Trending hooks en fitness/supplements
- Bestsellers y qué está convirtiendo
- Tips de contenido específicos para fitness
- Creator de la semana
- Retos y challenges

ONBOARDING:
- Mensaje de bienvenida personalizado
- Explicar programa de incentivos
- Compartir briefs de producto
- Dar acceso a recursos (fotos, videos, claims)

A QUIÉN INVITAR:
- Los 154 creators que respondan positivamente
- Nuevos creators que se unan al programa
- Gradualmente construir comunidad activa

Meta: Grupo activo de 50+ creators en 60 días.

Responsable: Paulina`,
        listName: 'En construcción'
    },
    {
        name: 'Diseñar programa de incentivos para creators fitness',
        desc: `Crear estructura de incentivos atractiva para nicho fitness/gym.

TIER SYSTEM (Comisiones en TikTok Shop):

TIER 1 - Starter (0-30 ventas):
- Comisión base actual
- Acceso a grupo de WhatsApp

TIER 2 - Performer (31-100 ventas):
- +3-5% comisión extra
- Badge "Performer"
- Early access a nuevos productos

TIER 3 - Elite (101+ ventas):
- +5-8% comisión extra
- Badge "Elite"
- Gym membership mensual (idea del dueño)
- Feature en redes de GR FUEL

INCENTIVOS EXTRA (fuera de TikTok):

1. GYM MEMBERSHIPS (idea del dueño):
- Top 3 creators mensuales: Membresía de gym gratis
- Valor: $50-100/mes
- Partner con cadenas de gyms locales

2. SUPPLEMENT STACK:
- Top 5 creators: Stack completo de GR FUEL gratis
- Valor: $150-200

3. MILESTONE REWARDS:
- Primera venta: Shoutout en redes
- 10 ventas: Producto gratis
- 50 ventas: Gym membership por 3 meses
- 100 ventas: Gym membership por 6 meses + supplement stack

4. RETOS MENSUALES:
- "Transformation Challenge": Mejor transformación del mes
- "Content King/Queen": Mejor video del mes
- "Sales Champion": Más ventas del mes
- Premios: Gym memberships, productos, cash bonuses

5. PARTNER DISCOUNTS:
- Descuentos en marcas fitness aliadas
- Apparel, equipment, wellness services

6. EXCLUSIVE EVENTS:
- Invitaciones a eventos de GR FUEL
- Meet & greets con atletas patrocinados
- Workshops de fitness/nutrición

Siguiente paso: Validar con Oscar/dueño de GR FUEL y activar.

Responsable: Paulina + Oscar`,
        listName: 'En construcción'
    },
    {
        name: 'Crear briefs de producto para creators fitness',
        desc: `Desarrollar briefs creativos para productos GR FUEL adaptados al nicho fitness.

Framework "Creative Sandbox" para fitness:

MUST-HAVES (Guardrails):
- Mostrar el producto claramente
- Mencionar beneficios clave (energía, recovery, performance)
- Claims aprobados sobre ingredientes
- CTA: Link a TikTok Shop
- Disclaimer si es necesario (consultar con legal)

NO'S:
- No hacer claims médicos no aprobados
- No mencionar competidores directamente
- No usar antes/después engañosos
- No prometer resultados no realistas

LIBERTAD DEL CREATOR:
- Música y audio (trending en fitness)
- Estilo: gym workout, morning routine, supplement stack tour
- Narrativa personal (su journey fitness)
- Humor y personalidad

HOOKS ESPECÍFICOS PARA FITNESS:
- "POV: Tu pre-workout favorito..."
- "Cosas que cambié en mi rutina..."
- "Mi supplement stack explicado..."
- "Probé [producto] por 30 días..."
- "Gym essentials que necesitas..."

FORMATOS QUE FUNCIONAN:
- Morning routine (tomando el producto)
- Gym workout (energía durante entrenamiento)
- Post-workout recovery
- Supplement stack tour
- Transformation journey

EJEMPLOS DE CONTENIDO:
- Incluir 3-5 videos exitosos de otros creators fitness
- Analizar qué funcionó (hook, estilo, duración)
- Dar como inspiración, no como script

Responsable: Paulina + Fredo (diseño de recursos)`,
        listName: 'En construcción'
    },
    {
        name: 'Preparar recursos visuales para creators',
        desc: `Crear biblioteca de assets para compartir con creators de GR FUEL.

FOTOS DE PRODUCTO:
- Hero shots con fondo blanco
- Lifestyle shots (gym, kitchen, on-the-go)
- Ingredient close-ups
- Packaging shots
- Before/after de producto (polvo, líquido, etc.)

VIDEOS:
- B-roll de producto
- Clips de uso (mixing, drinking)
- Testimoniales si hay
- Clips de gym/workout para usar como overlay

DISEÑOS:
- Templates de Instagram Stories
- Carruseles educativos sobre ingredientes
- Infografías de beneficios
- Banners para TikTok
- Thumbnails

COPY Y CLAIMS:
- Lista de claims aprobados
- Beneficios clave por producto
- Ingredientes destacados
- Diferenciadores vs competencia

TRENDING CONTENT (actualizar semanalmente):
- Hooks que están funcionando en fitness
- Audios trending en gym/workout content
- Formatos de video que viralizan
- Hashtags recomendados

CARPETA COMPARTIDA:
- Google Drive o Dropbox
- Organizada por tipo de asset
- Fácil acceso para creators
- Actualizada regularmente

Responsable: Paulina + Fredo (diseño) + equipo GR FUEL (assets)`,
        listName: 'En construcción'
    },

    // ANDRÉS - Shop Management
    {
        name: 'Crear manual de best practices para Fulfillment',
        desc: `Desarrollar manual operativo para el equipo de fulfillment de GR FUEL.

Por qué es necesario: Shop Performance Score está "Not rated" - necesitamos operación impecable.

SECCIONES DEL MANUAL:

1. PROCESAMIENTO DE ÓRDENES:
- Timeframe: Procesar dentro de 24 horas
- Verificación de inventario antes de confirmar
- Protocolo para órdenes con problemas

2. EMPAQUE:
- Estándares de empaque (protección, presentación)
- Incluir insertos (tarjeta de agradecimiento, instrucciones)
- Verificación de calidad antes de sellar

3. ENVÍO:
- SLA de TikTok Shop: Enviar dentro de 2-3 días
- Imprimir etiquetas correctamente
- Actualizar tracking en Seller Center INMEDIATAMENTE
- Notificar al cliente cuando se envíe

4. MANEJO DE PROBLEMAS:
- Producto dañado: Protocolo de reemplazo
- Dirección incorrecta: Cómo corregir
- Orden cancelada: Proceso de devolución
- Retrasos: Comunicación proactiva con cliente

5. MÉTRICAS A MONITOREAR:
- Order Fulfillment Rate (meta: 98%+)
- Shipping Time (meta: <48 horas)
- Defect Rate (meta: <1%)

6. COMUNICACIÓN:
- Reportes diarios a Andrés
- Escalación de problemas urgentes
- Reunión semanal de revisión

FORMATO:
- Documento PDF descargable
- Checklist imprimible
- Video tutorial corto (5-10 min)

Responsable: Andrés + consulta con Mabel si necesario`,
        listName: 'En construcción'
    },
    {
        name: 'Crear manual de best practices para Customer Service',
        desc: `Desarrollar manual operativo para customer service de GR FUEL en TikTok Shop.

SECCIONES DEL MANUAL:

1. TIEMPOS DE RESPUESTA:
- Primera respuesta: <2 horas (horario laboral)
- Resolución de issues: <24 horas
- Seguimiento: <48 horas

2. TIPOS DE CONSULTAS Y RESPUESTAS:

PREGUNTAS SOBRE PRODUCTO:
- Ingredientes y beneficios
- Cómo usar el producto
- Diferencias entre productos
- Sabores disponibles

PROBLEMAS CON ORDEN:
- Tracking no actualizado
- Producto no llegó
- Producto dañado
- Quiero cancelar/cambiar orden

DEVOLUCIONES Y REEMBOLSOS:
- Política de devolución clara
- Proceso paso a paso
- Timeframes
- Excepciones

3. TONO Y ESTILO:
- Amigable pero profesional
- Empático con problemas del cliente
- Proactivo en ofrecer soluciones
- Rápido y eficiente

4. TEMPLATES DE RESPUESTA:
- 10-15 templates para consultas comunes
- Personalizables según situación
- En español e inglés

5. ESCALACIÓN:
- Cuándo escalar a Andrés
- Cuándo involucrar al equipo de GR FUEL
- Protocolo para casos complejos

6. MÉTRICAS:
- Response Time (meta: <2 horas)
- Resolution Rate (meta: 95%+)
- Customer Satisfaction (meta: 4.5+/5)

Responsable: Andrés + equipo GR FUEL`,
        listName: 'En construcción'
    },
    {
        name: 'Activar bot de notificaciones en chat de TikTok Shop',
        desc: `Configurar correctamente el sistema de notificaciones automáticas en TikTok Shop.

Objetivo: Respuesta inmediata a clientes, mejor customer service score.

PASOS:

1. ACCEDER A SELLER CENTER:
- Ir a Settings > Messaging
- Buscar opción de Auto-Reply o Chat Bot

2. CONFIGURAR MENSAJES AUTOMÁTICOS:

BIENVENIDA:
"¡Hola! Gracias por contactar a GR FUEL. Estamos aquí para ayudarte. ¿En qué podemos asistirte hoy?"

FUERA DE HORARIO:
"Gracias por tu mensaje. Nuestro horario es [horario]. Te responderemos en cuanto estemos disponibles."

FAQ AUTOMÁTICAS:
- ¿Cuánto tarda el envío?
- ¿Cuáles son los ingredientes?
- ¿Cómo uso el producto?
- ¿Tienen garantía?

3. CONFIGURAR NOTIFICACIONES:
- Push notifications para mensajes nuevos
- Email alerts para el equipo
- Asignar responsables de responder

4. TESTING:
- Probar el bot desde cuenta de prueba
- Verificar que respuestas sean correctas
- Ajustar según necesidad

5. MONITOREO:
- Revisar diariamente que bot esté funcionando
- Medir response time
- Ajustar mensajes según feedback

Meta: Response time <30 minutos con bot + <2 horas con humano.

Responsable: Andrés`,
        listName: 'En construcción'
    },
    {
        name: 'Coordinar campaña de amigos y familia para reviews',
        desc: `Activar red de amigos y familia del equipo GR FUEL para generar social proof inicial.

Por qué es crítico: 
- Tienda tiene poco movimiento
- Necesita reviews y actividad en chat
- Esto ayuda con Shop Performance Score y conversión

PLAN DE ACCIÓN:

1. REUNIÓN CON EQUIPO GR FUEL:
- Explicar importancia de reviews y social proof
- Solicitar lista de 20-30 amigos/familia dispuestos a ayudar
- Coordinar logística

2. PREPARAR LISTA:
- Nombres y contactos
- Direcciones de envío
- Producto preferido de cada uno

3. ENVÍO DE PRODUCTO:
- Enviar producto gratis a la lista
- Incluir nota explicando el apoyo que necesitan
- Instrucciones claras de qué hacer

4. INSTRUCCIONES PARA AMIGOS/FAMILIA:

PASO 1 - COMPRAR EN TIKTOK SHOP:
- Buscar GR FUEL en TikTok Shop
- Hacer orden del producto (se les reembolsará)
- Confirmar compra

PASO 2 - DEJAR REVIEW:
- Después de recibir producto
- Review honesta pero positiva (4-5 estrellas)
- Mencionar beneficios reales
- Subir foto del producto

PASO 3 - ACTIVIDAD EN CHAT:
- Hacer preguntas en el chat de productos
- Comentar en videos de la marca
- Dar likes y shares

5. REEMBOLSO:
- Coordinar reembolso de las compras
- Puede ser vía Venmo, Zelle, etc.
- Agradecer su apoyo

6. TIMING:
- Escalonar las compras (no todas el mismo día)
- Distribuir reviews en 2-3 semanas
- Mantener actividad orgánica

Meta: 20-30 reviews positivas + actividad en chat en 30 días.

IMPORTANTE: Esto es para INICIAR. No es estrategia a largo plazo. Después debe venir tráfico real.

Responsable: Andrés + equipo GR FUEL`,
        listName: 'En construcción'
    },
    {
        name: 'Optimizar product listings de GR FUEL',
        desc: `Mejorar presentación de productos en TikTok Shop para aumentar conversión.

Situación actual: Product Card genera 94.3% del GMV - es el canal principal.

ELEMENTOS A OPTIMIZAR:

1. FOTOS (mínimo 5-7 por producto):
- Hero shot profesional (fondo blanco)
- Lifestyle en gym/workout
- Ingredient highlights
- Packaging completo
- Size comparison
- Before/after de preparación

2. TÍTULO:
- Keywords principales primero
- Beneficios claros
- Formato: [Marca] [Producto] [Beneficio] [Detalles]
- Ejemplo: "GR FUEL Pre-Workout Powder - Energy & Focus - 30 Servings"

3. DESCRIPCIÓN:
- Bullets con beneficios clave
- Ingredientes destacados
- Cómo usar (serving size, timing)
- Para quién es (atletas, gym-goers, etc.)
- Diferenciadores

4. PRECIO Y PROMOCIONES:
- Revisar pricing vs competencia
- Considerar bundles (pre + post workout)
- Ofertas de lanzamiento
- Free shipping threshold

5. CATEGORIZACIÓN:
- Verificar que esté en categoría correcta
- Tags apropiados
- Keywords para búsqueda

6. REVIEWS Y Q&A:
- Responder todas las preguntas
- Agradecer reviews positivas
- Resolver issues de reviews negativas

Responsable: Andrés + equipo GR FUEL (assets)`,
        listName: 'En construcción'
    },

    // DIEGO - Ads Performance
    {
        name: 'Auditoría completa de campañas TikTok Ads',
        desc: `Revisar y diagnosticar por qué las campañas no están convirtiendo a pesar de tener GMV Max activado.

Situación actual:
- GMV Max está ON
- Pero las campañas no están generando conversiones
- Necesitamos entender QUÉ está fallando

ANÁLISIS REQUERIDO:

1. ESTRUCTURA DE CAMPAÑAS:
- ¿Cuántas campañas activas?
- ¿Qué objetivo tienen? (Traffic, Conversions, Product Sales)
- ¿Presupuesto diario/total?
- ¿Duración de las campañas?

2. TARGETING:
- ¿A quién estamos llegando? (demographics)
- ¿Intereses configurados?
- ¿Lookalike audiences?
- ¿Retargeting activo?

3. CREATIVOS:
- ¿Qué videos estamos usando?
- ¿Son videos de creators o branded?
- ¿CTR de cada creativo?
- ¿Están usando Spark Ads?

4. MÉTRICAS CLAVE:
- Impressions
- CTR (Click-Through Rate)
- CPC (Cost Per Click)
- CVR (Conversion Rate)
- CPA (Cost Per Acquisition)
- ROAS (Return on Ad Spend)

5. GMV MAX ESPECÍFICAMENTE:
- ¿Está configurado correctamente?
- ¿Qué productos están en GMV Max?
- ¿Budget suficiente para que funcione?
- ¿Learning phase completada?

6. DIAGNÓSTICO:
- ¿Dónde está el problema? (Targeting, creativos, presupuesto, producto)
- ¿Qué está funcionando mejor?
- ¿Qué hay que cambiar inmediatamente?

ENTREGABLE:
- Documento con análisis completo
- Screenshots de métricas clave
- Recomendaciones específicas de optimización
- Plan de acción para próximos 30 días

DEADLINE: 7 días para entregar análisis completo.

Responsable: Diego`,
        listName: 'En construcción'
    },
    {
        name: 'Implementar estrategia de Spark Ads con contenido de creators',
        desc: `Usar contenido orgánico de creators para ads - estrategia probada que funciona mejor que branded content.

Por qué Spark Ads:
- Contenido de creators convierte 3-5x mejor que branded ads
- Mantiene engagement orgánico (likes, comments, shares)
- Más auténtico y confiable

PLAN DE IMPLEMENTACIÓN:

1. IDENTIFICAR MEJORES VIDEOS:
- Revisar videos de los 154 creators contactados
- Buscar los que tienen mejor engagement
- Filtrar por relevancia al producto

2. SOLICITAR PERMISO:
- Contactar a creators con mejores videos
- Explicar que queremos usar su contenido en ads
- Ofrecer compensación (flat fee + comisión)

3. OBTENER SPARK AD CODE:
- Creator genera código en TikTok
- Nos lo comparte
- Lo usamos para crear ad

4. CONFIGURAR CAMPAÑAS:
- Crear campaña específica de Spark Ads
- Testing A/B con diferentes videos
- Medir performance vs ads branded

5. OPTIMIZACIÓN:
- Identificar qué videos convierten mejor
- Escalar presupuesto en ganadores
- Pausar los que no funcionan
- Solicitar más contenido a creators exitosos

6. COMPENSACIÓN A CREATORS:
- Flat fee por uso de video ($50-100)
- Comisión extra por ventas generadas
- Reconocimiento en comunidad

Meta: 10-15 Spark Ads activos en 30 días.

Responsable: Diego (ads) + Paulina (coordinación con creators)`,
        listName: 'En construcción'
    },

    // RECOMENDACIÓN ESTRATÉGICA
    {
        name: '💡 RECOMENDACIÓN: Activar TikTok LIVEs para GR FUEL',
        desc: `OPORTUNIDAD ENORME - LIVE está en $0 (0% del GMV).

Situación:
- Product Card: 94.3% ($3,133)
- Videos: 5.7% ($189)
- LIVE: 0% ($0)

Por qué LIVEs son perfectos para fitness/supplements:
- Demos en vivo de producto
- Q&A sobre ingredientes, uso, beneficios
- Workout sessions con el producto
- Testimoniales en tiempo real
- Urgencia con ofertas limitadas

ESTRATEGIA DE LIVES:

1. FORMATO "GYM SESSION LIVE":
- Host hace workout en vivo
- Usa GR FUEL pre-workout al inicio
- Habla de energía y focus durante ejercicio
- Q&A mientras entrena
- Ofertas especiales solo durante LIVE

2. FORMATO "SUPPLEMENT EDUCATION":
- Explicar ingredientes
- Cómo y cuándo tomar cada producto
- Responder preguntas comunes
- Demos de preparación
- Bundles con descuento

3. COLABORACIONES:
- Invitar a creators del programa
- Co-host LIVEs con atletas
- Guest appearances de entrenadores

4. FRECUENCIA:
- Empezar con 2 LIVEs por semana
- Escalar a 3-4 según respuesta
- Horarios estratégicos (mañana pre-gym, tarde post-work)

5. PROMOCIÓN:
- Anunciar LIVEs en comunidad de creators
- Posts previos en TikTok
- Recordatorios en Stories
- Incentivos para asistir (sorteos, descuentos)

Meta: Generar 10-15% del GMV desde LIVEs en 60 días.

Responsable: Andrés (coordinar) + creators (hosts)`,
        listName: 'En construcción'
    }
];

async function addCardsToBoard() {
    try {
        console.log('===============================================');
        console.log('GR FUEL - Agregando tareas al board');
        console.log('===============================================\n');

        // 1. Buscar el board GR FUEL
        console.log('Buscando board GR FUEL...\n');
        const boardsResponse = await fetch(
            `${TRELLO_API_BASE}/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const boards = await boardsResponse.json();
        const grfuelBoard = boards.find(b => b.name === BOARD_NAME && !b.closed);

        if (!grfuelBoard) {
            console.log(`Board "${BOARD_NAME}" no encontrado. Creándolo...\n`);
            
            const createBoardResponse = await fetch(
                `${TRELLO_API_BASE}/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: BOARD_NAME,
                        defaultLists: false,
                        prefs_background: 'orange',
                        prefs_permissionLevel: 'private'
                    })
                }
            );
            
            const newBoard = await createBoardResponse.json();
            console.log(`Board creado: ${BOARD_NAME} (${newBoard.id})\n`);
            
            // Crear lista "En construcción"
            const createListResponse = await fetch(
                `${TRELLO_API_BASE}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'En construcción',
                        idBoard: newBoard.id,
                        pos: 'top'
                    })
                }
            );
            
            var targetList = await createListResponse.json();
            var boardUrl = newBoard.url || newBoard.shortUrl;
        } else {
            console.log(`Board encontrado: ${BOARD_NAME} (${grfuelBoard.id})\n`);
            
            // Obtener listas del board
            const listsResponse = await fetch(
                `${TRELLO_API_BASE}/boards/${grfuelBoard.id}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
            );
            const lists = await listsResponse.json();
            
            var targetList = lists.find(l => l.name === 'En construcción');
            
            if (!targetList) {
                console.log('Lista "En construcción" no encontrada, creándola...\n');
                const createListResponse = await fetch(
                    `${TRELLO_API_BASE}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: 'En construcción',
                            idBoard: grfuelBoard.id,
                            pos: 'top'
                        })
                    }
                );
                targetList = await createListResponse.json();
            }
            
            var boardUrl = grfuelBoard.url || grfuelBoard.shortUrl;
        }

        console.log(`Lista "En construcción" lista: ${targetList.id}\n`);

        // 2. Crear tarjetas
        console.log('Creando tarjetas de GR FUEL...\n');

        let created = 0;
        for (const cardData of GRFUEL_CARDS) {
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
        console.log(`URL: ${boardUrl}`);
        console.log(`Tarjetas creadas: ${GRFUEL_CARDS.length}`);
        console.log(`\nTodas las tareas están en "En construcción" para revisión!\n`);

    } catch (error) {
        console.error('\nERROR:', error.message);
    }
}

addCardsToBoard();
