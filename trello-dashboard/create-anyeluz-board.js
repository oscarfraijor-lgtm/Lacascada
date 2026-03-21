// Script para crear board ANYELUZ en Trello
// Estrategia de afiliados y crecimiento de TikTok Shop

const TRELLO_API_KEY = 'cbde3fc64bf4f52c6bf13a28b431ce06';
const TRELLO_TOKEN = 'ATTA236f6926324c8495e332bf97d9caf12ea6bd5b49ccb6dd24a659400781cdeefb02C49F43';
const TRELLO_API_BASE = 'https://api.trello.com/1';

const BOARD_NAME = 'ANYELUZ - TikTok Shop Growth';

const LISTS = [
    'Docs / Recursos',
    'En construcción',
    'Tareas',
    'En Proceso',
    'Revisión Interna',
    'Primer Ajuste',
    'Revisión Cliente',
    'Segundo Ajuste',
    'Aprobado / Programado'
];

const ANYELUZ_CARDS = [
    // CRÍTICO - Lo que falta obvio
    {
        name: '🚨 URGENTE: Enviar muestras a 211 afiliadas (In Progress)',
        desc: `PRIORIDAD MÁXIMA - Hay 211 creators con sample request "In Progress" que NO han recibido producto.

Acción inmediata:
- Revisar status de las 211 muestras en TikTok Shop Seller Center
- Coordinar con equipo ANYELUZ para preparar envíos
- Procesar y enviar TODAS las muestras pendientes
- Actualizar tracking en Seller Center
- Notificar a creators cuando se envíe

Meta: Enviar las 211 muestras en los próximos 7 días.

Por qué es crítico: Estas creators YA aprobaron el producto y están esperando. Son las más propensas a postear contenido. Cada día de retraso = oportunidad perdida.`,
        listName: 'En construcción',
        labels: ['red']
    },

    // PAULINA - Comunidad y Afiliados
    {
        name: 'Crear grupo de WhatsApp para afiliadas ANYELUZ',
        desc: `Crear comunidad exclusiva para las afiliadas de ANYELUZ.

Setup:
- Crear grupo de WhatsApp Business
- Nombre: "ANYELUZ Creators VIP" o similar
- Descripción del grupo con reglas claras
- Agregar a Paulina como admin principal
- Invitar a equipo interno de ANYELUZ como co-admins

Primer mensaje de bienvenida:
- Paulina se presenta
- Explica el propósito del grupo
- Qué van a encontrar (tips, trending hooks, incentivos)
- Reglas básicas de convivencia

A quién invitar primero:
- Las 21 creators que ya tienen ventas (prioritario)
- Las que tienen producto en casa (211)
- Gradualmente agregar al resto

Responsable: Paulina`,
        listName: 'En construcción'
    },
    {
        name: 'Presentarse con equipo interno de ANYELUZ',
        desc: `Paulina debe conectar con el equipo interno de ANYELUZ para coordinar estrategia de afiliados.

Objetivos de la reunión:
- Presentarse como Affiliate Manager
- Explicar estrategia de comunidad y grupo WhatsApp
- Involucrar al equipo ANYELUZ en el grupo para responder preguntas de producto
- Coordinar envío de muestras pendientes
- Alinear messaging y claims de productos
- Obtener assets (fotos, videos) para compartir con afiliadas

Entregables:
- Contactos clave del equipo ANYELUZ
- Calendario de disponibilidad para participar en grupo
- Assets de marca aprobados

Responsable: Paulina`,
        listName: 'En construcción'
    },
    {
        name: 'Diseñar programa de incentivos para afiliadas',
        desc: `Crear estructura de incentivos para motivar ventas.

Opción recomendada - Modelo Tiered + Bonos:

TIER 1 (Entry): 0-50 ventas
- Comisión base actual

TIER 2 (Performer): 51-200 ventas  
- +3-5% comisión extra
- Badge "Performer" en grupo

TIER 3 (Elite): 201+ ventas
- +5-8% comisión extra
- Badge "Elite" en grupo
- Early access a nuevos productos

BONOS MENSUALES (fuera de TikTok):
- Top 3 vendedoras: Kit completo ANYELUZ gratis
- Creator del mes: Feature en redes de ANYELUZ
- Retos semanales con premios sorpresa

Siguiente paso:
- Validar estructura con Oscar/Sergio
- Configurar tiers en TikTok Shop Seller Center
- Comunicar programa en grupo WhatsApp

Responsable: Paulina + Oscar`,
        listName: 'En construcción'
    },
    {
        name: 'Crear 4 briefs de producto para afiliadas',
        desc: `Crear briefs creativos (NO scripts) para los 4 productos principales.

Productos:
1. Banana Hair Care Duo Set
2. Duo Onion Shampoo and Conditioner
3. Rosemary Shampoo and Conditioner Set
4. Rosemary Enhancer Scalp Tonic

Framework por brief - "Creative Sandbox":

MUST-HAVES (Guardrails):
- Claims específicos del producto (ingredientes, beneficios)
- CTA: Link al producto en TikTok Shop
- Mostrar el producto claramente en video

NO'S:
- No mencionar competidores
- No hacer claims médicos no aprobados
- No usar mala iluminación

LIBERTAD DEL CREATOR:
- Música y audio a su elección
- Estilo de filmación personal
- Humor y anécdotas
- Flujo narrativo propio

Incluir en cada brief:
- 3-5 hooks trending que están funcionando
- Ejemplos de videos exitosos (si hay)
- Hashtags recomendados
- Duración ideal: 15-60 segundos

Responsable: Paulina`,
        listName: 'En construcción'
    },
    {
        name: 'Preparar recursos de inspiración para afiliadas',
        desc: `Crear biblioteca de contenido para compartir en grupo WhatsApp.

VIDEOS:
- Compilar los mejores videos de las 21 creators que ya venden
- Identificar patrones: hooks, estilos, duraciones que funcionan
- Crear carpeta compartida (Google Drive o similar)

DISEÑOS:
- Templates de Instagram Stories para promocionar
- Gráficos con beneficios de productos
- Carruseles educativos sobre ingredientes
- Banners para TikTok

TRENDING HOOKS (actualizar semanalmente):
- "3 hooks que están funcionando esta semana"
- Audios trending en hair care
- Formatos de video que están viralizando

NEWSLETTER SEMANAL:
- Plantilla para enviar cada semana en WhatsApp
- Secciones: Bestseller de la semana, Creator destacada, Tips, Reto semanal

Responsable: Paulina + Fredo (diseños)`,
        listName: 'En construcción'
    },
    {
        name: 'Escalar outreach de afiliados (duplicar contactos)',
        desc: `Acelerar reclutamiento de nuevas afiliadas.

Meta actual: 978 contactados
Meta nueva: 2,000 contactados en próximos 30 días

Estrategia:
- Identificar micro-influencers en hair care (5K-50K followers)
- Buscar creators que ya promocionan productos similares
- Usar TikTok Creator Marketplace
- Revisar competitors y sus afiliadas

Outreach script (probado):
- DM personalizado mencionando su contenido
- Ofrecer producto gratis + comisión
- Destacar programa de incentivos
- Invitar a grupo VIP de WhatsApp

KPI a mejorar:
- Products Added %: mantener arriba de 40%
- Post Rate: mantener arriba de 45%
- Sales Rate: mejorar de 7.4% a 10%+

Responsable: Paulina`,
        listName: 'En construcción'
    },

    // ANDRES - TikTok Shop Management
    {
        name: 'Capacitación en TikTok LIVEs con Oscar',
        desc: `Andrés debe capacitarse con Oscar sobre estrategia de LIVE streaming.

Temas a cubrir:
- Qué son los TikTok LIVEs y por qué son importantes
- Cómo preparar un LIVE exitoso
- Estructura de LIVE (intro, demo, ofertas, Q&A)
- Herramientas necesarias (iluminación, audio, productos)
- Cómo promocionar LIVEs antes y durante
- Métricas clave a monitorear

Situación actual ANYELUZ:
- LIVE revenue: solo $26 de $1,964 (1.3%)
- Oportunidad ENORME - canal completamente desaprovechado
- Competidores están generando 10-20% de GMV en LIVEs

Meta post-capacitación:
- Implementar 2-3 LIVEs por semana
- Involucrar a afiliadas top en LIVEs
- Llegar a 10-15% de GMV desde LIVEs en 60 días

Responsable: Andrés + Oscar (trainer)`,
        listName: 'En construcción'
    },
    {
        name: 'Analizar y mejorar Shop Performance Score (mantener 4.5+)',
        desc: `Monitorear y optimizar el performance score de la tienda ANYELUZ.

Métricas clave del Shop Performance Score:
- Order Fulfillment Rate (tasa de cumplimiento)
- Shipping Time (tiempo de envío)
- Customer Satisfaction (satisfacción)
- Return/Refund Rate (devoluciones)
- Response Time (tiempo de respuesta)

Acciones:
1. Revisar score actual en Seller Center
2. Identificar métricas por debajo de 4.5
3. Si hay problemas, consultar con Mabel para soluciones
4. Coordinar con equipo ANYELUZ para mejorar fulfillment
5. Monitoreo semanal del score

Por qué es crítico:
- Score bajo = penalizaciones de TikTok
- Menos visibilidad en For You Page
- Puede resultar en suspensión de cuenta

Meta: Mantener score arriba de 4.5 consistentemente

Responsable: Andrés (monitoreo) + Mabel (consultoría si hay issues)`,
        listName: 'En construcción'
    },
    {
        name: 'Coordinación con Diego sobre estrategia de TikTok Ads',
        desc: `Andrés debe hacer seguimiento con Diego sobre el plan de ads para ANYELUZ.

Preguntas clave para Diego:
- ¿Cuál es el presupuesto actual de ads?
- ¿Qué campañas están activas?
- ¿Qué videos están usando para ads?
- ¿Cuál es el ROAS actual?
- ¿Qué plan tiene para mejorar performance?

Oportunidad identificada:
- Ya hay 812 videos de afiliadas generados
- Los mejores videos pueden convertirse en Spark Ads
- Estrategia: usar contenido de creators top como ads

Siguiente paso:
- Reunión Andrés + Diego
- Identificar top 10 videos de afiliadas
- Solicitar permiso a creators para Spark Ads
- Diego implementa campañas con ese contenido

Meta: Escalar ads usando contenido orgánico de afiliadas

Responsable: Andrés (coordinación) + Diego (ejecución)`,
        listName: 'En construcción'
    },
    {
        name: 'Optimizar product listings y product cards',
        desc: `Mejorar la presentación de productos en TikTok Shop.

Situación actual:
- Product Card genera 49.8% del GMV ($977)
- Es el canal #1 de ventas
- Oportunidad de optimizar para convertir más

Elementos a revisar/mejorar:

FOTOS:
- Mínimo 5 fotos por producto
- Hero shot con fondo blanco
- Lifestyle shots mostrando uso
- Before/After si aplica
- Close-ups de ingredientes/textura

TÍTULO:
- Incluir keywords principales
- Beneficios claros
- Formato: [Marca] [Producto] [Beneficio Principal]

DESCRIPCIÓN:
- Bullets con beneficios clave
- Ingredientes destacados
- Instrucciones de uso
- Por qué es diferente

PRECIO Y PROMOCIONES:
- Revisar competencia
- Considerar bundles
- Ofertas limitadas para urgencia

Responsable: Andrés + equipo ANYELUZ (assets)`,
        listName: 'En construcción'
    },

    // RECOMENDACIÓN ESTRATÉGICA
    {
        name: '💡 RECOMENDACIÓN: Analizar los 21 creators con ventas',
        desc: `TAREA ESTRATÉGICA - Identificar qué hace diferentes a los creators que SÍ venden.

Situación:
- 442 creators tienen producto agregado
- Solo 21 generan ventas (4.7%)
- Necesitamos entender QUÉ hacen diferente estos 21

Análisis a realizar:

1. IDENTIFICAR LOS 21:
- Nombres/handles de los 21 creators con ventas
- Cuánto ha vendido cada uno
- Cuántos videos han posteado

2. ANALIZAR SU CONTENIDO:
- ¿Qué hooks usan?
- ¿Qué estilo de video? (unboxing, tutorial, review)
- ¿Qué duración tienen sus videos?
- ¿Qué audios usan?
- ¿Cómo hacen el CTA?

3. CREAR PLAYBOOK:
- Documentar los patrones ganadores
- Crear guía "Cómo vender como los top 21"
- Compartir en grupo WhatsApp
- Usar en briefs futuros

4. NUTRIR A LOS TOP 21:
- Invitarlos primero al grupo WhatsApp
- Ofrecerles incentivos especiales
- Pedirles feedback sobre qué necesitan
- Convertirlos en embajadores de marca

Responsable: Paulina + Andrés (análisis conjunto)`,
        listName: 'En construcción'
    },
    {
        name: '💡 RECOMENDACIÓN: Implementar weekly newsletter para afiliadas',
        desc: `Crear comunicación semanal estructurada con todas las afiliadas.

Formato de newsletter (vía WhatsApp):

📊 ESTA SEMANA EN ANYELUZ

🔥 TRENDING HOOKS:
- Hook 1: [ejemplo]
- Hook 2: [ejemplo]  
- Hook 3: [ejemplo]

🏆 BESTSELLER:
- Producto X está convirtiendo al X%
- Por qué está funcionando
- Cómo promocionarlo

⭐ CREATOR DE LA SEMANA:
- Spotlight de la afiliada top
- Cuánto vendió
- Qué hizo bien
- Link a su mejor video

💡 TIP DE CONTENIDO:
- Formato que está viralizando
- Audio trending recomendado
- Ejemplo de video exitoso

🎁 RETO SEMANAL:
- Desafío con premio
- Ejemplo: "Postea un unboxing esta semana y entra al sorteo de un kit completo"

Frecuencia: Todos los lunes a las 10am
Responsable: Paulina
Herramienta: WhatsApp Business + plantilla reutilizable`,
        listName: 'En construcción'
    }
];

