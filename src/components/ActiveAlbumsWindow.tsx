import { useContext, useState, useEffect } from 'react';
import { SelectedAlbumsContext } from './AppContext';

import { translate } from '../lang/Language';

import '../styles/components/ActiveAlbumsWindow.css';

function ActiveAlbumsWindow() {

    const selectedAlbums = useContext(SelectedAlbumsContext)[0];
    const [songs, setSongs] = useState<Song[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {

        async function loadSongs() {

            const selectedSongs: Song[] = [];

            for (const album of selectedAlbums) {

                const songsByAlbum = await window.db.getSongsByAlbum(album.id);

                selectedSongs.push(...songsByAlbum);
            }

            setSongs(selectedSongs);
            setLoading(false);
        }

        loadSongs();
    })
    
    return (
        <div className="active-albums-window">
            
            <div className="header">
                {loading ? (
                    <span>Total: {translate('common/loading')}</span> 
                ) : (
                    <span>Total: {songs.length} {songs.length === 1 ? 'song' : 'songs'}</span> 
                )}
                   
            </div>

            <div className="body">

                {selectedAlbums.map((album) => (
                    
                    <div key={album.id} className="album-item">
                        
                        <div className="bg" style={{backgroundImage: `url(image://albums/${album.id}.jpeg)`}} />

                        <div className="cover">
                                <img draggable={false} src={`image://albums/${album.id}.jpeg`} alt={album.title} />
                        </div>

                        <div className="info">
                            <span>{album.title}</span>
                            <span>{album.artist}</span>
                            {loading ? (
                                <span>{translate('common/loading')}</span> 
                            ) : (
                                <span>{songs.filter((song) => song.album === album.id).length} {songs.filter((song) => song.album === album.id).length === 1 ? 'song' : 'songs'}</span>
                            )}
                            
                        </div>
                    </div>

                ))}

            </div>
        </div>
    )

}

export default ActiveAlbumsWindow