import { useState, useEffect, useRef } from 'react';

function AnimatedNumber({ value, duration = 1000, steps = 100, className, fromStart }: { value: number; duration?: number; steps?: number; className?: string; fromStart?: boolean }) {

    const [display, setDisplay] = useState(0);
    const prevValue = useRef(0);

    useEffect(() => {

        const start = fromStart ? 0 : prevValue.current;
        const increment = (value - start) / steps;
        let current = start;
        let step = 0;

        const interval = setInterval(() => {
            
            step++;
            current += increment;
            setDisplay(Math.round(current));

            if (step >= steps) {

                setDisplay(value);
                prevValue.current = value;
                clearInterval(interval);
            }
        }, duration / steps);

        return () => {
            prevValue.current = value;
            clearInterval(interval);
        };
        
    }, [value, fromStart, duration, steps]);

    return <span className={className}>{display}</span>;
};

export default AnimatedNumber;