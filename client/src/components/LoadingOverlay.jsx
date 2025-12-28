import React from 'react';
import './styles/shared.css';
import './styles/LoadingOverlay.css';
import { motion } from 'framer-motion';


const LoadingOverlay = () => {
    return (
        <div className="loading-overlay">
            <div className="glitch-scanner"></div>

            <motion.div
                className="brain-melting-center"
                animate={{
                    x: [0, -4, 4, -2, 2, 0],
                    y: [0, 3, -3, 2, -2, 0],
                }}
                transition={{
                    duration: 0.18,
                    repeat: Infinity,
                }}
            >
                <motion.h2
                    className="overload-text glitch-text"
                    data-text="NEURAL_OVERLOAD_DETECTED"
                    animate={{
                        opacity: [1, 0.85, 1],
                        skewX: [0, -6, 6, 0],
                    }}
                    transition={{
                        duration: 0.25,
                        repeat: Infinity,
                    }}
                >
                    NEURAL_OVERLOAD_DETECTED
                </motion.h2>

                <div className="symptoms">
                    <span>SYMPTOMS: CONFUSION, NAUSEA, DISGUST</span>
                    <span>ACTION: BYPASSING_LIMITS.exe</span>
                    <span className="critical">BRAIN_CELLS_REMAINING: 0.003%</span>
                    <span>PROCESSING_LEVEL_OF_LAMENESS: 11/10</span>
                </div>

                <div className="loading-bar">
                    <div className="loading-fill"></div>
                </div>
            </motion.div>

            <div className="noise-canvas"></div>
        </div>
    );
};

export default LoadingOverlay;