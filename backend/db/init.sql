import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// ... (configuração do cliente DB)

async function initializeDatabase() {
    const initSqlPath = path.join(__dirname, 'db', 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');

    try {
        await client.connect();
        // Executa todo o script SQL de uma vez
        await client.query(initSql);
        console.log('Banco de dados inicializado com sucesso (tabelas criadas/verificadas).');
    } catch (err) {
        console.error('Erro ao inicializar o banco de dados:', err);
    } finally {
        await client.end();
    }
}
// Chame initializeDatabase antes de iniciar o servidor (server.listen)