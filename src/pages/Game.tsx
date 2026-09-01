import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'

import { SelectedAlbumsContext } from '../components/AppContext';
import SongsSelector from '../components/SongsSelector';
import type { Player } from '../components/Players';
import AnimatedNumber from '../components/AnimatedNumber';
import { translate } from '../lang/Language';
import AudioSpectrum from '../components/AudioSpectrum';
import Spinner from '../components/Spinner';

import '../styles/pages/Game.css'
import '../styles/pages/GameInfoMenus.css'

function Game() {

    const navigate = useNavigate();

    //* DATA RELATED.

        // Selected albums from the start.
        const selectedAlbums = useContext(SelectedAlbumsContext)[0];

        // Songs from the selected albums.
        const [songs, setSongs] = useState<Song[]>([]);

        // Randomized songs from the selected albums.
        const [shuffledSongs, setShuffledSongs] = useState<Song[]>([]);

        // Stores the incorrect guesses for the current round.
        const [failedSongs, setFailedSongs] = useState<Song[]>([]);


    //* AUDIO RELATED

        // Audio element reference.
        const audioRef = useRef(new Audio());

        const [isPlaying, setIsPlaying] = useState<boolean>(false);
        const [isLoading, setIsLoading] = useState<boolean>(false);

        const [randomStartTime, setRandomStartTime] = useState<number>(0);


    //* GUESS RELATED

        // The song that the player has to guess.
        const [guessSong, setGuessSong] = useState<Song | null>(null);

        // The song that the player has selected as their answer.
        const [playerAnswerSong, setPlayerAnswerSong] = useState<Song | null>(null);
    

    //* PLAYER RELATED

        // Players and their scores.
        const [players, setPlayers] = useState<Player[]>(() => {

            const storedPlayers = sessionStorage.getItem('players');

            if (!storedPlayers) {
                return [];
            } else {

                return (JSON.parse(storedPlayers)).sort(() => Math.random() - 0.5);
            }
        });

        // The index of the current player whose turn it is.
        const [playerTurn, setPlayerTurn] = useState<number>(0);


    //* GAME CONFIG RELATED

        const guessingPoints: number = parseInt(sessionStorage.getItem('pointsForGuessing') || '1000');
        const failPoints: number = parseInt(sessionStorage.getItem('failPoints') || '-500');
        const skipPoints: number = parseInt(sessionStorage.getItem('skipPoints') || '-100');

        const playbackType: string = sessionStorage.getItem('playbackType') || 'random-start';
        const targetScore: number = parseInt(sessionStorage.getItem('targetScore') || '10000');

    //* GAME VARIABLES

        const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
        const [currentRound, setCurrentRound] = useState<number>(0);

        const veryHardStep = 0.1;
        const hardStep = 0.5;
        const mediumStep = 1;
        const easyStep = 5;
        const veryEasyStep = 10;

        const [currentStep, setCurrentStep] = useState<number>(veryHardStep);


    //* ANIMATION RELATED

        // For the timeline animation.
        const [currentTime, setCurrentTime] = useState<number>(0);
        const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    //* MISC

        // Reset the player's answer when the round changes.
        const [resetPlayerAnswer, setResetPlayerAnswer] = useState<number>(0);

    //* MENUS

        const [showRoundResume, setShowRoundResume] = useState<boolean>(false);
        const [showGameOver, setShowGameOver] = useState<boolean>(false);

        const [correctGuess, setCorrectGuess] = useState<boolean | null>(null);
        const [pointsEarned, setPointsEarned] = useState<number[]>([]);
        const [totalPointsEarned, setTotalPointsEarned] = useState<number>(0);

        const [gameOverCause, setGameOverCause] = useState<string>('');

    //* PLAYER STATS

        const guesses = useRef<number>(0);
        const correctGuesses = useRef<number>(0);
        const failedGuesses = useRef<number>(0);
        const skips = useRef<number>(0);


    // Load all songs from the selected albums and shuffle them.
    const getSelectedAlbumsSongs = async () => {

        const selectedSongs: Song[] = [];

        for (const album of selectedAlbums) {

            const songsByAlbum = await window.db.getSongsByAlbum(album.id);

            // Add album and artist information to each song.
            songsByAlbum.forEach((song) => {
                song.album = album.title;
                song.artist = album.artist;
                song.albumId = album.id;
            });

            selectedSongs.push(...songsByAlbum);
        }

        const shuffled = [...selectedSongs].sort(() => Math.random() - 0.5);

        setSongs(selectedSongs.sort((a, b) => a.title.localeCompare(b.title)));
        setShuffledSongs(shuffled);
    }

    useEffect(() => {
                
        getSelectedAlbumsSongs();
        audioRef.current.crossOrigin = 'anonymous';

        
        return () => {
            
            // Pause the audio when the component unmounts.
            if (!audioRef.current.paused) {

                audioRef.current.pause();
            }

            // Reset players' scores to 0 for a new game.
            players.map((player) => {
                player.score = 0;
                player.skips = 0;
                player.guesses = 0;
                player.correctGuesses = 0;
                player.failedGuesses = 0;
            });

            sessionStorage.setItem('players', JSON.stringify(players));
        }

    }, []);

    useEffect(() => {

        if (shuffledSongs.length === 0) return;

        const initialRound = () => {
            
            // Select the current round song.
            setGuessSong(shuffledSongs[currentRound]);

            // Load the audio for the current round song.
            loadAudio(shuffledSongs[currentRound]?.id, veryEasyStep);

            // Select the current player.
            setPlayerTurn(currentRound % players.length);
        }

        initialRound();

        setLoadingStatus(false);

    }, [shuffledSongs]);

    const addFailedSong = (song: Song) => {

        setFailedSongs([...failedSongs, song]);
    }

    const updatePlayer = (points: number, updateStats: boolean = false) => {

        let updated: Player[] = [];

        players.map((player, i) => {

            updated.push({ ...player });

            if (playerTurn === i) {
                
                updated[i].score += points;
            }

            if (updateStats && playerTurn === i) {
                
                updated[i].guesses! += guesses.current;
                updated[i].correctGuesses! += correctGuesses.current;
                updated[i].failedGuesses! += failedGuesses.current;
                updated[i].skips! += skips.current;
            }

        })

        setPlayers(updated)
        sessionStorage.setItem('players', JSON.stringify(updated));

        if (updateStats) {
            guesses.current = 0;
            correctGuesses.current = 0;
            failedGuesses.current = 0;
            skips.current = 0;
        }
    }

    const nextRound = () => {

        const nextIndex = currentRound + 1;

        // Check if the game is over.
        if (players[playerTurn].score >= targetScore) {

            setGameOverCause(`${players[playerTurn].name} ${translate('game/player_reached_target_score_of')} ${targetScore} ${translate('game/points')}`);
            setShowGameOver(true);
            return;
        }

        // Check if there are more songs to play.
        if (nextIndex >= shuffledSongs.length) {

            setGameOverCause(`${translate('game/no_more_songs_to_play')}`);
            setShowGameOver(true);
            return;
        }

        // Reset the current step to the very hard step.
        setCurrentStep(veryHardStep);

        // Reset the player's answer.
        setPlayerAnswerSong(null);
        setResetPlayerAnswer(prev => prev + 1);        

        // Move to the next round.
        setCurrentRound(nextIndex);
        setGuessSong(shuffledSongs[nextIndex]);
        loadAudio(shuffledSongs[nextIndex]?.id, veryEasyStep);
        setPlayerTurn(nextIndex % players.length);
    }

    const nextStep = () => {

        if (currentStep === veryHardStep) {
            setCurrentStep(hardStep);
        } else if (currentStep === hardStep) {
            setCurrentStep(mediumStep);
        } else if (currentStep === mediumStep) {
            setCurrentStep(easyStep);
        } else if (currentStep === easyStep) {
            setCurrentStep(veryEasyStep);
        }

        // Reset the player's answer.
        setPlayerAnswerSong(null);
        setResetPlayerAnswer(prev => prev + 1);
    }

    const handleGuess = () => {

        guesses.current += 1;

        // Check if the song is right.
        if ((playerAnswerSong && guessSong) && playerAnswerSong.id === guessSong.id) {
            
            correctGuesses.current += 1;

            // Update the score and stats.
            updatePlayer(guessingPoints, true);
            pointsEarned.push(guessingPoints);
            
            setCorrectGuess(true);
            setTotalPointsEarned(pointsEarned.reduce((acc, curr) => acc + curr, 0));

            setShowRoundResume(true);

        } else {

            // Add the song to the failed songs list.
            addFailedSong(playerAnswerSong as Song);

            failedGuesses.current += 1;

            // Update the score.
            if (currentStep === veryEasyStep) {

                updatePlayer(failPoints, true);
                pointsEarned.push(failPoints);
                
                setCorrectGuess(false);
                setTotalPointsEarned(pointsEarned.reduce((acc, curr) => acc + curr, 0));
                
                setShowRoundResume(true);

            } else {

                updatePlayer(failPoints);
                pointsEarned.push(failPoints);

                nextStep();
            }
        }
    }

    const handleSkip = () => {

        // Skip
        addFailedSong({id: 'skip', title: '', artist: '', album: '', duration: 0});

        skips.current += 1;

        // Update the score.
        if (currentStep !== veryEasyStep) {

            updatePlayer(skipPoints);
            pointsEarned.push(skipPoints);

            nextStep();
        }
    }
    
    const loadAudio = async (songId: string, clipMaxDuration: number) => {
    
        setIsLoading(true);

        if (!audioRef.current.paused) {

            audioRef.current.pause();
        }

        audioRef.current.src = `audio://songs/${songId}.mp3`;

        const songDuration = songs.find(song => song.id === songId)?.duration || -1;

        if (songDuration === -1) {
            setIsLoading(false);
            return;
        }

        // Get the start time.
        if (playbackType === 'random-start') {

            setRandomStartTime(Math.max(0, Math.random() * (songDuration - clipMaxDuration)));
        
        } else if (playbackType === 'from-start') {

            setRandomStartTime(0);
        }

        audioRef.current.addEventListener('canplaythrough', () => {

            setIsLoading(false);

        }, { once: true});
    }

    const playSongClip = async (clipDuration: number) => {

        if (isPlaying) {

            audioRef.current.pause();
            setIsPlaying(false);
            clearInterval(intervalRef.current);
            setCurrentTime(0);

            return;
        }

        const endTime = randomStartTime + clipDuration;

        const checkEnd = () => {

            if (audioRef.current.currentTime >= endTime) {

                audioRef.current.pause();
                setIsPlaying(false);
                clearInterval(intervalRef.current);
                setCurrentTime(0);
                
                audioRef.current.removeEventListener('timeupdate', checkEnd);
            }
        };

        audioRef.current.currentTime = randomStartTime;

        

        audioRef.current.addEventListener('timeupdate', checkEnd);

        audioRef.current.addEventListener('seeked', () => {

            audioRef.current.play();

            intervalRef.current = setInterval(() => {
                setCurrentTime(audioRef.current.currentTime - randomStartTime);
            }, 100);

            setIsPlaying(true);

            setIsLoading(false);

        }, { once: true});
    };

    return(
        
        <div className="game">

            {loadingStatus && (
                <div className="game-loading">
                    <Spinner />
                    <span>{translate('common/loading')}</span>
                </div>
            )}

            {showRoundResume && (
                <div className="round-resume bg">
                    <div className="content">

                        <div className="header">
                            <h1>{translate('game/round')} {currentRound + 1}</h1>
                            <span>{translate('game/summary')}</span>
                            
                        </div>

                        <div className="body">

                            <div className="section">
                                {correctGuess && correctGuess === true ? (
                                    <span className="guess-info correct">{translate('game/correct_guess_label')}</span>
                                ): (
                                    <span className="guess-info incorrect">{translate('game/incorrect_guess_label')}</span>
                                )}
                            </div>

                            <div className="section">

                                <span className="label">{translate('game/the_song_was')}:</span>
                                <div className="guess-song">

                                    <div className="cover">
                                        <img draggable={false} src={`image://albums/${guessSong?.albumId}.jpeg`} alt={guessSong?.title} />
                                    </div>

                                    <div className="bg" style={{backgroundImage: `url(image://albums/${guessSong?.albumId}.jpeg)`}} />
                                    
                                    <div className="info">
                                        <span>{guessSong?.title}</span>
                                        <span>{guessSong?.artist}</span>
                                        <span>{guessSong?.album}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="double-section">

                                <div className="left">

                                    <span className="label">{translate('game/attempts')}</span>
                                    
                                    <div className="failed-songs">
                                        {failedSongs.map((song, index) => (
                                            <div className="songs" key={index}>
                                            {song.id === 'skip' ? (
                                                <>
                                                    <i className="bi bi-dash-lg" />
                                                    <span className="info">{translate('game/skipped')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-x-lg" style={{ color: 'var(--app-red)'}} />
                                                    <span className="info">{song.title} - {song.artist} - {song.album}</span>
                                                </>
                                            )}

                                                {pointsEarned[index] > 0 ? (
                                                    <span className="points positive">+{pointsEarned[index]}</span>
                                                ) : (
                                                    <span className="points negative">{pointsEarned[index]}</span>
                                                )}
                                            </div>

                                        ))}

                                        {failedSongs.length < 5 && (
                                            <div className="songs">
                                                <i className="bi bi-check-lg" style={{ color: 'var(--app-green)'}}/>
                                                <span className="info">{guessSong?.title} - {guessSong?.artist} - {guessSong?.album}</span>
                                                <span className="points positive">+{pointsEarned[pointsEarned.length - 1]}</span>
                                            </div>
                                        )}

                                    </div>

                                </div>

                                <div className="right">
                                    <span className="label">{translate('game/total_points_earned_this_round')}</span>
                                    <AnimatedNumber value={totalPointsEarned} className="total-points-earned" fromStart/>
                                    <span className="label">{players[playerTurn]?.name}</span>
                                </div>

                            </div>
                            
                            <div className="section next-round-button">
                                <button className="app-button" onClick={() => {
                                    setShowRoundResume(false);
                                    setFailedSongs([]);
                                    setCorrectGuess(null);
                                    setPointsEarned([]);

                                    nextRound();
                                }}>
                                    {translate('game/continue_button')}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {showGameOver && (
                <div className="game-over bg">
                    <div className="content">

                        <div className="header">
                            <h1>{translate('game/game_over')}</h1>
                            <span>{gameOverCause}</span>
                        </div>

                        <div className="body">

                            <div className="players">
                            {players.sort((a, b) => b.score - a.score).map((player, index) => (

                                <div className={`player ${index === 0 ? 'first' : ''}${index === 1 ? 'second' : ''}${index === 2 ? 'third' : ''}`} key={index}>
                                    {index === 0 && <span className="medal">🥇</span>}
                                    {index === 1 && <span className="medal">🥈</span>}
                                    {index === 2 && <span className="medal">🥉</span>}
                                    <span className="name">{index+1}º {player.name}</span>
                                    <span className="points">{player.score} pts</span>

                                    <div className="stats">
                                        <span style={{ color: 'color-mix(in srgb, var(--app-green) 50%, white)' }}>
                                            {(player.correctGuesses! / player.guesses! * 100 || 0).toFixed(0)}% {translate('game/precision')}
                                        </span>
                                        <span style={{ color: 'color-mix(in srgb, var(--app-red) 50%, white)' }}>
                                            {(player.failedGuesses! / player.guesses! * 100 || 0).toFixed(0)}% {translate('game/failures')}
                                        </span>
                                        <span>
                                            {player?.skips} {translate('game/skips')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            </div>

                            <button className="app-button finish-button" onClick={() => navigate('/lobby')} >
                                {translate('game/back_to_lobby_button')}
                            </button>

                        </div>

                        

                    </div>
                </div>
            )}


            <button className="app-button" onClick={() => navigate('/lobby')} >
                <i className="bi bi-caret-left-fill" />
                {translate('game/exit_button')}
            </button>

            <div className="parent">

                <div className="child left">

                    <div className="section">

                        <h1>{translate('game/round')} {currentRound + 1}</h1>

                        <div className="players">
                            {players.map((player: Player, index: number) => (
                                
                                index === playerTurn ? (
                                    
                                    <div className="player current" key={index}>
                                        <span>{player.name}</span>
                                        <AnimatedNumber value={player.score} duration={500} />
                                    </div>

                                ) : (

                                    <div className="player" key={index}>
                                        <span>{player.name}</span>
                                        <AnimatedNumber value={player.score} duration={500}/>
                                    </div>
                                )
                            ))}
                        </div>

                    </div>

                    <div className="section">

                        <div className="failed-songs">

                            <h1>{translate('game/attempts')}</h1>

                            {failedSongs.length > 0 && (
                                <div className="songs">
                                    {failedSongs.map((song, index) => (

                                        song.id === 'skip' ? (
                                            <span key={index}>{translate('game/skipped')}</span>
                                        ) : (
                                            <span key={index}>{song.title} - {song.artist} - {song.album}</span>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>

                <div className="child right">

                    <div className="section visualizer">
                        <AudioSpectrum className="audio-spectrum" audioRef={audioRef} activate={isPlaying}/>
                    </div>

                    <div className="section time">
                        
                        <div className="timeline">
                            
                            <div className={`current ${isPlaying ? 'playing' : ''}`} style={{ width: `${(currentTime / currentStep) * 100}%` }} />
                            
                        </div>

                        <span>{currentStep} {translate('common/seg')}</span>

                    </div>

                    <div className="section selector">
                        
                        <SongsSelector songs={songs} reset={resetPlayerAnswer} onSelectSong={(song) => {
                            setPlayerAnswerSong(song);
                        }}/>

                    </div>

                    <div className="section buttons">

                        <div className="play-skip-buttons">

                            <button className="app-button play" onClick={() => playSongClip(currentStep)} disabled={isLoading}>
                                {isPlaying ? (<i className="bi bi-pause-fill"></i>) : (<i className="bi bi-play-fill"></i>)}
                            </button>
                            
                            <button className="app-button skip" onClick={handleSkip} disabled={isLoading || isPlaying || currentStep === veryEasyStep}>
                                {translate('game/skip_button')}
                                <i className="bi bi-skip-forward-fill" />    
                            </button>
                        </div>

                        <div className="other-buttons">
                            <button className="app-button guess" onClick={handleGuess} disabled={isLoading || isPlaying || !playerAnswerSong}>
                                {translate('game/guess_button')}
                            </button>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Game;
