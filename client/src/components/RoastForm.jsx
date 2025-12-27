import React, { useState } from 'react';

/**
 * RoastForm Component
 * An interactive form that mimics a terminal command line interface.
 */
const RoastForm = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [roastData, setRoastData] = useState(null);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  // Audio References
  const playClick = () => {
    const audio = new Audio('/audio/button click 1.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const playSuccess = () => {
    const audio = new Audio('/audio/aggressive-tech-cyber-logo-452884.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

  const playError = () => {
    const audio = new Audio('/audio/button click 2.mp3'); // Heavier click for error
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const handleRoast = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    playClick();
    setLoading(true);
    setError(null);
    setErrorCode(null);
    setRoastData(null);

    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8001';
      const response = await fetch(`${apiUrl}/api/roast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo_url: repoUrl }),
      });

      if (!response.ok) {
        setErrorCode(response.status);
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail || 'UNKNOWN_DESTRUCTION_ERROR';

        switch (response.status) {
          case 404:
            throw new Error(
              "I can't roast what I can't see. Is this repo private? My x-ray vision isn't working today."
            );
          case 403:
            throw new Error(
              'GitHub is tired of my insults. Rate limit hit. Take a break and write better code.'
            );
          case 502:
            throw new Error(
              "GitHub's servers are cringing too hard at your repo. I couldn't reach them."
            );
          default:
            throw new Error(detail);
        }
      }

      const data = await response.json();
      setRoastData(data);
      playSuccess();
    } catch (err) {
      setError(err.message);
      playError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terminal-container">
      <form
        onSubmit={handleRoast}
        className="cli-form"
      >
        <label
          htmlFor="repo-input"
          className="cli-prompt"
        >
          git-roast:~$
        </label>
        <div className="input-wrapper">
          <input
            id="repo-input"
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="enter_github_repo_url..."
            className="cli-input"
            autoFocus
          />
          <span className="blinking-cursor">_</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`glitch-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'ANALYZING_VICTIM...' : 'INITIATE_DESTRUCTION'}
        </button>
      </form>

      {error && (
        <div className="system-alert error-glitch">
          <div className="alert-header">
            <span className="alert-icon">⚠</span>
            <span>CRITICAL_SYSTEM_FAILURE</span>
            <span className="alert-code">
              ERR_CODE:{' '}
              {errorCode || (error?.includes('private') ? '404' : '500_FAIL')}
            </span>
          </div>
          <div className="alert-body">
            <p
              className="glitch-text"
              data-text={error}
            >
              {error}
            </p>
          </div>
          <div className="alert-footer">
            <span className="scanline"></span>
            {error.includes('private') && (
              <p className="hint-text">
                AUTHENTICATION_REQUIRED: UPGRADE_TOKEN_SCOPES
              </p>
            )}
          </div>
        </div>
      )}

      {roastData && (
        <div className="roast-output fade-in">
          <div className="report-header">
            <span className="line"></span>
            <h3>DESTRUCTION_REPORT</h3>
            <span className="line"></span>
          </div>
          <p className="roast-text">&quot;{roastData.roast}&quot;</p>
          <div className="score-container">
            <span className="score-label">LAMENESS_SCORE:</span>
            <span className="score-value">{roastData.score}</span>
            <div className="score-bar">
              <div
                className="score-fill"
                style={{ width: `${roastData.score}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .terminal-container {
          width: 100%;
          max-width: 650px;
          padding: 2.5rem;
          background: rgba(0, 10, 0, 0.9);
          border: 1px solid #0f0;
          box-shadow: 0 0 30px rgba(0, 255, 65, 0.15), inset 0 0 10px rgba(0, 255, 65, 0.1);
          position: relative;
          overflow: hidden;
        }

        .terminal-container::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; bottom: 0; right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 2;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }

        .cli-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          z-index: 3;
          position: relative;
        }

        .cli-prompt {
          font-weight: bold;
          color: #0f0;
          text-shadow: 0 0 5px #0f0;
          font-size: 0.9rem;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid #111;
          background: rgba(0, 20, 0, 0.5);
          padding: 0.8rem;
          box-shadow: inset 0 0 10px #000;
        }

        .cli-input {
          background: transparent;
          border: none;
          outline: none;
          color: #0f0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 1.1rem;
          width: 100%;
          caret-color: transparent;
        }

        .blinking-cursor {
          color: #0f0;
          animation: blink 1s step-end infinite;
          font-size: 1.1rem;
          text-shadow: 0 0 5px #0f0;
        }

        @keyframes blink {
          50% { opacity: 0; }
        }
        
        .glitch-button {
          padding: 1rem;
          background: transparent;
          color: #0f0;
          border: 1px solid #0f0;
          font-weight: bold;
          cursor: pointer;
          position: relative;
          text-transform: uppercase;
          transition: all 0.2s ease;
          letter-spacing: 2px;
          font-family: inherit;
        }

        .glitch-button:hover:not(:disabled) {
          background: rgba(0, 255, 0, 0.1);
          box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
          text-shadow: 0 0 8px #0f0;
        }

        .glitch-button:disabled {
          border-color: #003300;
          color: #003300;
          cursor: wait;
        }

        /* System Alert Styling */
        .system-alert {
          margin-top: 2rem;
          border-left: 5px solid #f00;
          background: rgba(50, 0, 0, 0.3);
          padding: 1.5rem;
          position: relative;
          z-index: 5;
          animation: alert-entry 0.3s ease-out;
          border: 1px solid rgba(255, 0, 0, 0.3);
        }

        @keyframes alert-entry {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #f00;
          font-weight: bold;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 0, 0, 0.2);
          padding-bottom: 0.5rem;
        }

        .alert-icon {
          font-size: 1.2rem;
          animation: pulse 1s infinite;
        }

        .alert-body {
          color: #ff9999;
          font-style: italic;
          line-height: 1.6;
        }

        /* Glitch Text Effect */
        .glitch-text {
          position: relative;
        }
        
        .hint-text {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: #ff6666;
          opacity: 0.7;
          border-top: 1px dashed rgba(255, 0, 0, 0.2);
          padding-top: 0.5rem;
        }

        /* Roast Output Styling */
        .roast-output {
          margin-top: 2.5rem;
          padding-top: 1rem;
          z-index: 3;
          position: relative;
        }

        .report-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .report-header .line {
          flex: 1;
          height: 1px;
          background: #0f0;
          opacity: 0.3;
        }

        .report-header h3 {
          color: #0f0;
          font-size: 0.9rem;
          letter-spacing: 3px;
          margin: 0;
          text-shadow: 0 0 10px #0f0;
        }

        .roast-text {
          font-style: italic;
          line-height: 1.6;
          color: #fff;
          font-size: 1.1rem;
          margin-bottom: 2rem;
          text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
        }

        .score-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .score-label {
          color: #0f0;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .score-value {
          font-size: 2.5rem;
          font-weight: 900;
          color: #f00;
          text-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
          line-height: 1;
        }

        .score-bar {
          height: 4px;
          background: #111;
          width: 100%;
          margin-top: 0.5rem;
          position: relative;
        }

        .score-fill {
          height: 100%;
          background: #f00;
          box-shadow: 0 0 10px #f00;
          transition: width 1s ease-out;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .fade-in {
          animation: fadeIn 0.8s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RoastForm;
