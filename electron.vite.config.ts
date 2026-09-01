import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({

	main: {
		build: {
			lib: {
				entry: 'electron/main/index.ts',
			},
		}
	},

	preload: {
		build: {
			lib: {
				entry: 'electron/preload/index.ts',
				formats: ['cjs'],
			},
			rollupOptions: {
				external: ['electron'],
				output: {
					entryFileNames: 'index.js',
				},
			}
		}
	},

	renderer: {
		root: '.',
		base: './',
		plugins: [react()],
		build: {
      		rollupOptions: {
        	input: resolve(__dirname, 'index.html'),
      },
    },
	}

})
