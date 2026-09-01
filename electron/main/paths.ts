import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

export const libraryPath = path.join(app.getPath('userData'), 'library');

export const albumsPath = path.join(libraryPath, 'albums');

export const songsPath = path.join(libraryPath, 'songs');

export async function ensureLibraryPathsExist() {

    await fs.mkdir(songsPath, {recursive: true});
    await fs.mkdir(albumsPath, {recursive: true});
}

export function getDefaultCoverPath(): string {

    if (app.isPackaged) {
        
        return path.join(process.resourcesPath, 'default-album-cover.jpg');
    } else {
        
        return path.join(__dirname, '../../public/default-album-cover.jpg');
    }
}