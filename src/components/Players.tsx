
import { useEffect, useState } from 'react';

import { translate } from '../lang/Language';

import '../styles/components/Players.css';
import '../styles/components/AppInput.css';

export interface Player {
    
    name: string;
    score: number;
    removing?: boolean;
    skips?: number; // Number of skips.
    guesses?: number; // Number of guesses.
    correctGuesses?: number; // Number of correct guesses.
    failedGuesses?: number; // Number of failed guesses.
}

function Players({ onPlayersChange }: { onPlayersChange?: (players: Player[]) => void }) {

    const [players, setPlayers] = useState<Player[]>([]);

    const [newPlayerName, setNewPlayerName] = useState<string>('');

    const handleNewPlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPlayerName(e.target.value);
    }

    async function setPlayersFromStorage() {
    
        const storedPlayers = sessionStorage.getItem('players');

        if (storedPlayers) {
            setPlayers(JSON.parse(storedPlayers));
            onPlayersChange?.(JSON.parse(storedPlayers));
        }
    }

    useEffect(() => {

        setPlayersFromStorage();

    }, []);

    const addPlayer = (name: string) => {

        const newPlayer: Player = { name, score: 0, skips: 0, guesses: 0, correctGuesses: 0, failedGuesses: 0};
        const updatedPlayers = [...players, newPlayer];
        setPlayers(updatedPlayers);

        sessionStorage.setItem('players', JSON.stringify(updatedPlayers));
        setNewPlayerName('');
        onPlayersChange?.(updatedPlayers);
    }

    const removePlayer = (index: number) => {

        const updatedPlayers = [...players];
        updatedPlayers.splice(index, 1);
        setPlayers(updatedPlayers);

        sessionStorage.setItem('players', JSON.stringify(updatedPlayers));
        onPlayersChange?.(updatedPlayers);
    }

    return (
        
        <div className="players">

            <div className="player-list">
            {players.map((player, index) => (

                <div key={index} className={`player ${player.removing ? 'removing' : ''}`}>

                    <span>{player.name}</span>

                    <div className="remove-player-button" onClick={() => {
                        
                        setPlayers(prev =>
                            prev.map((p, i) => i === index ? { ...p, removing: true } : p)
                        );
                        
                        setTimeout(() => removePlayer(index), 150);
                        
                    }}>
                        <i className="bi bi-trash-fill"></i>
                    </div>

                </div>
            ))}
            </div>
            
            <form className="add-player-tab" onSubmit={(e) => {
                e.preventDefault();
                if (newPlayerName) {
                    addPlayer(newPlayerName);
                }
            }}>

                <input className="app-input" type="text" placeholder={translate('players/input_placeholder')} value={newPlayerName} onChange={handleNewPlayerNameChange} />
                <button className="app-input-button" disabled={!newPlayerName} onClick={() => addPlayer(newPlayerName)}>
                    <i className="bi bi-person-fill-add"></i>
                </button>

            </form>

        </div>

    );

}

export default Players;