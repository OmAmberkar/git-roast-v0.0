import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/RoastForm.css';
import './styles/shared.css';
import InputView from './InputView';
import ResultView from './ResultView';
import LoadingOverlay from './LoadingOverlay';

const RoastForm = () => {
  // State
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [roastData, setRoastData] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState('input');

  // Audio refs
  const bgAudioRef = useRef(null);
  const thinkingAudioRef = useRef(null);

  // Audio functions
  const initAudio = () => {
    if (!bgAudioRef.current) {
      bgAudioRef.current = new Audio('/audio/background sound.mp3');
      bgAudioRef.current.volume = 0.5;
      bgAudioRef.current.loop = true;
      bgAudioRef.current.play().catch(e => console.log("Audio waiting..."));
    }

    if (!thinkingAudioRef.current) {
      thinkingAudioRef.current = new Audio('/audio/cyber-10071.mp3');
      thinkingAudioRef.current.volume = 0.4;
      thinkingAudioRef.current.loop = true;
    }
  };

  const playSound = (soundFile, volume = 0.5) => {
    const audio = new Audio(soundFile);
    audio.volume = volume;
    audio.play().catch(() => { });
  };

  const switchToThinkingMode = () => {
    if (bgAudioRef.current) bgAudioRef.current.pause();
    if (thinkingAudioRef.current) {
      thinkingAudioRef.current.currentTime = 0;
      thinkingAudioRef.current.play().catch(() => { });
    }
  };

  const switchToNormalMode = () => {
    if (thinkingAudioRef.current) {
      thinkingAudioRef.current.pause();
      thinkingAudioRef.current.currentTime = 0;
    }
    if (bgAudioRef.current) {
      bgAudioRef.current.play().catch(() => { });
    }
  };

  // Main API call
  const handleRoast = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    playSound('/audio/button click 1.mp3');
    setLoading(true);
    switchToThinkingMode();

    setError(null);
    setRoastData(null);

    window.dispatchEvent(
      new CustomEvent('toggle-glitch', { detail: { active: true } })
    );

    try {
      // const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8001';

      // for production
      const apiUrl = import.meta.env.PROD ? '' : 'http://127.0.0.1:8001';
      const response = await fetch(`${apiUrl}/api/roast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail || 'UNKNOWN_DESTRUCTION_ERROR';

        const errorMessages = {
          404: "I can't roast what I can't see. Is this repo private?",
          403: 'GitHub is tired of my insults. Rate limit hit.',
          422: "This repo is empty or boring. Give me some CODE to destroy.",
          503: "SETUP REQUIRED: Change the API Key in server/.env",
          502: "GitHub's servers are cringing too hard at your repo.",
        };

        throw new Error(errorMessages[response.status] || detail);
      }

      const data = await response.json();

      if (!data || !data.roast) {
        throw new Error("Received empty roast from server.");
      }

      setRoastData(data);
      setView('result');
      switchToNormalMode();
      playSound('/audio/aggressive-tech-cyber-logo-452884.mp3', 0.6);

    } catch (err) {
      setError(err.message);
      switchToNormalMode();
      playSound('/audio/button click 2.mp3');
    } finally {
      setLoading(false);
      window.dispatchEvent(
        new CustomEvent('toggle-glitch', { detail: { active: false } })
      );
    }
  };

  return (
    <div className={`roast-container ${loading ? 'loading' : ''}`}>
      {loading && <LoadingOverlay />}

      <AnimatePresence mode="wait">
        {!loading && (
          <motion.div
            key={view}
            className={`main-content ${view}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {view === 'input' ? (
              <InputView
                repoUrl={repoUrl}
                setRepoUrl={setRepoUrl}
                handleRoast={handleRoast}
                loading={loading}
                error={error}
                initAudio={initAudio}
              />
            ) : (
              <ResultView
                roastData={roastData}
                setView={setView}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoastForm;
