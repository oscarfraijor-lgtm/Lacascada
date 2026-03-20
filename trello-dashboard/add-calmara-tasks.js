// Script para agregar tareas del proyecto CALMARA a Trello
// Crea un board o agrega tarjetas a un board existente

const TRELLO_API_KEY = 'cbde3fc64bf4f52c6bf13a28b431ce06';
const TRELLO_TOKEN = 'ATTA236f6926324c8495e332bf97d9caf12ea6bd5b49ccb6dd24a659400781cdeefb02C49F43';
const TRELLO_API_BASE = 'https://api.trello.com/1';

// Nombre del board de Calmara
const BOARD_NAME = 'CALMARA - TikTok Shop Launch';

// Estructura de listas y tarjetas para el proyecto Calmara
const CALMARA_STRUCTURE = {
    lists: [
        {
            name: '📋 Docs / Recursos',
            cards: [
                {
                    name: '📚 SOPs de TikTok Shop Genius',
                    desc: `Referencias a SOPs necesarios:
- SOP #001: seller-center-setup.html
- SOP #002: product-listing.html  
- SOP #003: order-management.html
- SOP #011: policy-compliance.html

Ubicación: /Users/apkuzz/CascadeProjects/tiktok-shop-genius/sops/`
                },
                {
                    name: '📊 Análisis Accio - Energy Drinks',
                    desc: `Documento de análisis de estrategia viral de energy drinks en TikTok.
Incluye: hooks, benefit stacking, speed patterns, creator profiles.
Usar como referencia para producción de videos.`
                }
            ]
        },
        {
            name: '🎬 FASE 1: Producción Videos (100 UGC)',
            cards: [
                {
                    name: 'Crear formato/brief de trabajo para videos',
                    desc: `Checklist:
☐ Definir estructura de videos (hook, demo, CTA)
☐ Especificaciones técnicas (duración, formato, resolución)
☐ Guidelines de marca y messaging
☐ Ejemplos de referencia (ver análisis Accio)
☐ Script templates para creadores`,
                    labels: ['Urgente']
                },
                {
                    name: 'Coordinar producción en Baja California',
                    desc: `Checklist:
☐ Solicitar a Calmara envío de cases/muestras a la frontera
☐ Identificar y contratar creadores locales en BC
☐ Coordinar logística de entrega de producto
☐ Calendario de grabación
☐ Briefing a creadores sobre el producto`,
                    labels: ['En Proceso']
                },
                {
                    name: 'Coordinar producción en CDMX',
                    desc: `Checklist:
☐ Contactar comercializadora para distribución de producto
☐ Buscar y contratar comercializadora confiable
☐ Coordinar entrega de muestras a creadores en CDMX
☐ Brief a creadores sobre el producto
☐ Calendario de producción CDMX`,
                    labels: ['En Proceso']
                }
            ]
        },
        {
            name: '📋 FASE 2: FDA Approval & Compliance',
            cards: [
                {
                    name: 'Obtener aprobación FDA para Calmara',
                    desc: `Checklist:
☐ Verificar si Calmara ya tiene FDA registration (food facility)
☐ Si NO: Registrar como FDA food facility
☐ Preparar documentación: Nutrition Facts label
☐ Lista completa de ingredientes
☐ Verificar compliance con regulaciones de bebidas energéticas
☐ Obtener certificación de "approved seller" para TikTok Shop

📚 Referencia: SOP #011 policy-compliance.html
Sección: Alimentos y Bebidas (requiere FDA)`,
                    labels: ['Crítico', 'Bloqueante'],
                    due: '2026-03-26' // 7 días desde hoy
                }
            ]
        },
        {
            name: '🛒 FASE 3: TikTok Shop Setup',
            cards: [
                {
                    name: 'Crear/Configurar Seller Center',
                    desc: `Checklist:
☐ Seguir SOP #001: seller-center-setup.html
☐ Crear cuenta Business Seller
☐ Verificar cuenta de vendedor
☐ Configurar pagos y cuenta bancaria
☐ Completar verificación de negocio
☐ Esperar aprobación (24-48 horas)

⚠️ Depende de: FDA Approval completado`,
                    labels: ['Bloqueante']
                },
                {
                    name: 'Subir listing de Calmara a TikTok Shop',
                    desc: `Checklist:
☐ Seguir SOP #002: product-listing.html
☐ Categoría: Food & Beverages → Energy Drinks
☐ Título optimizado con keywords
☐ Descripción persuasiva (problema → features → specs)
☐ 8+ imágenes de producto (hero, lifestyle, nutrition facts)
☐ Pricing strategy (considerar 6% TikTok + 10% afiliados)
☐ Configurar peso y dimensiones de envío
☐ Submit y esperar aprobación (24-48 horas)

⚠️ Depende de: Seller Center configurado`,
                    labels: ['En Espera']
                }
            ]
        },
        {
            name: '📦 FASE 4: Fulfillment Integration',
            cards: [
                {
                    name: 'Conectar fulfillment center con TikTok Shop',
                    desc: `Checklist:
☐ Evaluar si califican para FBT (Fulfilled by TikTok)
☐ Ver SOP #003: order-management.html (Sección 5: FBT)
☐ Si usan FBT: Crear inbound shipment
☐ Si usan FBT: Enviar inventario a warehouse TikTok
☐ Si self-fulfillment: Configurar shipping methods
☐ Configurar carriers (UPS, FedEx, USPS)
☐ Configurar tiempos de envío (Express/Standard/Economy)
☐ Integrar sistema de inventario con Seller Center
☐ Capacitar equipo en procesamiento de pedidos`,
                    labels: ['Técnico']
                },
                {
                    name: 'Documentar proceso de fulfillment',
                    desc: `Crear SOP interno para Calmara:
☐ Cómo procesar pedidos diarios
☐ Rutina: revisar "Awaiting Shipment" 2x/día
☐ Proceso de imprimir labels y despachar
☐ Manejo de returns & refunds (responder en <48h)
☐ Tiempos críticos y SLAs
☐ Cómo proteger el SPS (Shop Performance Score)`,
                    labels: ['Documentación']
                }
            ]
        },
        {
            name: '🎯 FASE 5: Contenido & Afiliados',
            cards: [
                {
                    name: 'Implementar los 100 videos en estrategia',
                    desc: `Checklist:
☐ Distribuir videos entre afiliados y ads
☐ Crear programa de afiliados (10% comisión)
☐ Briefs para creadores con mejores prácticas
☐ Usar insights del análisis Accio:
  - Hooks: "Pattern Interrupts" + urgency
  - Benefit stacking (no solo cafeína)
  - Speed: 150-170 WPM
  - CTA al 75% del video`,
                    labels: ['Marketing']
                },
                {
                    name: 'Configurar TikTok Ads para Calmara',
                    desc: `Checklist:
☐ Definir presupuesto inicial
☐ Objetivos de campaña (conversión)
☐ Creativos (usar los 100 videos producidos)
☐ Targeting (demographics, intereses)
☐ Optimización y testing A/B
☐ Tracking de ROI`,
                    labels: ['Ads', 'Marketing']
                }
            ]
        },
        {
            name: '✅ Completado',
            cards: []
        }
    ]
};

