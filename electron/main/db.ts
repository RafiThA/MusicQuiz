import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';
import { app } from 'electron';

let db: Database;

export async function initDb() {
    
    const dbPath = path.join(app.getPath('userData'), 'database.db');

    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        
        
        CREATE TABLE IF NOT EXISTS album (
            
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artist TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS song (

            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            album TEXT REFERENCES album(id),
            duration NUMBER
        );

        CREATE TABLE IF NOT EXISTS settings (

            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
    `)

    // Default settings
    const defaultSettings = [
        { key: 'language', value: 'engb' },
        { key: 'theme', value: '#7B2CBF' }
    ];

    for (const setting of defaultSettings) {

        await db.run(`
            INSERT OR IGNORE INTO settings (key, value)
            VALUES (?, ?)
        `, [setting.key, setting.value]);
    }

    return db;
}

export function getDb() {

    if (!db) throw new Error('Database not initialized. Call initDb() first.');

    return db;
}