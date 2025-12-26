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

  const handleRoast = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setLoading(true);
    setError(null);
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
        throw new Error('FAILED_TO_FETCH_DESTRUCTION_DATA');
      }

      const data = await response.json();
      setRoastData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="terminal-container">
      <form onSubmit={handleRoast} className="cli-form">
        <label htmlFor="repo-input" className="cli-prompt">
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
        <div className="terminal-error">
          <p>[ERROR] {error}</p>
        </div>
      )}

      {roastData && (
        <div className="roast-output">
          <h3>DESTRUCTION_REPORT</h3>
          <p className="roast-text">"{roastData.roast}"</p>
          <p className="score">LAMENESS_SCORE: {roastData.score}/100</p>
        </div>
      )}

      <style>{`
        .terminal-container {
          width: 100%;
          max-width: 600px;
          padding: 2rem;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #333;
          box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
        }
        .cli-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .cli-prompt {
          font-weight: bold;
          color: #0f0;
        }
        .input-wrapper {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
        }
        .cli-input {
          background: transparent;
          border: none;
          outline: none;
          color: #0f0;
          font-family: inherit;
          font-size: 1.2rem;
          width: 100%;
          caret-color: transparent;
        }
        .blinking-cursor {
          color: #0f0;
          animation: blink 1s step-end infinite;
          font-size: 1.2rem;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        
        .glitch-button {
          padding: 1rem;
          background: #0f0;
          color: #000;
          border: none;
          font-weight: bold;
          cursor: pointer;
          position: relative;
          text-transform: uppercase;
        }
        .glitch-button:hover {
          box-shadow: 0 0 15px #0f0;
        }
        .glitch-button.loading {
          background: #333;
          color: #0f0;
          cursor: wait;
        }

        .roast-output {
          margin-top: 2rem;
          border-top: 1px solid #333;
          padding-top: 1rem;
        }
        .roast-text {
          font-style: italic;
          line-height: 1.5;
        }
        .score {
          font-weight: bold;
          color: #f00;
          margin-top: 1rem;
        }
        .terminal-error {
          color: #f00;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default RoastForm;
