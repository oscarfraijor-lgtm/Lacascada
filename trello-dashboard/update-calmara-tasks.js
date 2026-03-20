// Script para actualizar tareas de CALMARA en TTS CALMARA
// Elimina las tarjetas anteriores y crea nuevas sin emojis y con tareas reales

const TRELLO_API_KEY = 'cbde3fc64bf4f52c6bf13a28b431ce06';
const TRELLO_TOKEN = 'ATTA236f6926324c8495e332bf97d9caf12ea6bd5b49ccb6dd24a659400781cdeefb02C49F43';
const TRELLO_API_BASE = 'https://api.trello.com/1';

const BOARD_NAME = 'TTS CALMARA';
const TARGET_LIST_NAME = 'En construcción';

// Tarjetas actualizadas sin emojis y con tareas reales
const CALMARA_CARDS = [
    // Producción de Videos
    {
        name: 'Crear formato de trabajo para 100 videos',
        desc: `Definir estructura y especificaciones para producción de videos:
- Estructura de videos (hook, demo, CTA)
- Especificaciones técnicas (duración, formato, resolución)
- Guidelines de marca y messaging
- Script templates para creadores`
    },
    {
        name: 'Coordinar producción de videos en Baja California',
        desc: `Gestionar producción de videos en la frontera:
- Solicitar a Calmara envío de cases/muestras a la frontera
- Identificar y contratar creadores locales en BC
- Coordinar logística de entrega de producto
- Calendario de grabación`
    },
    {
        name: 'Coordinar producción de videos en CDMX',
        desc: `Gestionar producción de videos en Ciudad de México:
- Contactar comercializadora para distribución de producto en CDMX
- Buscar y contratar comercializadora confiable
- Coordinar entrega de muestras a creadores
- Calendario de producción`
    },
    
    // FDA y Compliance
    {
        name: 'Obtener aprobación FDA para Calmara',
        desc: `Completar proceso de aprobación FDA:
- Verificar si Calmara ya tiene FDA registration (food facility)
- Si NO: Registrar como FDA food facility
- Preparar documentación: Nutrition Facts label
- Lista completa de ingredientes
- Verificar compliance con regulaciones de bebidas energéticas
- Obtener certificación de approved seller para TikTok Shop

CRÍTICO - Bloqueante para poder vender en TikTok Shop`,
        due: '2026-03-26'
    },
    
    // TikTok Shop Setup
    {
        name: 'Conectar TikTok Shop a cuenta de TikTok de Calmara',
        desc: `Vincular el Seller Center con la cuenta de TikTok de la marca:
- Acceder a configuración de Seller Center
- Conectar cuenta de TikTok existente de Calmara
- Verificar vinculación correcta
- Configurar permisos y accesos`
    },
    {
        name: 'Configurar Seller Center de Calmara',
        desc: `Setup inicial del Seller Center:
- Crear cuenta Business Seller
- Verificar cuenta de vendedor
- Configurar pagos y cuenta bancaria
- Completar verificación de negocio
- Esperar aprobación (24-48 horas)

Depende de: FDA Approval completado`
    },
    {
        name: 'Subir listing de producto a TikTok Shop',
        desc: `Crear y publicar el listing del producto:
- Categoría: Food & Beverages - Energy Drinks
- Título optimizado con keywords
- Descripción persuasiva
- Mínimo 8 imágenes de producto (hero, lifestyle, nutrition facts)
- Pricing strategy (considerar 6% comisión TikTok + 10% afiliados)
- Configurar peso y dimensiones de envío
- Submit y esperar aprobación (24-48 horas)

Depende de: Seller Center configurado`
    },
    
    // Fulfillment
    {
        name: 'Definir estrategia de fulfillment para Calmara',
        desc: `La marca necesita decidir cómo va a manejar el fulfillment:
- Evaluar si tienen fulfillment center propio
- Evaluar si califican para FBT (Fulfilled by TikTok)
- Comparar costos: FBT vs self-fulfillment
- Decidir qué opción usar
- Si FBT: proceso de envío de inventario a warehouse TikTok
- Si self-fulfillment: configurar carriers y shipping methods
- Configurar tiempos de envío (Express/Standard/Economy)`
    },
    {
        name: 'Capacitar equipo de Calmara en procesamiento de pedidos',
        desc: `Una vez definido el fulfillment, capacitar al equipo:
- Cómo procesar pedidos diarios en Seller Center
- Rutina: revisar pedidos pendientes 2 veces al día
- Proceso de imprimir labels y despachar
- Manejo de devoluciones y reembolsos (responder en menos de 48h)
- Tiempos críticos y SLAs para mantener buen performance`
    },
    
    // Contenido y Afiliados
    {
        name: 'Implementar estrategia de contenido con los 100 videos',
        desc: `Usar los videos producidos en la estrategia de lanzamiento:
- Distribuir videos entre afiliados y ads
- Crear programa de afiliados (10% comisión)
- Briefs para creadores con mejores prácticas
- Calendario de publicación`
    },
    {
        name: 'Configurar campañas de TikTok Ads',
        desc: `Setup de publicidad pagada:
- Definir presupuesto inicial
- Objetivos de campaña (conversión)
- Creativos (usar los 100 videos producidos)
- Targeting (demographics, intereses)
- Optimización y testing A/B
- Tracking de ROI`
    }
];

