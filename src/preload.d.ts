// Declaración de tipos para la API expuesta en el contexto de la ventana del navegador

declare global {

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

    interface Window {

        db: {
            
            getAlbums: () => Promise<Album[]>;
            addAlbum: (album: Album) => Promise<void>;
            getSpecificAlbum: (albumId: string) => Promise<Album | null>;
            deleteAlbum: (albumId: string) => Promise<void>;

            getSongs: () => Promise<Song[]>;
            getSongsByAlbum: (albumId: string) => Promise<Song[]>;
            addSong: (song: Song) => Promise<void>;
            getSpecificSong: (songId: string) => Promise<Song | null>;
            deleteSong: (songId: string) => Promise<void>;
        },

        file: {

            getDir: () => Promise< { path: string } >;

        },

        app: {
            saveToLibrary: (filePath: string) => Promise<void>;
        },

        settings: {

            get: (key: string) => Promise<string | null>;
            set: (key: string, value: string) => Promise<void>;
        }
    }

}

export {};