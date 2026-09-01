import { useNavigate } from 'react-router-dom'
import { useState } from 'react';

import ActiveAlbumsWindow from '../components/ActiveAlbumsWindow';
import GameConfig from '../components/GameConfig';
import Players, { type Player } from '../components/Players';
import { translate } from '../lang/Language';

import '../styles/pages/Lobby.css';
import '../styles/components/AppButton.css'

function Lobby() {

    const navigate = useNavigate();

    const [players, setPlayers] = useState<Player[]>([]);

    return(
        <div className="lobby">

            <button className="app-button" onClick={() => navigate('/')} >
                <i className="bi bi-caret-left-fill" />
                {translate('lobby/back_button')}
            </button>

            <div className="parent">

                <div className="child left">

                    <div className="section">

                        <h1>{translate('lobby/players')}</h1>
                        
                        <Players onPlayersChange={(players) => setPlayers(players)} />
                        
                    </div>

                    <div className="divider" />

                    <div className="section left">

                        <h1>{translate('lobby/selected_albums')}</h1>

                        <ActiveAlbumsWindow />

                    </div>
                    
                </div>

                <div className="child right">

                    <h1>{translate('lobby/game_config')}</h1>
                    
                    <GameConfig />
                    
                    <button className="app-button" disabled={players.length === 0 || players.some(p => p.removing)} onClick={() => navigate('/game')} >
                        {translate('lobby/start_game_button')}
                    </button>

                </div>

            </div>


        </div>
    )
}

export default Lobby