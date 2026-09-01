import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import '../styles/components/Select.css';

function Select({ options, defaultValue, onChange }:{
    options: { value: string; label: string }[];
    defaultValue?: string;
    onChange?: (value: string) => void;
}) {

	const [isActive, setIsActive] = useState(false);
	const [selectValue, setSelectValue] = useState<string>(defaultValue || options[0]?.label || '');

	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {

        function handleClickOutside() {
            
            const selectedOption = options.find(option => option.value === defaultValue);
			
            if (selectedOption) {

				setSelectValue(selectedOption.label);
			}
        }

		if (defaultValue) {

            handleClickOutside();
		}

	}, [defaultValue, options]);

	return (
		
		<div className="app-select">

            <div className={`selector ${isActive ? 'active' : ''}`}  ref={inputRef}

                onClick={() => {

                    const rect = inputRef.current?.getBoundingClientRect();
                    if (rect) {
                        setPosition({
                            top: rect.bottom + 8,   // 8px de margen bajo el input
                            left: rect.left,
                            width: rect.width,
                        });
                    }

                    setIsActive(true);
                }}
            >
				<span>{selectValue}</span>	
			</div>

            {isActive && createPortal(

                <div className="options" onClick={(e) => {
                    
                    if (e.target === e.currentTarget) {
                        setIsActive(false);
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
                        setIsActive(false);
                        e.stopPropagation();
                    }}></div>

                    <div className="content">

                        {options.map((option, index) => (

                            <div key={index} className="item" onClick={() => {
                                onChange?.(option.value);
								setSelectValue(option.label);
                                setIsActive(false);
                            }}>

                                <span>{option.label}</span>

                            </div>
                        ))}
                    </div>

                </div>
                , document.body
            )}

        </div>

	);
}

export default Select;