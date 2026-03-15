import React, { useEffect, useState, useRef } from 'react';
import './styles/LoadingOverlay.css';
import gsap from 'gsap';

const LoadingOverlay = () => {
    const [logs, setLogs] = useState([]);
    const [percent, setPercent] = useState(0);
    const barRef = useRef(null);
    const logsEndRef = useRef(null);

    const logMessages = [
        ">> INITIATING CONNECTION TO HYPER-CORE...",
        ">> BYPASSING RENDER FIREWALL...",
        ">> WAKING UP THE BEAST...",
        ">> COLD START DETECTED...",
        ">> ESTABLISHING SECURE TUNNEL...",
        ">> INJECTING REPO_URL...",
        ">> ANALYZING LAMENESS LEVELS...",
        ">> WARNING: EXTREME CRINGE...",
        ">> HARVESTING CODE SMELLS...",
        ">> PREPARING TO DESTROY PRIDE...",
        ">> STACK_OVERFLOW_IMMORTALITY_FOUND...",
        ">> OPTIMIZING FOR DESTRUCTION..."
    ];

    useEffect(() => {
        if (barRef.current) {
            // Rapid start then slow down to simulate realistic loading
            const tl = gsap.timeline();
            tl.to(barRef.current, {
                width: "40%",
                duration: 1.5,
                ease: "power2.out"
            }).to(barRef.current, {
                width: "90%",
                duration: 15,
                ease: "none"
            });
        }

        // Percentage counter
        const pInterval = setInterval(() => {
            setPercent(prev => {
                if (prev >= 99) return 99;
                const inc = Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 1;
                return Math.min(99, prev + inc);
            });
        }, 300);

        // Add initial logs
        setLogs([logMessages[0], logMessages[1]]);

        const timer = setInterval(() => {
            const nextLog = logMessages[Math.floor(Math.random() * logMessages.length)];
            setLogs(prev => [...prev.slice(-5), nextLog]);
        }, 1200);

        return () => {
            clearInterval(timer);
            clearInterval(pInterval);
        };
    }, []);

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="terminal-simulation">
                    <div className="terminal-header">
                        <span className="dot"></span>
                        SYSTEM_SCAN_IN_PROGRESS
                    </div>
                    <div className="terminal-body">
                        {logs.map((log, i) => (
                            <div key={i} className="log-line">
                                <span className="timestamp">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span> {log}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>

                <div className="progress-section">
                    <div className="progress-labels">
                        <span>DECRYPTING_REPO_STRUCTURE</span>
                        <span className="percent-val">{percent}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bg-shimmer"></div>
                        <div ref={barRef} className="progress-fill"></div>
                    </div>
                </div>

                <div className="loading-glitch">ERROR: STACK_OVERFLOW_IMMORTALITY_DETECTED</div>
            </div>
        </div>
    );
};

export default LoadingOverlay;