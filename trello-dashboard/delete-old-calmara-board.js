// Script para eliminar el board "CALMARA - TikTok Shop Launch" creado anteriormente

const TRELLO_API_KEY = 'cbde3fc64bf4f52c6bf13a28b431ce06';
const TRELLO_TOKEN = 'ATTA236f6926324c8495e332bf97d9caf12ea6bd5b49ccb6dd24a659400781cdeefb02C49F43';
const TRELLO_API_BASE = 'https://api.trello.com/1';

const BOARD_TO_DELETE = 'CALMARA - TikTok Shop Launch';

async function deleteBoard() {
    try {
        console.log(`🔍 Buscando board "${BOARD_TO_DELETE}"...\n`);
        
        const boardsResponse = await fetch(
            `${TRELLO_API_BASE}/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        const boards = await boardsResponse.json();
        const board = boards.find(b => b.name === BOARD_TO_DELETE && !b.closed);

        if (!board) {
            console.log(`ℹ️  Board "${BOARD_TO_DELETE}" no encontrado o ya fue eliminado.\n`);
            return;
        }

        console.log(`✅ Board encontrado: ${BOARD_TO_DELETE}`);
        console.log(`   ID: ${board.id}`);
        console.log(`\n🗑️  Eliminando board...\n`);

        const deleteResponse = await fetch(
            `${TRELLO_API_BASE}/boards/${board.id}?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            {
                method: 'DELETE'
            }
        );

        if (deleteResponse.ok) {
            console.log(`✅ Board "${BOARD_TO_DELETE}" eliminado exitosamente!\n`);
        } else {
            const error = await deleteResponse.text();
            console.log(`❌ Error eliminando board: ${error}\n`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

deleteBoard();
