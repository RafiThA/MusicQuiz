import { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tooltip';

import { translate } from '../lang/Language';

import '../styles/components/GameConfig.css';
import '../styles/components/AppInput.css';
import Select from './Select';

function GameConfig() {

    const defaultGuessingPoints: number = 1000;
    const defaultFailPoints: number = -500;
    const defaultSkipPoints: number = -100;

    const defaultPlaybackType: string = 'random-start';
    const defaultTargetScore: number = 10000;


    const [guessingPoints, setGuessingPoints] = useState(parseInt(sessionStorage.getItem('pointsForGuessing') || defaultGuessingPoints.toString()) || defaultGuessingPoints);
    const guessingPointsRef = useRef<HTMLInputElement | null>(null);

    const [failPoints, setFailPoints] = useState(parseInt(sessionStorage.getItem('failPoints') || defaultFailPoints.toString()) || defaultFailPoints);
    const failPointsRef = useRef<HTMLInputElement | null>(null);

    const [skipPoints, setSkipPoints] = useState(parseInt(sessionStorage.getItem('skipPoints') || defaultSkipPoints.toString()) || defaultSkipPoints);
    const skipPointsRef = useRef<HTMLInputElement | null>(null);


    const [playbackType, setPlaybackType] = useState(sessionStorage.getItem('playbackType') || defaultPlaybackType);

    const [targetScore, setTargetScore] = useState(parseInt(sessionStorage.getItem('targetScore') || defaultTargetScore.toString()) || defaultTargetScore);
    const targetScoreRef = useRef<HTMLInputElement | null>(null);

    // Initialize the session storage with default values if they are not already set.
    useEffect(() => {

        if (!sessionStorage.getItem('pointsForGuessing')) sessionStorage.setItem('pointsForGuessing', defaultGuessingPoints.toString());
        if (!sessionStorage.getItem('failPoints')) sessionStorage.setItem('failPoints', defaultFailPoints.toString());
        if (!sessionStorage.getItem('skipPoints')) sessionStorage.setItem('skipPoints', defaultSkipPoints.toString());

        if (!sessionStorage.getItem('playbackType')) sessionStorage.setItem('playbackType', defaultPlaybackType);
        if (!sessionStorage.getItem('targetScore')) sessionStorage.setItem('targetScore', defaultTargetScore.toString());

    }, []);


    const handleGuessingPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setGuessingPoints(parseInt(e.target.value) || 0);
        sessionStorage.setItem('pointsForGuessing', e.target.value.toString());
    }

    const resetGuessingPoints = () => {

        setGuessingPoints(defaultGuessingPoints);
        sessionStorage.setItem('pointsForGuessing', defaultGuessingPoints.toString());

        if (guessingPointsRef.current) {
            guessingPointsRef.current.value = defaultGuessingPoints.toString();
        }
    }


    const handleFailPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setFailPoints(parseInt(e.target.value) || 0);
        sessionStorage.setItem('failPoints', e.target.value.toString());
    }

    const resetFailPoints = () => {

        setFailPoints(defaultFailPoints);
        sessionStorage.setItem('failPoints', defaultFailPoints.toString());

        if (failPointsRef.current) {
            failPointsRef.current.value = defaultFailPoints.toString();
        }
    }


    const handleSkipPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setSkipPoints(parseInt(e.target.value) || 0);
        sessionStorage.setItem('skipPoints', e.target.value.toString());
    }

    const resetSkipPoints = () => {

        setSkipPoints(defaultSkipPoints);
        sessionStorage.setItem('skipPoints', defaultSkipPoints.toString());

        if (skipPointsRef.current) {
            skipPointsRef.current.value = defaultSkipPoints.toString();
        }
    }


    const handlePlaybackTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {

        setPlaybackType(e.target.value);
        sessionStorage.setItem('playbackType', e.target.value);
    }


    const handleTargetScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setTargetScore(parseInt(e.target.value) || 1);
        sessionStorage.setItem('targetScore', (parseInt(e.target.value) || 1).toString());
    }

    const resetTargetScore = () => {

        setTargetScore(defaultTargetScore);
        sessionStorage.setItem('targetScore', defaultTargetScore.toString());

        if (targetScoreRef.current) {
            targetScoreRef.current.value = defaultTargetScore.toString();
        }
    }
    

    return (

        <div className="game-config">

            <div className="item">
                <Tooltip className="tooltip" anchorSelect=".guess" place="right">
                    {translate('game_config/guess_points_tooltip')}
                </Tooltip>

                <span className="guess">{translate('game_config/guess_points')}</span>
                <input className="app-input" ref={guessingPointsRef} type="number" defaultValue={guessingPoints} onChange={(e) => handleGuessingPointsChange(e)} />
                <button className="app-input-button" onClick={() => resetGuessingPoints()}>
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>

            <div className="item">
                <Tooltip className="tooltip" anchorSelect=".fail" place="right">
                    {translate('game_config/fail_penalty_tooltip')}
                </Tooltip>

                <span className="fail">{translate('game_config/fail_penalty')}</span>
                <input className="app-input" ref={failPointsRef} type="number" max={-1} defaultValue={failPoints} onChange={(e) => handleFailPointsChange(e)} />
                <button className="app-input-button" onClick={() => resetFailPoints()}>
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>

            <div className="item">
                <Tooltip className="tooltip" anchorSelect=".skip" place="right">
                    {translate('game_config/skip_penalty_tooltip')}
                </Tooltip>

                <span className="skip">{translate('game_config/skip_penalty')}</span>
                <input className="app-input" ref={skipPointsRef} type="number" min={-1} defaultValue={skipPoints} onChange={(e) => handleSkipPointsChange(e)} />
                <button className="app-input-button" onClick={() => resetSkipPoints()}>
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>

            <div className="item">
                <Tooltip className="tooltip" anchorSelect=".playback" place="right">
                    {translate('game_config/playback_type_tooltip')}
                </Tooltip>

                <span className="playback">{translate('game_config/playback_type')}</span>
                <Select options={[
                    { value: 'random-start', label: translate('game_config/playback_type_options/random-start') },
                    { value: 'from-start', label: translate('game_config/playback_type_options/from-start') }
                ]} defaultValue={playbackType} 
                    onChange={(value) => handlePlaybackTypeChange({ target: { value } } as React.ChangeEvent<HTMLSelectElement>)}
                />
                <button className="app-input-button invisible" />
            </div>

            <div className="item">
                <Tooltip className="tooltip" anchorSelect=".target" place="right">
                    {translate('game_config/target_score_tooltip')}
                </Tooltip>

                <span className="target">{translate('game_config/target_score')}</span>
                <input className="app-input" ref={targetScoreRef} type="number" min={1} defaultValue={targetScore} onChange={(e) => handleTargetScoreChange(e)} />
                <button className="app-input-button" onClick={() => resetTargetScore()}>
                    <i className="bi bi-arrow-clockwise"></i>
                </button>
            </div>

        </div>
    );
}

export default GameConfig;