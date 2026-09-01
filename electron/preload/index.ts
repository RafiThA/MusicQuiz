import { contextBridge, ipcRenderer } from 'electron';

interface Song {
	id: string;
	title: string;
	artist: string;
	album: string;
	duration: number;
	path?: string;
	albumId?: string;
}

interface Album {
	id: string;
	title: string;
	artist: string;
	path?: string;
}

contextBridge.exposeInMainWorld('db', {

	// Songs
	getSongs: () => ipcRenderer.invoke('db:getSongs'),

	addSong: (song: Song) => ipcRenderer.invoke('db:addSong', song),

	getSpecificSong: (songId: string) => ipcRenderer.invoke('db:getSpecificSong', songId),

	getSongsByAlbum: (albumId: string) => ipcRenderer.invoke('db:getSongsByAlbum', albumId),

	deleteSong: (songId: string) => ipcRenderer.invoke('db:deleteSong', songId),

	// Albums
	getAlbums: () => ipcRenderer.invoke('db:getAlbums'),

	addAlbum: (album: Album) => ipcRenderer.invoke('db:addAlbum', album),

	getSpecificAlbum: (albumId: string) => ipcRenderer.invoke('db:getSpecificAlbum', albumId),

	deleteAlbum: (albumId: string) => ipcRenderer.invoke('db:deleteAlbum', albumId),
});

contextBridge.exposeInMainWorld('file', {

	getDir: () => ipcRenderer.invoke('file:getDir'),

});

contextBridge.exposeInMainWorld('app', {

	saveToLibrary: (filePath: string) => ipcRenderer.invoke('app:saveToLibrary', filePath),

});

contextBridge.exposeInMainWorld('settings', {

	get: (key: string) => ipcRenderer.invoke('settings:get', key),

	set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value),
});



