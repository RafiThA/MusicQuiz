import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'

import { registerIpcHandlers } from './ipc';
import { initDb } from './db';
import { ensureLibraryPathsExist } from './paths';

import './protocols';

const createWindow = () => {

	const win = new BrowserWindow({
		title: 'Music Quiz',
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
		}
	})

	win.maximize();
	
	
	if (!app.isPackaged) {
		// Desarrollo

		win.webContents.openDevTools()
		win.loadURL('http://localhost:5173');
		
	} else {
		// Producción

		win.removeMenu();
		win.loadFile(join(__dirname, '../renderer/index.html'));
	}	
}

// This method will be called when Electron has finished
app.whenReady().then(async() => {
	
	await initDb();
	await ensureLibraryPathsExist();
	registerIpcHandlers();
	createWindow();
	
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