async function findOrCreateBoard() {
    try {
        // Buscar si ya existe el board de Calmara
        console.log('🔍 Buscando board de Calmara...\n');
        const boardsResponse = await fetch(
            `${TRELLO_API_BASE}/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const boards = await boardsResponse.json();
        const existingBoard = boards.find(b => b.name === BOARD_NAME && !b.closed);

        if (existingBoard) {
            console.log(`✅ Board encontrado: ${BOARD_NAME}`);
            console.log(`   ID: ${existingBoard.id}\n`);
            return existingBoard;
        }

        // Crear nuevo board
        console.log(`📋 Creando nuevo board: ${BOARD_NAME}...\n`);
        const createResponse = await fetch(
            `${TRELLO_API_BASE}/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: BOARD_NAME,
                    defaultLists: false,
                    prefs_background: 'red',
                    prefs_permissionLevel: 'private'
                })
            }
        );

        const newBoard = await createResponse.json();
        console.log(`✅ Board creado: ${BOARD_NAME}`);
        console.log(`   ID: ${newBoard.id}\n`);
        return newBoard;

    } catch (error) {
        console.error('❌ Error buscando/creando board:', error.message);
        throw error;
    }
}

async function createListsAndCards(boardId) {
    try {
        console.log('📝 Creando listas y tarjetas...\n');

        for (const listData of CALMARA_STRUCTURE.lists) {
            // Crear lista
            const listResponse = await fetch(
                `${TRELLO_API_BASE}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: listData.name,
                        idBoard: boardId,
                        pos: 'bottom'
                    })
                }
            );

            const list = await listResponse.json();
            console.log(`✅ Lista creada: ${listData.name}`);

            // Crear tarjetas en esta lista
            for (const cardData of listData.cards) {
                const cardResponse = await fetch(
                    `${TRELLO_API_BASE}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: cardData.name,
                            desc: cardData.desc,
                            idList: list.id,
                            due: cardData.due || null,
                            pos: 'bottom'
                        })
                    }
                );

                const card = await cardResponse.json();
                console.log(`   📌 Tarjeta: ${cardData.name}`);

                // Pequeña pausa para no saturar la API
                await new Promise(resolve => setTimeout(resolve, 150));
            }

            console.log('');
        }

        console.log('✨ Todas las listas y tarjetas creadas!\n');

    } catch (error) {
        console.error('❌ Error creando listas/tarjetas:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎬 CALMARA - TikTok Shop Launch');
        console.log('   Creando estructura en Trello');
        console.log('═══════════════════════════════════════════════════════\n');

        const board = await findOrCreateBoard();
        await createListsAndCards(board.id);

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ PROCESO COMPLETADO');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`\n📋 Board: ${BOARD_NAME}`);
        console.log(`🔗 URL: ${board.url || board.shortUrl}`);
        console.log(`\n💡 Ahora puedes abrir Trello y ver todas las tareas organizadas!\n`);

    } catch (error) {
        console.error('\n❌ ERROR GENERAL:', error);
        console.error('Detalles:', error.message);
    }
}

// Ejecutar
main();
