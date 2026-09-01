import { ipcMain, dialog } from 'electron';
import { getDb } from './db';
import crypto from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { IPicture, parseFile } from 'music-metadata';
import NodeID3 from 'node-id3' // Eliminar metadata
import fs from 'fs/promises';
import { albumsPath, songsPath, getDefaultCoverPath } from './paths';

async function saveAlbumToLibrary(cover: IPicture | null, albumId: string) {

    const extension = cover ? cover.format.split('/')[1] : 'jpg';

    if (cover) {

        await fs.writeFile(`${albumsPath}/${albumId}.${extension}`, cover.data);
    
    } else {
        await fs.writeFile(`${albumsPath}/${albumId}.jpg`, getDefaultCoverPath());
    }
}

async function saveSongToLibrary(songPath: string, songId: string) {
    
    const extension = songPath.split('.')[songPath.split('.').length - 1] || 'mp3';

    await fs.writeFile(`${songsPath}/${songId}.${extension}`, await fs.readFile(songPath));

    NodeID3.removeTags(`${songsPath}/${songId}.${extension}`); // Eliminar metadata de la canción
}

async function removeSongFromLibrary(songId: string) {
    
    const songFiles = await fs.readdir(songsPath);

    for (const file of songFiles) {
    
        if (file.startsWith(songId)) {

            await fs.unlink(`${songsPath}/${file}`);
            break;
        }
    }
}

async function removeAlbumFromLibrary(albumId: string) {
    
    const albumFiles = await fs.readdir(albumsPath);

    for (const file of albumFiles) {
    
        if (file.startsWith(albumId)) {

            await fs.unlink(`${albumsPath}/${file}`);
            break;
        }
    }
}

