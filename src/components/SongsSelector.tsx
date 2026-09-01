import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { translate } from '../lang/Language';

import '../styles/components/SongSelector.css';

function SongsSelector({ songs, reset, onSelectSong }: {
    songs: Song[];
    reset: number;
    onSelectSong: (song: Song) => void;
}) {

    const [searchFieldIsActive, setSearchFieldIsActive] = useState(false);

    const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);

    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {

        if (reset && inputRef.current) {

            inputRef.current.value = '';
            setSearchFieldIsActive(false);
            setFilteredSongs([]);
        }

    }, [reset]);

    return (

        <div className="songs-selector">

            <input ref={inputRef} type="text" placeholder={translate('song_selector/search_placeholder')}

                onFocus={(e) => {

                    const rect = inputRef.current?.getBoundingClientRect();
                    if (rect) {
                        setPosition({
                            top: rect.bottom + 8,
                            left: rect.left,
                            width: rect.width,
                        });
                    }

                    setSearchFieldIsActive(true);
                    setFilteredSongs(songs);
                    e.target.value = '';
                }}
                onChange={(e) => {

                    if (e.target.value === '') {
                        setFilteredSongs(songs);
                        return;
                    }

                    const searchTerm = e.target.value.toLowerCase();
                    const filteredSongs = songs.filter((song) =>
                        song.title.toLowerCase().includes(searchTerm) ||
                        song.artist.toLowerCase().includes(searchTerm) ||
                        song.album.toLowerCase().includes(searchTerm)
                    );
                    setFilteredSongs(filteredSongs);
                }}
            />

            {searchFieldIsActive && createPortal(

                <div className="search-results" onClick={(e) => {
                    
                    if (e.target === e.currentTarget) {
                        setSearchFieldIsActive(false);
                    }

                    e.stopPropagation();
                }}
                style={{
                    top: position.top,
                    left: position.left,
                    width: position.width,
                }}
                >
                    <div className="bg" onClick={(e) => {
                        setSearchFieldIsActive(false);
                        e.stopPropagation();
                    }}></div>

                    <div className="content">

                        {filteredSongs.map((song) => (

                            <div key={song.id} className="item" onClick={() => {
                                onSelectSong(song);
                                if (inputRef.current) {
                                    inputRef.current.value = `${song.title} - ${song.artist} - ${song.album}`;
                                }
                                setSearchFieldIsActive(false);
                            }}>

                                <span>{song.title} - {song.artist} - {song.album}</span>

                            </div>
                        ))}

                        {filteredSongs.length === 0 && (

                            <div className="no-results">

                                <span>{translate('song_selector/no_songs_found')}</span>

                            </div>
                        )}

                    </div>

                </div>
                , document.body
            )}

        </div>

    );

}

export default SongsSelector;