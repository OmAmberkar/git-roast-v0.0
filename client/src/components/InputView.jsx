import React from 'react';
import { motion } from 'framer-motion';
import './styles/InputView.css';
import './styles/shared.css'

const InputView = ({
    repoUrl,
    setRepoUrl,
    handleRoast,
    loading,
    error,
    initAudio
}) => {
    return (
        <div className="input-wrapper">
            <div className="terminal-box">
                <div className="terminal-header">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot cyan"></span>
                    <span className="title">git-roast --bash</span>
                </div>

                <form onSubmit={handleRoast} className="terminal-form">
                    <div className="input-row">
                        <span className="prompt">root@git-roast:~$</span>
                        <input
                            id="repo-url"
                            name="repo-url"
                            type="text"
                            value={repoUrl}
                            onChange={(e) => setRepoUrl(e.target.value)}
                            onFocus={initAudio}
                            onClick={initAudio}
                            placeholder="inject_repo_url_here..."
                            disabled={loading}
                            autoFocus
                        />
                        {!repoUrl && <span className="blink-cursor">_</span>}
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading || !repoUrl}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? 'CALCULATING_DESTRUCTION...' : 'EXECUTE_ROAST.sh'}
                    </motion.button>
                </form>

                {error && (
                    <div className="error-box">
                        <p>» ERROR: {error}</p>
                        <p>SYSTEM_STABILITY: CRITICAL</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputView;
