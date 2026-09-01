import { useEffect, useRef } from 'react';

import '../styles/components/AudioSpectrum.css';

function AudioSpectrum({ className, audioRef, activate, bins = 128 }: {
    className?: string;
    audioRef: React.RefObject<HTMLAudioElement>;
    activate: boolean;
    bins?: number;
}) {

    const canvas = useRef<HTMLCanvasElement>(null);
    const analyzer = useRef<AnalyserNode | null>(null);
    const frameId = useRef<number | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const sizeRef = useRef({ width: 0, height: 0 });

    // Setting up the audio analyzer when the component mounts.
    function setup() {

        if (analyzer.current) return; // Already set up.

        const context = new AudioContext();
        const node = context.createAnalyser();
        node.fftSize = bins * 2;

        const source = context.createMediaElementSource(audioRef.current!);
        source.connect(node);
        node.connect(context.destination);

        analyzer.current = node;
    }

    function draw() {

        const node = analyzer.current;
        const context = canvas.current?.getContext('2d');
        if (!node || !context) return;

        frameId.current = requestAnimationFrame(draw);

        const data = new Uint8Array(node.frequencyBinCount);
        node.getByteFrequencyData(data);

        const { width, height } = sizeRef.current!;

        context.clearRect(0, 0, width, height);

        const barWidth = width / data.length;

        // Styling 

        const styles = getComputedStyle(containerRef.current!);

        const gradient = context.createLinearGradient(0, 0, 0, height);
        const color = styles.getPropertyValue('--color').trim();
        const color2 = styles.getPropertyValue('--color2').trim();
        const color3 = styles.getPropertyValue('--color3').trim();

        gradient.addColorStop(0, color3);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, color);

        data.forEach((value, i) => {

            const barHeight = Math.max((value / 255) * height, 5);

            context.fillStyle = gradient;

            context.fillRect(
                i * barWidth, 
                height - barHeight, 
                barWidth - 1, 
                barHeight
            );

        });
    }

    useEffect(() => {

        if (!containerRef.current || !canvas.current) return;

        const {width, height} = containerRef.current.getBoundingClientRect();
        
        sizeRef.current = { width, height };

        canvas.current.width = width;
        canvas.current.height = height;

        setup();

        if (frameId.current === null) draw();
        
    }, []);

    useEffect(() => {

        if (!audioRef.current) return;

        if (activate) {

            setup();

            if (frameId.current === null) draw();

        } else if (frameId.current !== null) {
            
            cancelAnimationFrame(frameId.current);

            frameId.current = null; // Reset frameId.
        }

        return () => {

            if (frameId.current) cancelAnimationFrame(frameId.current); 
        }

    }, [activate]);

    return (
        <div ref={containerRef} className={`audio-spectrum ${className || ''}`}>
            <canvas id="audio-spectrum" ref={canvas} />
        </div>
    );
}

export default AudioSpectrum;