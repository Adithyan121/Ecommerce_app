import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { FaCamera, FaTimes } from 'react-icons/fa';

const Scanner = ({ onScan, onClose }) => {
    const videoRef = useRef(null);
    const [error, setError] = useState('');
    const controlsRef = useRef(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        let active = true;
        let controls = null;

        const startScanning = async () => {
            try {
                // Wait for video element to be ready
                if (!videoRef.current) return;

                // Add a small delay to ensure previous streams are fully stopped
                await new Promise(resolve => setTimeout(resolve, 200));

                if (!active) return;

                controls = await codeReader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current,
                    (result, err, control) => {
                        if (result && active) {
                            onScan(result.getText());
                            // Optional: stop scanning immediately on success? 
                            // control.stop(); 
                        }
                    }
                );
                controlsRef.current = controls;
            } catch (err) {
                if (active) {
                    console.error("Camera Error:", err);
                    setError('Camera error. Please try again.');
                }
            }
        };

        startScanning();

        return () => {
            active = false;
            // Stop logic
            if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
            }
            if (controls) {
                controls.stop();
            }
        };
    }, [onScan]);

    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000', overflow: 'hidden' }}>
            <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
        </div>
    );
};

export default Scanner;
