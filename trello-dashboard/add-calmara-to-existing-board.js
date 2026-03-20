// Script para agregar tareas de CALMARA al board TTS CALMARA existente
// Todas las tarjetas van a la lista "En construcción"

const TRELLO_API_KEY = 'cbde3fc64bf4f52c6bf13a28b431ce06';
const TRELLO_TOKEN = 'ATTA236f6926324c8495e332bf97d9caf12ea6bd5b49ccb6dd24a659400781cdeefb02C49F43';
const TRELLO_API_BASE = 'https://api.trello.com/1';

// Nombre del board existente
const BOARD_NAME = 'TTS CALMARA';
const TARGET_LIST_NAME = 'En construcción';

// Todas las tarjetas del proyecto Calmara
const CALMARA_CARDS = [
    // Docs y Recursos
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
    },
    
    // FASE 1: Producción Videos
    {
        name: '🎬 Crear formato/brief de trabajo para videos',
        desc: `FASE 1: Producción de 100 Videos UGC

Checklist:
☐ Definir estructura de videos (hook, demo, CTA)
☐ Especificaciones técnicas (duración, formato, resolución)
☐ Guidelines de marca y messaging
☐ Ejemplos de referencia (ver análisis Accio)
☐ Script templates para creadores`
    },
    {
        name: '🎬 Coordinar producción en Baja California',
        desc: `FASE 1: Producción de 100 Videos UGC

Checklist:
☐ Solicitar a Calmara envío de cases/muestras a la frontera
☐ Identificar y contratar creadores locales en BC
☐ Coordinar logística de entrega de producto
☐ Calendario de grabación
☐ Briefing a creadores sobre el producto`
    },
    {
        name: '🎬 Coordinar producción en CDMX',
        desc: `FASE 1: Producción de 100 Videos UGC

Checklist:
☐ Contactar comercializadora para distribución de producto
☐ Buscar y contratar comercializadora confiable
☐ Coordinar entrega de muestras a creadores en CDMX
☐ Brief a creadores sobre el producto
☐ Calendario de producción CDMX`
    },
    
    // FASE 2: FDA Approval
    {
        name: '📋 Obtener aprobación FDA para Calmara',
        desc: `FASE 2: FDA Approval & Compliance

Checklist:
☐ Verificar si Calmara ya tiene FDA registration (food facility)
☐ Si NO: Registrar como FDA food facility
☐ Preparar documentación: Nutrition Facts label
☐ Lista completa de ingredientes
☐ Verificar compliance con regulaciones de bebidas energéticas
☐ Obtener certificación de "approved seller" para TikTok Shop

📚 Referencia: SOP #011 policy-compliance.html
Sección: Alimentos y Bebidas (requiere FDA)

⚠️ CRÍTICO - Bloqueante para siguiente fase`,
        due: '2026-03-26'
    },
    
    // FASE 3: TikTok Shop Setup
    {
        name: '🛒 Crear/Configurar Seller Center',
        desc: `FASE 3: TikTok Shop Setup

Checklist:
☐ Seguir SOP #001: seller-center-setup.html
☐ Crear cuenta Business Seller
☐ Verificar cuenta de vendedor
☐ Configurar pagos y cuenta bancaria
☐ Completar verificación de negocio
☐ Esperar aprobación (24-48 horas)

⚠️ Depende de: FDA Approval completado`
    },
    {
        name: '🛒 Subir listing de Calmara a TikTok Shop',
        desc: `FASE 3: TikTok Shop Setup

Checklist:
☐ Seguir SOP #002: product-listing.html
☐ Categoría: Food & Beverages → Energy Drinks
☐ Título optimizado con keywords
☐ Descripción persuasiva (problema → features → specs)
☐ 8+ imágenes de producto (hero, lifestyle, nutrition facts)
☐ Pricing strategy (considerar 6% TikTok + 10% afiliados)
☐ Configurar peso y dimensiones de envío
☐ Submit y esperar aprobación (24-48 horas)

⚠️ Depende de: Seller Center configurado`
    },
    
    // FASE 4: Fulfillment
    {
        name: '📦 Conectar fulfillment center con TikTok Shop',
        desc: `FASE 4: Fulfillment Integration

Checklist:
☐ Evaluar si califican para FBT (Fulfilled by TikTok)
☐ Ver SOP #003: order-management.html (Sección 5: FBT)
☐ Si usan FBT: Crear inbound shipment
☐ Si usan FBT: Enviar inventario a warehouse TikTok
☐ Si self-fulfillment: Configurar shipping methods
☐ Configurar carriers (UPS, FedEx, USPS)
☐ Configurar tiempos de envío (Express/Standard/Economy)
☐ Integrar sistema de inventario con Seller Center
☐ Capacitar equipo en procesamiento de pedidos`
    },
    {
        name: '📦 Documentar proceso de fulfillment',
        desc: `FASE 4: Fulfillment Integration

Crear SOP interno para Calmara:
☐ Cómo procesar pedidos diarios
☐ Rutina: revisar "Awaiting Shipment" 2x/día
☐ Proceso de imprimir labels y despachar
☐ Manejo de returns & refunds (responder en <48h)
☐ Tiempos críticos y SLAs
☐ Cómo proteger el SPS (Shop Performance Score)`
    },
    
    // FASE 5: Contenido & Afiliados
    {
        name: '🎯 Implementar los 100 videos en estrategia',
        desc: `FASE 5: Estrategia de Contenido & Afiliados

Checklist:
☐ Distribuir videos entre afiliados y ads
☐ Crear programa de afiliados (10% comisión)
☐ Briefs para creadores con mejores prácticas
☐ Usar insights del análisis Accio:
  - Hooks: "Pattern Interrupts" + urgency
  - Benefit stacking (no solo cafeína)
  - Speed: 150-170 WPM
  - CTA al 75% del video`
    },
    {
        name: '🎯 Configurar TikTok Ads para Calmara',
        desc: `FASE 5: Estrategia de Contenido & Afiliados

Checklist:
☐ Definir presupuesto inicial
☐ Objetivos de campaña (conversión)
☐ Creativos (usar los 100 videos producidos)
☐ Targeting (demographics, intereses)
☐ Optimización y testing A/B
☐ Tracking de ROI`
    }
];

