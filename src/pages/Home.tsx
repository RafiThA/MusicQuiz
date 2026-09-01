import { useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react';

import { SelectedAlbumsContext } from '../components/AppContext';
import AlbumLibrary from '../components/AlbumLibrary';
import Settings from '../components/Settings';
import {translate} from '../lang/Language';

import '../styles/pages/Home.css'
import '../styles/components/AppButton.css'

function Home() {

    const navigate = useNavigate();

    const [reload, setReload] = useState<boolean>(false);
    const [selectedAlbums, ] = useContext(SelectedAlbumsContext);

    return(
        <div className="home">

            <Settings onChange={() => {setReload(!reload)}} />

            <h1>Music Quiz</h1>

            <span className="subtitle">{translate('home/choose_album')}</span>

            <AlbumLibrary />

            <button className="app-button medium" disabled={selectedAlbums.length === 0} onClick={() => navigate('/lobby')}>
                {translate('home/play_button')}
            </button>
        </div>
    
    )
}

export default Home