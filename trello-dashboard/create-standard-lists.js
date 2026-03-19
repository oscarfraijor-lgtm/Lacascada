// Script para crear listas estándar en todos los boards de Trello
// NO modifica ni mueve tarjetas existentes, solo crea listas nuevas

const TRELLO_API_KEY = '4d0b2f2c3e3e13b0e2e0a0e0a0e0a0e0';
const TRELLO_TOKEN = 'ATTAa2e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0a0e0';
const TRELLO_API_BASE = 'https://api.trello.com/1';

// Listas estándar que se crearán en todos los boards
const STANDARD_LISTS = [
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

async function createStandardLists() {
    try {
        console.log('🔍 Obteniendo boards activos...\n');
        
        // Obtener todos los boards
        const boardsResponse = await fetch(
            `${TRELLO_API_BASE}/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const allBoards = await boardsResponse.json();
        const activeBoards = allBoards.filter(board => !board.closed);
        
        console.log(`📋 Encontrados ${activeBoards.length} boards activos:\n`);
        activeBoards.forEach((board, i) => {
            console.log(`   ${i + 1}. ${board.name}`);
        });
        console.log('\n');

        let totalCreated = 0;
        let totalSkipped = 0;

        // Procesar cada board
        for (const board of activeBoards) {
            console.log(`\n📌 Procesando: ${board.name}`);
            console.log(`   ID: ${board.id}`);
            
            // Obtener listas existentes del board
            const listsResponse = await fetch(
                `${TRELLO_API_BASE}/boards/${board.id}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
            );
            const existingLists = await listsResponse.json();
            const existingListNames = existingLists
                .filter(list => !list.closed)
                .map(list => list.name.toLowerCase().trim());
            
            console.log(`   Listas existentes: ${existingLists.filter(l => !l.closed).length}`);
            
            let createdInBoard = 0;
            let skippedInBoard = 0;

            // Crear cada lista estándar si no existe
            for (const listName of STANDARD_LISTS) {
                const normalizedName = listName.toLowerCase().trim();
                
                // Verificar si ya existe una lista con ese nombre
                if (existingListNames.includes(normalizedName)) {
                    console.log(`   ⏭️  "${listName}" ya existe, omitiendo...`);
                    skippedInBoard++;
                    totalSkipped++;
                    continue;
                }
                
                // Crear la lista
                try {
                    const createResponse = await fetch(
                        `${TRELLO_API_BASE}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: listName,
                                idBoard: board.id,
                                pos: 'bottom' // Agregar al final
                            })
                        }
                    );
                    
                    if (createResponse.ok) {
                        const newList = await createResponse.json();
                        console.log(`   ✅ Creada: "${listName}" (ID: ${newList.id})`);
                        createdInBoard++;
                        totalCreated++;
                    } else {
                        const error = await createResponse.text();
                        console.log(`   ❌ Error creando "${listName}": ${error}`);
                    }
                    
                    // Pequeña pausa para no saturar la API
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                } catch (err) {
                    console.log(`   ❌ Error creando "${listName}": ${err.message}`);
                }
            }
            
            console.log(`   📊 Resumen: ${createdInBoard} creadas, ${skippedInBoard} omitidas`);
        }

        console.log('\n\n═══════════════════════════════════════════════════════');
        console.log('✨ PROCESO COMPLETADO');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`📋 Boards procesados: ${activeBoards.length}`);
        console.log(`✅ Listas creadas: ${totalCreated}`);
        console.log(`⏭️  Listas omitidas (ya existían): ${totalSkipped}`);
        console.log('\n💡 Ahora puedes ir a Trello y acomodar las listas manualmente.');
        console.log('   Las nuevas listas están al final de cada board.\n');

    } catch (error) {
        console.error('\n❌ ERROR GENERAL:', error);
        console.error('Detalles:', error.message);
    }
}

// Ejecutar
createStandardLists();
