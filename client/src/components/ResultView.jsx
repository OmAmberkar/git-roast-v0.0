import React, { useEffect, useRef, useState } from 'react';
import './styles/shared.css';
import './styles/ResultView.css';
import gsap from 'gsap';

const ResultView = ({ roastData, setView, repoUrl }) => {
    const panelsRef = useRef(null);
    const fillRef = useRef(null);
    const scoreRef = useRef(null);
    const faultRef = useRef(null);
    const [faults, setFaults] = useState(0);

    useEffect(() => {
        if (!roastData) return;

        const ctx = gsap.context(() => {
            // Panel entrance
            gsap.from('.info-panel', {
                xPercent: -100,
                duration: 1,
                ease: "power4.out"
            });
            gsap.from('.data-panel', {
                xPercent: 100,
                duration: 1,
                ease: "power4.out"
            });

            // Content stagger
            gsap.from('.animate-content', {
                opacity: 0,
                y: 20,
                stagger: 0.1,
                duration: 0.8,
                delay: 0.5,
                ease: "power2.out"
            });

            // Stats animation
            if (fillRef.current) {
                gsap.fromTo(fillRef.current,
                    { width: "0%" },
                    { width: `${roastData.score}%`, duration: 2, ease: "power4.out", delay: 1 }
                );
            }

            if (scoreRef.current) {
                const targetScore = parseInt(roastData.score) || 0;
                const obj = { value: 0 };
                gsap.to(obj, {
                    value: targetScore,
                    duration: 2,
                    ease: "power4.out",
                    delay: 1,
                    onUpdate: () => {
                        if (scoreRef.current) scoreRef.current.innerHTML = Math.floor(obj.value);
                    }
                });
            }

            // Fault count blocks animation
            const targetFaults = parseInt(roastData.fault_count) || 0;
            const faultObj = { value: 0 };
            gsap.to(faultObj, {
                value: targetFaults,
                duration: 1.5,
                delay: 1.2,
                ease: "power2.out",
                onUpdate: () => {
                    setFaults(Math.floor(faultObj.value));
                }
            });

            // Animate blocks in the mini-grid
            gsap.from('.mini-box', {
                scale: 0,
                opacity: 0,
                stagger: {
                    each: 0.05,
                    from: "random"
                },
                duration: 0.5,
                delay: 1.5
            });

        }, panelsRef);

        return () => ctx.revert();
    }, [roastData]);

    if (!roastData) return null;

    const repoName = repoUrl?.split('/').pop() || 'UNKNOWN_REPO';
    const owner = repoUrl?.split('/').slice(-2, -1)[0] || 'ANONYMOUS';

    // Dynamic Status base on score
    const getStatus = (score) => {
        if (score > 80) return { text: "CRITICAL", class: "danger" };
        if (score > 50) return { text: "UNSTABLE", class: "warn" };
        if (score > 20) return { text: "VULNERABLE", class: "info" };
        return { text: "STABLE", class: "success" };
    };

    const status = getStatus(roastData.score);

    return (
        <div className="split-view-container" ref={panelsRef}>
            <div className="info-panel">
                <div className="panel-inner animate-content">
                    <div className="tag">REPO_METADATA</div>
                    <h2 className="valo-header-sm">IDENTITY</h2>

                    <div className="metadata-grid">
                        <div className="meta-item">
                            <span className="label">TARGET:</span>
                            <span className="value">{repoName}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">OWNER:</span>
                            <span className="value">{owner}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">STATUS:</span>
                            <span className={`value status-badge ${status.class}`}>{status.text}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">FAULTS_DETECTED:</span>
                            <span className="value highlight">{faults}</span>
                        </div>
                    </div>

                    <div className="url-breadcrumb">
                        <code>{repoUrl}</code>
                    </div>

                    <div className="status-mini-grid">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className={`mini-box ${i < faults ? 'active' : ''}`}></div>
                        ))}
                    </div>

                    <button className="reboot-btn" onClick={() => setView('input')}>
                        [ REBOOT_SYSTEM ]
                    </button>
                </div>
            </div>

            <div className="data-panel">
                <div className="panel-inner results-content">
                    <div className="animate-content">
                        <div className="tag">DESTRUCTION_LOG</div>
                        <div className="roast-quote">
                            "{roastData.roast}"
                        </div>
                    </div>

                    <div className="results-grid">
                        <div className="suggestions-section animate-content">
                            <h3><span className="icon">◈</span> REDESIGN_PROTOCOLS</h3>
                            <ul className="glitch-list">
                                {roastData.suggestions?.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="stats-section animate-content">
                            <div className="score-vignette">
                                <div className="label">LAMENESS_RATING</div>
                                <div className="score-wrapper">
                                    <span ref={scoreRef} className="big-score">0</span>
                                    <span className="unit">%</span>
                                </div>
                                <div className="score-bar-bg">
                                    <div ref={fillRef} className="score-bar-fill"></div>
                                </div>
                            </div>

                            <div className="standards-box">
                                <h3><span className="icon">⚠</span> VIOLATIONS</h3>
                                <div className="violations-tags">
                                    {roastData.standards?.map((s, i) => (
                                        <span key={i} className="v-tag">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer-scanner animate-content">
                        <div className="scan-text">SCANNING_COMPLETE // SYSTEM_TIME: {new Date().toLocaleTimeString()}</div>
                        <div className="pulse-dot"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultView;