async function findBoard() {
    try {
        console.log(`🔍 Buscando board "${BOARD_NAME}"...\n`);
        const boardsResponse = await fetch(
            `${TRELLO_API_BASE}/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const boards = await boardsResponse.json();
        const board = boards.find(b => b.name === BOARD_NAME && !b.closed);

        if (!board) {
            throw new Error(`❌ No se encontró el board "${BOARD_NAME}". Verifica que existe.`);
        }

        console.log(`✅ Board encontrado: ${BOARD_NAME}`);
        console.log(`   ID: ${board.id}\n`);
        return board;

    } catch (error) {
        console.error('❌ Error buscando board:', error.message);
        throw error;
    }
}

async function findTargetList(boardId) {
    try {
        console.log(`🔍 Buscando lista "${TARGET_LIST_NAME}"...\n`);
        const listsResponse = await fetch(
            `${TRELLO_API_BASE}/boards/${boardId}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const lists = await listsResponse.json();
        const targetList = lists.find(l => l.name === TARGET_LIST_NAME && !l.closed);

        if (!targetList) {
            throw new Error(`❌ No se encontró la lista "${TARGET_LIST_NAME}". Verifica que existe en el board.`);
        }

        console.log(`✅ Lista encontrada: ${TARGET_LIST_NAME}`);
        console.log(`   ID: ${targetList.id}\n`);
        return targetList;

    } catch (error) {
        console.error('❌ Error buscando lista:', error.message);
        throw error;
    }
}

async function createCards(listId) {
    try {
        console.log(`📝 Creando ${CALMARA_CARDS.length} tarjetas en "En construcción"...\n`);

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
                const card = await cardResponse.json();
                console.log(`   ✅ ${cardData.name}`);
                created++;
            } else {
                const error = await cardResponse.text();
                console.log(`   ❌ Error: ${cardData.name} - ${error}`);
            }

            // Pequeña pausa para no saturar la API
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        console.log(`\n✨ ${created} tarjetas creadas exitosamente!\n`);

    } catch (error) {
        console.error('❌ Error creando tarjetas:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎬 CALMARA - Agregando tareas a TTS CALMARA');
        console.log('   Lista destino: En construcción');
        console.log('═══════════════════════════════════════════════════════\n');

        const board = await findBoard();
        const targetList = await findTargetList(board.id);
        await createCards(targetList.id);

        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ PROCESO COMPLETADO');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`\n📋 Board: ${BOARD_NAME}`);
        console.log(`📝 Lista: ${TARGET_LIST_NAME}`);
        console.log(`📌 Tarjetas agregadas: ${CALMARA_CARDS.length}`);
        console.log(`\n💡 Ahora puedes revisar y mover las tarjetas manualmente en Trello!\n`);

    } catch (error) {
        console.error('\n❌ ERROR GENERAL:', error);
        console.error('Detalles:', error.message);
    }
}

// Ejecutar
main();