async function findBoard() {
    const boardsResponse = await fetch(
        `${TRELLO_API_BASE}/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    const boards = await boardsResponse.json();
    const board = boards.find(b => b.name === BOARD_NAME && !b.closed);
    
    if (!board) {
        throw new Error(`No se encontró el board "${BOARD_NAME}"`);
    }
    
    return board;
}

async function findTargetList(boardId) {
    const listsResponse = await fetch(
        `${TRELLO_API_BASE}/boards/${boardId}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    const lists = await listsResponse.json();
    const targetList = lists.find(l => l.name === TARGET_LIST_NAME && !l.closed);
    
    if (!targetList) {
        throw new Error(`No se encontró la lista "${TARGET_LIST_NAME}"`);
    }
    
    return targetList;
}

async function deleteOldCards(listId) {
    console.log('Eliminando tarjetas anteriores de Calmara...\n');
    
    const cardsResponse = await fetch(
        `${TRELLO_API_BASE}/lists/${listId}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
    );
    const cards = await cardsResponse.json();
    
    // Filtrar solo las tarjetas relacionadas con Calmara
    const calmaraKeywords = ['calmara', 'video', 'fda', 'seller center', 'listing', 'fulfillment', 'sops', 'accio', 'ads'];
    const calmaraCards = cards.filter(card => 
        calmaraKeywords.some(keyword => 
            card.name.toLowerCase().includes(keyword) || 
            card.desc.toLowerCase().includes(keyword)
        )
    );
    
    console.log(`Encontradas ${calmaraCards.length} tarjetas de Calmara para eliminar\n`);
    
    for (const card of calmaraCards) {
        await fetch(
            `${TRELLO_API_BASE}/cards/${card.id}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            { method: 'DELETE' }
        );
        console.log(`   Eliminada: ${card.name}`);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n');
}

async function createCards(listId) {
    console.log(`Creando ${CALMARA_CARDS.length} tarjetas actualizadas...\n`);
    
    let created = 0;
    
    for (const cardData of CALMARA_CARDS) {
        const cardResponse = await fetch(
            `${TRELLO_API_BASE}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: cardData.name,
                    desc: cardData.desc,
                    idList: listId,
                    due: cardData.due || null,
                    pos: 'bottom'
                })
            }
        );
        
        if (cardResponse.ok) {
            console.log(`   Creada: ${cardData.name}`);
            created++;
        } else {
            const error = await cardResponse.text();
            console.log(`   Error: ${cardData.name} - ${error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    console.log(`\n${created} tarjetas creadas exitosamente!\n`);
}

async function main() {
    try {
        console.log('===============================================');
        console.log('CALMARA - Actualizando tareas en TTS CALMARA');
        console.log('===============================================\n');
        
        const board = await findBoard();
        console.log(`Board encontrado: ${BOARD_NAME}\n`);
        
        const targetList = await findTargetList(board.id);
        console.log(`Lista encontrada: ${TARGET_LIST_NAME}\n`);
        
        await deleteOldCards(targetList.id);
        await createCards(targetList.id);
        
        console.log('===============================================');
        console.log('PROCESO COMPLETADO');
        console.log('===============================================');
        console.log(`\nBoard: ${BOARD_NAME}`);
        console.log(`Lista: ${TARGET_LIST_NAME}`);
        console.log(`Tarjetas actualizadas: ${CALMARA_CARDS.length}\n`);
        
    } catch (error) {
        console.error('\nERROR:', error.message);
    }
}

main();
