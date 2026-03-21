// Script para crear board QUIHUI en Trello
// Tareas de branding y marketing para nueva marca

const TRELLO_API_KEY = 'cbde3fc64bf4f52c6bf13a28b431ce06';
const TRELLO_TOKEN = 'ATTA236f6926324c8495e332bf97d9caf12ea6bd5b49ccb6dd24a659400781cdeefb02C49F43';
const TRELLO_API_BASE = 'https://api.trello.com/1';

const BOARD_NAME = 'QUIHUI';

// Listas estándar para el board
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

// Tarjetas para QUIHUI (todas van a "En construcción")
const QUIHUI_CARDS = [
    {
        name: 'Tomar fotos del producto',
        desc: `Sesión fotográfica del producto QUIHUI:
- Coordinar sesión de fotos
- Fotos de producto (hero shots)
- Fotos lifestyle si aplica
- Fotos de ingredientes/detalles
- Edición básica de fotos
- Entrega de archivos en alta resolución`,
        listName: 'En construcción'
    },
    {
        name: 'Sacar logo digitalmente',
        desc: `Digitalización del logo de QUIHUI:
- Recibir imagen digital del cliente
- Trazar logo vectorialmente
- Crear versiones: color, blanco/negro, monocromático
- Formatos: AI, EPS, PNG, SVG
- Entregar manual de uso básico del logo`,
        listName: 'En construcción'
    },
    {
        name: 'Crear brochure sencillo (2-3 slides)',
        desc: `Brochure simple para QUIHUI:
- Slide 1: Producto + logo
- Slide 2: Ingredientes (fácil de entender)
- Slide 3: Puntos de venta
- Diseño limpio y profesional
- Usar fotos tomadas del producto
- Formato: PDF para impresión y digital`,
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
                    prefs_background: 'blue',
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
        console.log('Creando tarjetas de QUIHUI...\n');

        let created = 0;

        for (const cardData of QUIHUI_CARDS) {
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
        console.log('QUIHUI - Creando board en Trello');
        console.log('===============================================\n');

        const board = await findOrCreateBoard();
        const lists = await createLists(board.id);
        await createCards(lists);

        console.log('===============================================');
        console.log('PROCESO COMPLETADO');
        console.log('===============================================');
        console.log(`\nBoard: ${BOARD_NAME}`);
        console.log(`URL: ${board.url || board.shortUrl}`);
        console.log(`Tarjetas creadas: ${QUIHUI_CARDS.length}`);
        console.log(`\nAhora puedes etiquetar personas y agregar recursos!\n`);

    } catch (error) {
        console.error('\nERROR:', error.message);
    }
}

main();
