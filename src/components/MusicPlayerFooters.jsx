import React, { useEffect, useState, useRef } from 'react';
import './MusicPlayerFooter.css';
import { X } from 'lucide-react';

const MusicPlayerFooters = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onSeek,
  songs,
  onClose,
  setCurrentSong,
  backendUrl = 'http://localhost:5000'
}) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [activeButton, setActiveButton] = useState(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      if (audio && duration > 0) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / duration) * 100);
      }
    };

    audio?.addEventListener('timeupdate', updateProgress);
    return () => {
      audio?.removeEventListener('timeupdate', updateProgress);
    };
  }, [duration]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const newSrc = currentTrack.source;

    if (audioRef.current.src !== newSrc) {
      audioRef.current.src = newSrc;
      audioRef.current.load();
      setCurrentTime(0);
      setProgress(0);
    }
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Playback error:', err));
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Playback error:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handleSeek = (e) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const seekTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = seekTime;
      setProgress((seekTime / duration) * 100);
      setCurrentTime(seekTime);
      onSeek?.(seekTime);
    }
  };

  const handlePrevious = () => {
    //setActiveButton('prev');
    //setTimeout(() => setActiveButton(null), 150);
    const currentIndex = songs.findIndex(track => track.title === currentTrack.title && track.source === currentTrack.source);
    if (currentIndex > 0) setCurrentSong(songs[currentIndex - 1]);
  };

  const handleNext = () => {
    //setActiveButton('next');
    //setTimeout(() => setActiveButton(null), 150);
    const currentIndex = songs.findIndex(track => track.title === currentTrack.title && track.source === currentTrack.source);
    if (currentIndex < songs.length - 1) {
      setCurrentSong(songs[currentIndex + 1]);
    } else {
      setCurrentSong(songs[0]);
    }
  };

  const handleSliderChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    setProgress(newProgress);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      onSeek?.(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    setMuted(false);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  const audioSrc = currentTrack ? currentTrack.source : '';


  return (
    <footer className="footer">
      <div className="track-info">
        <div className="track-details">
          <h3>{currentTrack ? currentTrack.title : 'No Track Playing'}</h3>
          <p>{currentTrack ? currentTrack.artist : ''}</p>
        </div>
      </div>

      <div className="controls">
        <button
          onClick={handlePrevious}
          disabled={!currentTrack}
          className={activeButton === 'prev' ? 'active' : ''}
        >
          ⏮
        </button>
        <button
          onClick={() => {
            onPlayPause();
            setActiveButton('play');
            setTimeout(() => setActiveButton(null), 150);
          }}
          disabled={!currentTrack}
          className={activeButton === 'play' ? 'active' : ''}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={handleNext}
          disabled={!currentTrack}
          className={activeButton === 'next' ? 'active' : ''}
        >
          ⏭
        </button>
      </div>

      <div className="progress-container" onClick={handleSeek}>
        <span className="time-display">
          {`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSliderChange}
          className="progress-bar"
          disabled={!currentTrack}
          style={{
            background: `linear-gradient(to right,#1db954 ${progress}%, #555 ${progress}%)`
          }}
        />
        <span className="time-display">
          {`${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`}
        </span>
      </div>

      <div className="volume-container">
        <span className="volume-icon" onClick={toggleMute} style={{ cursor: 'pointer' }}>
          {muted || volume === 0 ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="gray" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8.82L13.41 11.4 16 13.99V8.82zM3 9v6h4l5 5V4L7 9H3zm13.41 2.59L20 17.17l1.41-1.41L17.82 12l3.59-3.59L20 7l-3.59 3.59z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10v4h4l5 5V5l-5 5H3z" />
              {volume > 0.33 && <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-1.01 7-4.65 7-8.77s-2.99-7.76-7-8.77z" />}
              {volume > 0.66 && <path d="M14 8.54v6.92c1.18-.42 2-1.52 2-2.96s-.82-2.54-2-2.96z" />}
            </svg>
          )}
        </span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={muted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          style={{
            background: `linear-gradient(to right,#1db954 ${volume * 100}%, #555 ${volume * 100}%)`
          }}
        />
      </div>

      <button className="close-player-button" onClick={onClose}>
        <X size={20} />
      </button>

      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={handleNext}
      />
    </footer>
  );
};

export default MusicPlayerFooters;
