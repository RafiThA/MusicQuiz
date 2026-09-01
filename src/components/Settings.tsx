import { useState } from 'react';
import { Tooltip } from 'react-tooltip';

import Select from './Select';
import {translate} from '../lang/Language';
import packageJson from '../../package.json';

import '../styles/components/Settings.css'

function Settings({ onChange }: { onChange?: () => void }) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isClosing, setIsClosing] = useState<boolean>(false);

    const [language, setLanguage] = useState<string>(window.sessionStorage.getItem('language') || 'engb');
    const [theme, setTheme] = useState<string>(window.sessionStorage.getItem('theme') || '#7B2CBF');

    const handleLanguageChange = async (newLanguage: string) => {

        await window.settings.set('language', newLanguage); // Save to db.
        window.sessionStorage.setItem('language', newLanguage);
        setLanguage(newLanguage);
        onChange?.();
    }

    const handleThemeChange = async (newTheme: string) => {

        setTheme(newTheme);
        await window.settings.set('theme', newTheme); // Save to db.
        window.sessionStorage.setItem('theme', newTheme);
        document.documentElement.style.setProperty('--app-theme-color', newTheme);
    }

    const handleClosing = () => {

        setIsClosing(true);

        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 250);

    }

    return (
        <div className="settings">

            {isOpen && (
                <div className={`settings-menu bg ${isClosing ? 'closing' : ''}`} onClick={() => handleClosing()}>

                    <div className={`content ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>

                        <div className="header">

                            <h2>{translate('settings/title')}</h2>

                            <div className="close-button" onClick={() => handleClosing()}>
                                <i className="bi bi-x-lg" />
                            </div>

                        </div>

                        <div className="body">

                            <div className="section">
                                <Tooltip className="tooltip" anchorSelect=".language" place="right">
                                    {translate('settings/language_tooltip')}
                                </Tooltip>
                                <span className="language">{translate('settings/language')}</span>
                                <div className="option-wrapper">
                                    <Select
                                        options={[
                                            { value: 'engb', label: '🇬🇧 English (Great Britain)' },
                                            { value: 'enus', label: '🇺🇸 English (United States)' },
                                            { value: 'eses', label: '🇪🇸 Español (España)' },
                                            { value: 'esla', label: '🇲🇽 Español (Latinoamérica)' },
                                            { value: 'pt', label: '🇵🇹 Português *' },
                                            { value: 'ptbr', label: '🇧🇷 Português (Brasil) *' },
                                            { value: 'fr', label: '🇫🇷 Français *' },
                                            { value: 'de', label: '🇩🇪 Deutsch *' },
                                            { value: 'it', label: '🇮🇹 Italiano *' },
                                            { value: 'da', label: '🇩🇰 Dansk *' },
                                            { value: 'bg', label: '🇧🇬 Български *' },
                                            { value: 'ru', label: '🇷🇺 Русский *' },
                                            { value: 'zh-cn', label: '🇨🇳 中文 (简体) *' },
                                            { value: 'zh-tw', label: '🇹🇼 中文 (繁體) *' },
                                            { value: 'ja', label: '🇯🇵 日本語 *' },
                                            { value: 'ko', label: '🇰🇷 한국어 *' },
                                        ]}
                                        defaultValue={language}
                                        onChange={(value) => handleLanguageChange(value)}
                                    />
                                </div>
                                
                            </div>

                            <div className="divider" />

                            <div className="section">
                                <Tooltip className="tooltip" anchorSelect=".theme" place="right">
                                    {translate('settings/theme_tooltip')}
                                </Tooltip>
                                <span className="theme">{translate('settings/theme')}</span>
                                <div className="option-wrapper">
                                    <input type="color" value={theme} onChange={(e) => handleThemeChange(e.target.value)} />
                                    <button className="settings-reset" onClick={() => handleThemeChange('#7B2CBF')}>
                                        <i className="bi bi-arrow-counterclockwise" />
                                    </button>
                                </div>
                            </div>

                            <div className="divider" />

                            <div className="last-section">
                                
                                <span>
                                    Music Quiz v{packageJson.version} -{' '}
                                    <a href="https://github.com/RafiThA" target="_blank" rel="noreferrer">
                                        Rafael Molleja Jiménez
                                    </a>{' '}
                                    2026{' - '}
                                    <a href="https://buymeacoffee.com/rafaelmolln" target="_blank" rel="noreferrer">
                                        Support Me!
                                    </a>
                                </span>
                                
                            </div>

                        </div>

                    </div>

                </div>
            )}

            <div className="settings-box" onClick={() => setIsOpen(true)}>
                <i className={`bi bi-gear-fill ${!isOpen && 'animated'}`} />
            </div>
        </div>
    );
}

export default Settings;