async function findOrCreateBoard() {
    try {
        console.log(`Buscando board "${BOARD_NAME}"...\n`);
        
        const boardsResponse = await fetch(
            `${TRELLO_API_BASE}/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const boards = await boardsResponse.json();
        const existingBoard = boards.find(b => b.name === BOARD_NAME && !b.closed);

        if (existingBoard) {
            console.log(`Board encontrado: ${BOARD_NAME}`);
            console.log(`ID: ${existingBoard.id}\n`);
            return existingBoard;
        }

        console.log(`Creando nuevo board: ${BOARD_NAME}...\n`);
        const createResponse = await fetch(
            `${TRELLO_API_BASE}/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: BOARD_NAME,
                    defaultLists: false,
                    prefs_background: 'green',
                    prefs_permissionLevel: 'private'
                })
            }
        );

        const newBoard = await createResponse.json();
        console.log(`Board creado: ${BOARD_NAME}`);
        console.log(`ID: ${newBoard.id}\n`);
        return newBoard;

    } catch (error) {
        console.error('Error buscando/creando board:', error.message);
        throw error;
    }
}

async function createLists(boardId) {
    try {
        console.log('Creando listas estándar...\n');
        
        const createdLists = {};
        
        for (const listName of LISTS) {
            const listResponse = await fetch(
                `${TRELLO_API_BASE}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: listName,
                        idBoard: boardId,
                        pos: 'bottom'
                    })
                }
            );

            const list = await listResponse.json();
            createdLists[listName] = list.id;
            console.log(`  Lista creada: ${listName}`);
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n');
        return createdLists;

    } catch (error) {
        console.error('Error creando listas:', error.message);
        throw error;
    }
}

async function createCards(lists) {
    try {
        console.log('Creando tarjetas de ANYELUZ...\n');

        let created = 0;

        for (const cardData of ANYELUZ_CARDS) {
            const listId = lists[cardData.listName];
            
            if (!listId) {
                console.log(`  Error: Lista "${cardData.listName}" no encontrada`);
                continue;
            }

            const cardResponse = await fetch(
                `${TRELLO_API_BASE}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: cardData.name,
                        desc: cardData.desc,
                        idList: listId,
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

    } catch (error) {
        console.error('Error creando tarjetas:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('===============================================');
        console.log('ANYELUZ - TikTok Shop Growth Strategy');
        console.log('===============================================\n');

        const board = await findOrCreateBoard();
        const lists = await createLists(board.id);
        await createCards(lists);

        console.log('===============================================');
        console.log('PROCESO COMPLETADO');
        console.log('===============================================');
        console.log(`\nBoard: ${BOARD_NAME}`);
        console.log(`URL: ${board.url || board.shortUrl}`);
        console.log(`Tarjetas creadas: ${ANYELUZ_CARDS.length}`);
        console.log(`\nTodas las tareas están en "En construcción" para revisión!\n`);

    } catch (error) {
        console.error('\nERROR:', error.message);
    }
}

main();
