import React from 'react';
import './styles/shared.css';
import './styles/ResultView.css';

const ResultView = ({ roastData, setView }) => {
    return (
        <div className="result-wrapper">
            <div className="result-box">
                <div className="result-header">
                    <div className="recording">rec</div>
                    <h2>DESTRUCTION_DASHBOARD</h2>
                    <button onClick={() => setView('input')}>REBOOT_SYSTEM</button>
                </div>

                <div className="result-body">
                    <div className="roast-display">
                        <div className="header-label">TRANSCRIPTION_OF_SHAME</div>
                        <div className="roast-text">
                            "{roastData.roast}"
                        </div>
                    </div>

                    <div className="stats-display">
                        <div className="stat">
                            <div>LAMENESS_PERCENTAGE</div>
                            <div className="stat-value">{roastData.score}%</div>
                            <div className="stat-bar">
                                <div
                                    className="stat-fill"
                                    style={{ width: `${roastData.score}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="stat">
                            <div>AI_BRAIN_DAMAGE</div>
                            <div className="stat-value">CRITICAL</div>
                        </div>
                    </div>
                </div>

                <div className="data-stream">
                    DATA_STREAM: [INFO] FETCHING REPO CONTENT... [SUCCESS] PARSING CODE...
                    [WARN] LAME CODE DETECTED... [CRITICAL] GENAI OVERLOAD... [DONE] ROAST GENERATED
                </div>
            </div>
        </div>
    );
};

export default ResultView;
