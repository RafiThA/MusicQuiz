import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SelectedAlbumsContext } from './components/AppContext.tsx'

import Home from './pages/Home.tsx'
import Lobby from './pages/Lobby.tsx'
import Game from './pages/Game.tsx'
import Spinner from './components/Spinner.tsx'


// Styles.

import 'bootstrap-icons/font/bootstrap-icons.css' // Icons.

import './styles/App.css'


function App() {
	
	const selectedAlbumsState = useState<Album[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {

		async function loadSettings() {

			const DEFAULT_LANGUAGE = 'engb';
			const DEFAULT_THEME = '#7B2CBF';

			try {

				let language = await window.settings.get('language');
    			let theme = await window.settings.get('theme');

				console.log('[APP] Loaded settings:', { language, theme });

				if (!language) {
					language = DEFAULT_LANGUAGE;
					await window.settings.set('language', language);
					console.log('[APP] Language setting not found. Set to default:', language);
				}

				if (!theme) {
					theme = DEFAULT_THEME;
					await window.settings.set('theme', theme);
					console.log('[APP] Theme setting not found. Set to default:', theme);
				}

				window.sessionStorage.setItem('language', language);
				window.sessionStorage.setItem('theme', theme);
				document.documentElement.style.setProperty('--app-theme-color', theme);

			} catch (error) {

				console.error('Error loading settings:', error);

				window.sessionStorage.setItem('language', DEFAULT_LANGUAGE);
				window.sessionStorage.setItem('theme', DEFAULT_THEME);

				document.documentElement.style.setProperty('--app-theme-color', DEFAULT_THEME);
			}

			setLoading(false);
		}

		loadSettings();

	}, []);
	
	if (loading) {
		
		return(

			<div className="app-loading">
				<Spinner />
			</div>
		);
	} // Wait until the settings are loaded.

	return (
		<SelectedAlbumsContext.Provider value={selectedAlbumsState}>
			<HashRouter>
				<Routes>
					
					<Route path="/" element={<Home />} />
					<Route path="/lobby" element={<Lobby />} />
					<Route path="/game" element={<Game />} />

					{/* Default route handler*/}
					<Route path="*" element={<Navigate to="/" />} />

				</Routes>
			</HashRouter>
		</SelectedAlbumsContext.Provider>
	)
}

export default App
