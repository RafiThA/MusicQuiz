
import React, { useEffect, useState, useContext} from 'react';
import { SelectedAlbumsContext } from './AppContext';
import { translate } from '../lang/Language';
import Spinner from './Spinner';

import '../styles/components/AlbumLibrary.css'

function AlbumLibrary() {

    // All albums.
    const [albums, setAlbums] = useState<Album[]>([]);

    const [selectedAlbums, setSelectedAlbums] = useContext(SelectedAlbumsContext);

    // All songs in the selected album.
    const [songs, setSongs] = useState<Song[]>([]);

    // SONGS MENU: The currently selected album.
    const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);

    // SONGS MENU: Is the menu active.
    const [showingSongs, setShowingSongs] = useState<boolean>(false);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClosing = () => {

        setIsClosing(true);

        setTimeout(() => {
            setShowingSongs(false);
            setIsClosing(false);
        }, 250);

    }

    const fetchAlbums = async () => {
        
        const albums = await window.db.getAlbums();

        setAlbums(albums);
        
    }

    const fetchSongs = async (albumId: string) => {

        const songs = await window.db.getSongsByAlbum(albumId);
        setSongs(songs);
    }

    const handleShowSongs = async (album: Album) => {

        await fetchSongs(album.id);
        setCurrentAlbum(album);
        setShowingSongs(true);
    }

    const switchActiveAlbum = (album: Album) => {

        const isSelected = selectedAlbums.some((selectedAlbum) => selectedAlbum.id === album.id);

        if (isSelected) {

            setSelectedAlbums(selectedAlbums.filter((selectedAlbum) => selectedAlbum.id !== album.id));

        } else {

            setSelectedAlbums([...selectedAlbums, album]);
        }
    }

    useEffect(() => {

        fetchAlbums();

    }, []);

    if (isLoading) {

        return(

            <div className="loading-album-library">
                <Spinner />
                <span>{translate('common/loading')}</span>
            </div>
        );
    }

    return (
        <>
            {showingSongs && (

                <div className={`song-list bg ${isClosing ? 'closing' : ''}`} onClick={() => handleClosing()}>
                    
                    <div className={`content ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>

                        <div className="header">

                            <div className="title">
                                <h2>{currentAlbum?.title}</h2>

                                <span>{currentAlbum?.artist}</span>
                            </div>

                            <div className="close-button" onClick={handleClosing}>
                                <i className="bi bi-x-lg" />
                            </div>

                        </div>

                        <div className="body">

                            {songs.map((song) => (
                                
                                <React.Fragment key={song.id}>

                                    <div className="section">

                                        <span>{song.title}</span>

                                        <div className="song-remove-button" onClick={() => {window.db.deleteSong(song.id); fetchSongs(currentAlbum?.id || '');}}>
                                            <i className="bi bi-trash-fill" />
                                        </div>

                                    </div>

                                    <div className="divider" />

                                </React.Fragment>
                            ))}

                        </div>
                    </div>
                </div>

            )}

            <div className="album-library-buttons">
                <button onClick={() => setSelectedAlbums(albums)}>{translate('album_library/select_all')}</button>
                <button onClick={() => setSelectedAlbums([])}>{translate('album_library/deselect_all')}</button>
            </div>

            <div className="album-library">

                <div className="add-box">
                    <i onClick={async () => {
                    
                        setIsLoading(true);
                        
                        try {
                            const result = await window.file.getDir();
                            
                            if (result && 'path' in result) {
                                await window.app.saveToLibrary(result.path);
                            }
                        } catch (error) {
                            console.error('Error al agregar álbum:', error);
                        }
                        
                        fetchAlbums();
                        setIsLoading(false);
                    }}

                    className="bi bi-plus" />
                </div>
                    
                {albums.map((album) => (
                    

                    <div key={album.id} className="album-item">

                        {selectedAlbums.find((albumItem) => albumItem.id === album.id) ? (

                            <img className="selected" draggable={false} onClick={() => switchActiveAlbum(album)} src={`image://albums/${album.id}.jpeg`} alt={album.title} />
                        ) : (

                            <img draggable={false} onClick={() => switchActiveAlbum(album)} src={`image://albums/${album.id}.jpeg`} alt={album.title} />
                        )}

                        
                        <button className="edit-button" onClick={() => handleShowSongs(album)}>
                            <i className="bi bi-pencil-fill" />
                        </button>

                        <button className="remove-button" onClick={async() => 
                            {
                                await window.db.deleteAlbum(album.id);
                                fetchAlbums();
                            }}>
                            <i className="bi bi-trash-fill" />
                        </button>
                        
                    </div>

                ))}

            </div>
        </>
    );
}

export default AlbumLibrary;