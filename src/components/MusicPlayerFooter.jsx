import React, { useEffect, useState, useRef } from 'react';
import './MusicPlayerFooter.css';
import { X } from 'lucide-react';

const MusicPlayerFooter = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  songs,
  setCurrentSong,
  setIsPlaying,
  onClose,
  backendUrl = 'http://localhost:5000'
}) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // Enhanced audio URL handling for all track types
  const getAudioUrl = (track) => {
    if (!track) return '';

     if (track.source && track.source.includes('/')) {
    return `${backendUrl}/${track.source}/${encodeURIComponent(track.title)}`;
  }
    
    // 1. Handle playlist songs that already have a URL
    if (track.audioSrc) {
      return track.audioSrc;
    }
    
    // 2. Handle songs with source and title properties
    if (track.source && track.title) {
      return `${backendUrl}/${track.source}/${encodeURIComponent(track.title)}`;
    }
    
    // 3. Handle UserCharts songs (which are just strings)
    if (typeof track === 'string') {
      return `${backendUrl}/songs/${encodeURIComponent(track)}`;
    }
    
    // 4. Handle ClientHome songs that come as objects with only title
    if (track.title) {
      return `${backendUrl}/songs/${encodeURIComponent(track.title)}`;
    }
    
    console.error("Invalid track format", track);
    return '';
  };

  // Handle audio playback state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Update progress bar as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateProgress = () => {
      if (audio && duration > 0) {
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / duration) * 100);
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [duration]);

  // Handle track changes and audio loading
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    const newUrl = getAudioUrl(currentTrack);
    
    // Only reload if the source has changed
    if (audioRef.current.src !== newUrl) {
      audioRef.current.src = newUrl;
      audioRef.current.load();
      setCurrentTime(0);
      setProgress(0);
      setIsReady(false);
      
      // Auto-play if it's supposed to be playing
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Auto-play prevented, waiting for user interaction');
          setIsPlaying(false);
        });
      }
    } else if (isPlaying) {
      // If source is same but we need to resume playback
      audioRef.current.play().catch(err => console.error('Playback error:', err));
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack]);

  // Handle play/pause state changes
  useEffect(() => {
    if (isPlaying && isReady) {
      audioRef.current.play().catch(err => console.error('Playback error:', err));
    } else if (!isPlaying && isReady) {
      audioRef.current.pause();
    }
  }, [isPlaying, isReady]);

  // Seek handler
  const handleSeek = (e) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const seekTime = (clickX / rect.width) * duration;
      audioRef.current.currentTime = seekTime;
      setProgress((seekTime / duration) * 100);
      setCurrentTime(seekTime);
    }
  };

  // Find current track index in playlist
  const findCurrentIndex = () => {
    if (!currentTrack || !songs || songs.length === 0) return -1;
    
    // First try to match by ID if available
    if (currentTrack.id) {
      const idIndex = songs.findIndex(track => track.id === currentTrack.id);
      if (idIndex !== -1) return idIndex;
    }
    
    // Then try to match by URL
    const currentUrl = getAudioUrl(currentTrack);
    const urlIndex = songs.findIndex(track => 
      getAudioUrl(track) === currentUrl
    );
    if (urlIndex !== -1) return urlIndex;
    
    // Finally, fallback to title matching
    return songs.findIndex(track => {
      const trackTitle = track.title || track;
      const currentTitle = currentTrack.title || currentTrack;
      return trackTitle === currentTitle;
    });
  };

  // Previous track handler
  const handlePrevious = () => {
    const currentIndex = findCurrentIndex();
    if (currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    const prevSong = songs[prevIndex];
    
    // Handle both object and string formats
    const nextTrack = typeof prevSong === 'string' ? 
      { title: prevSong, source: 'songs' } : 
      prevSong;
      
    setCurrentSong(nextTrack);
    setIsPlaying(true);
    setActiveButton('prev');
    setTimeout(() => setActiveButton(null), 150);
  };

  // Next track handler
  const handleNext = () => {
    const currentIndex = findCurrentIndex();
    if (currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % songs.length;
    const nextSong = songs[nextIndex];
    
    // Handle both object and string formats
    const nextTrack = typeof nextSong === 'string' ? 
      { title: nextSong, source: 'songs' } : 
      nextSong;
      
    setCurrentSong(nextTrack);
    setIsPlaying(true);
    setActiveButton('next');
    setTimeout(() => setActiveButton(null), 150);
  };

  // Progress bar change handler
  const handleSliderChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    setProgress(newProgress);
    setCurrentTime(newTime);
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Volume change handler
  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
    setMuted(false);
  };

  // Mute toggle handler
  const toggleMute = () => {
    setMuted(!muted);
  };

  // Format time display
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <footer className="footer">
      <div className="track-info">
        
        <div className="track-details">
          <h3>
            {currentTrack ? 
              (typeof currentTrack === 'string' ? currentTrack : currentTrack.title) 
              : 'No Track Playing'
            }
          </h3>
          <p>
            {currentTrack && typeof currentTrack !== 'string' ? 
              (currentTrack.artist || 'Unknown Artist') : 
              'Local File'
            }
          </p>
        </div>
      </div>

      <div className="controls">
        <button
          onClick={handlePrevious}
          disabled={!currentTrack || songs.length <= 1}
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
          disabled={!currentTrack || songs.length <= 1}
          className={activeButton === 'next' ? 'active' : ''}
        >
          ⏭
        </button>
      </div>

      <div className="progress-container" onClick={handleSeek}>
        <span className="time-display">
          {formatTime(currentTime)}
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
            background: `linear-gradient(to right, #1db954 ${progress}%, #555 ${progress}%)`
          }}
        />
        <span className="time-display">
          {formatTime(duration)}
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
            background: `linear-gradient(to right, #1db954 ${volume * 100}%, #555 ${volume * 100}%)`
          }}
        />
      </div>

      <audio
        ref={audioRef}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
          setIsReady(true);
        }}
        onEnded={handleNext}
        onError={(e) => console.error("Audio error:", e.target.error)}
      />

      <button className="close-player-button" onClick={onClose}>
        <X size={20} />
      </button>
      
    </footer>
  );
};

export default MusicPlayerFooter;