export function registerIpcHandlers() {

    const db = getDb();

    // Songs

    ipcMain.handle('db:getSongs', async () => {

        try {
            
            const songs = await db.all('SELECT * FROM song');

            if (!songs) {
                return { error: 'No se encontraron canciones' };
            }

            return songs;

        } catch {
            return { error: 'Error al obtener las canciones' };
        }
    });

    ipcMain.handle('db:getSongsByAlbum', async (event, albumId) => {

        try {
            
            const songs = await db.all('SELECT * FROM song WHERE album = ?', [albumId]);

            if (!songs) {
                return { error: 'No se encontraron canciones' };
            }

            return songs;

        } catch {
            return { error: 'Error al obtener las canciones' };
        }
    });

    ipcMain.handle('db:getSpecificSong', async (event, songId) => {

        try {
            
            const song = await db.get('SELECT * FROM song WHERE id = ?', [songId]);

            if (!song) {
                return null;
            }

            return song;

        } catch {
            return { error: 'Error al obtener la canción' };
        }
    });

    ipcMain.handle('db:deleteSong', async (event, songId) => {

        try {
            
            await db.run('DELETE FROM song WHERE id = ?', [songId]);

            await removeSongFromLibrary(songId);

            return { success: true };

        } catch {
            return { error: 'Error al eliminar la canción' };
        }
    });

    ipcMain.handle('db:addSong', async (event, song) => {

        try {
            const { title, artist, album, duration } = song;

            const id = crypto.randomUUID();

            await db.run(
                'INSERT INTO song (id, title, artist, album, duration) VALUES (?, ?, ?, ?, ?)',
                [id, title, artist, album, duration]
            );

            return { success: true, id };

        } catch {

            return { error: 'Error al agregar la canción' };
        }
    });


    // Albums

    ipcMain.handle('db:getAlbums', async () => {

        try {

            const albums = await db.all('SELECT * FROM album');

            if (!albums) {
                return { error: 'No se encontraron álbumes' };
            }

            return albums;

        } catch {
            return { error: 'Error al obtener los álbumes' };
        }

    });

    ipcMain.handle('db:addAlbum', async (event, album) => {

        try {
            const { title, artist } = album;

            const id = crypto.randomUUID();

            await db.run(
                'INSERT INTO album (id, title, artist) VALUES (?, ?, ?)',
                [id, title, artist]
            );

            return { success: true, id };

        } catch {
            return { error: 'Error al agregar el álbum' };
        }
    });

    ipcMain.handle('db:getSpecificAlbum', async (event, albumId) => {

        try {
            
            const album = await db.get('SELECT * FROM album WHERE id = ?', [albumId]);

            if (!album) {
                return null;
            }

            return album;

        } catch {
            return { error: 'Error al obtener el álbum' };
        }
    });

    ipcMain.handle('db:deleteAlbum', async (event, albumId) => {

        try {
            
            const songs = await db.all('SELECT * FROM song WHERE album = ?', [albumId]);
            
            for (const song of songs) {
                await removeSongFromLibrary(song.id);
            }

            await db.run('DELETE FROM album WHERE id = ?', [albumId])
            await db.run('DELETE FROM song WHERE album = ?', [albumId]);

            await removeAlbumFromLibrary(albumId);

            return { success: true };

        } catch {
            return { error: 'Error al eliminar el álbum' };
        }
    });


    // Files

    ipcMain.handle('file:getDir', async () => {

        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            filters: [
                {name: "", extensions: ['mp3']},
            ]
        });

        return result.canceled ? { error: 'No directory selected' } : { path: result.filePaths[0] };
    });

    // App

    ipcMain.handle('app:saveToLibrary', async (event, filePath) => {

        const AUDIO_EXTENSIONS = ['mp3'];

        let addedSongs = 0;

        try {

            const files = await readdir(filePath, {withFileTypes: true});

            const songs: { name: string; meta: { title: string; artist: string; album: string; duration: number; cover: IPicture | null; }; }[] = []

            // Filter allowed extensions.
            for (const file of files) {

                if (file.isFile()) {

                    const extension = file.name.split('.').pop()?.toLowerCase();
                    
                    if (extension && AUDIO_EXTENSIONS.includes(extension)) {

                        const metadata = await parseFile(`${filePath}/${file.name}`);
                        
                        const audioMeta = {
                            title: metadata.common.title || file.name,
                            artist: metadata.common.artist || 'Unknown Artist',
                            album: metadata.common.album || 'Unknown Album',
                            duration: metadata.format.duration || 0,
                            cover: metadata.common.picture ? metadata.common.picture[0] : null,
                        }

                        songs.push({ name: file.name, meta: audioMeta });
                    }
                }
            };

            // Add songs by album to database and create albums if they don't exists.
            for (const song of songs) {

                // Check if song has valid album and artist
                if (song.meta.album !== 'Unknown Album' && song.meta.artist !== 'Unknown Artist') {

                    // Check if album exists
                    let album = await db.get('SELECT * FROM album WHERE title = ? AND artist = ?', [song.meta.album, song.meta.artist]);

                    if (!album) {

                        // Create album
                        const id = crypto.randomUUID();

                        await db.run(
                            'INSERT INTO album (id, title, artist) VALUES (?, ?, ?)',
                            [id, song.meta.album, song.meta.artist]
                        );

                        await saveAlbumToLibrary(song.meta.cover, id);

                        album = {id: id}
                    } 

                    const albumSong = await db.get('SELECT * FROM song WHERE title = ? AND album = ?', [song.meta.title, album.id]);

                    // Add song to database if it doesn't exist in the album
                    if (!albumSong) {

                        const songId = crypto.randomUUID();

                        await db.run(
                            'INSERT INTO song (id, title, album, duration) VALUES (?, ?, ?, ?)',
                            [songId, song.meta.title, album.id, song.meta.duration]
                        );

                        await saveSongToLibrary(`${filePath}/${song.name}`, songId);

                        addedSongs++;
                    }
                
                // If song has unknown album or artist, add it to the "Unknown Album" and "Unknown Artist" album.
                } else {
                    
                    let unknownAlbum = await db.get('SELECT * FROM album WHERE title = ? AND artist = ?', ['Unknown Album', 'Unknown Artist']);

                    if (!unknownAlbum) {

                        const id = crypto.randomUUID();

                        await db.run(
                            'INSERT INTO album (id, title, artist) VALUES (?, ?, ?)',
                            [id, 'Unknown Album', 'Unknown Artist']
                        );
                        
                        const unknownCover: IPicture = {
                            format: 'image/jpeg',
                            data: await fs.readFile(getDefaultCoverPath()),
                        }

                        await saveAlbumToLibrary(unknownCover, id);

                        unknownAlbum = {id: id}
                    }

                    // Add song to unknown album
                    const songId = crypto.randomUUID();

                    await db.run(
                        'INSERT INTO song (id, title, album, duration) VALUES (?, ?, ?, ?)',
                        [songId, song.meta.title, unknownAlbum.id, song.meta.duration]
                    );

                    await saveSongToLibrary(`${filePath}/${song.name}`, songId);

                    addedSongs++;
                }

            };

            return { success: true, songsAdded: addedSongs };

        } catch (error) {
            console.error('Error saving to library:', error);
            return { error: 'Error al guardar en la biblioteca' };
        }
    });


    // Settings

    ipcMain.handle('settings:get', async (event, key) => {
    
        try {

            const setting = await db.get('SELECT value FROM settings WHERE key = ?', [key]);

            if (!setting) {
                return null;
            }

            return setting.value;

        } catch {
            return { error: 'Error al obtener la configuración' };
        }
    
    });

    ipcMain.handle('settings:set', async (event, key, value) => {

        try {

            await db.run(
                `INSERT INTO settings (key, value) VALUES (?, ?)
                    ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
                [key, value]
            );

            return { success: true };

        } catch {
            return { error: 'Error al guardar la configuración' };
        }

    });
}