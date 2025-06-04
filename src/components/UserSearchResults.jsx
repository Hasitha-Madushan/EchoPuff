// SearchResults.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import UserHeader from './UserHeader';
import { Download, Share2, PlusCircle, X } from 'lucide-react';
import MusicPlayerFooter from './MusicPlayerFooters';
import './SearchResults.css';

import whatsappIcon from '/Images/icons/whatsapp.png';
import facebookIcon from '/Images/icons/facebook.png';
import telegramIcon from '/Images/icons/telegram.jpeg';
import messengerIcon from '/Images/icons/masenger.png';
import twitterIcon from '/Images/icons/twitter.jpeg';
import linkedinIcon from '/Images/icons/linkedin.png';
import emailIcon from '/Images/icons/email.png';

const BACKEND_URL = 'http://localhost:5000';

const UserSearchResults = () => {
  const location = useLocation();
  const { results = [], query = '', error } = location.state || {};
  const [showShareModal, setShowShareModal] = useState(null); // Changed to track which song's modal is open
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState(null); // Added for toast notifications
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistBox, setShowPlaylistBox] = useState(false);
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);
  const audioRef = useRef(null);
  const userId = localStorage.getItem('userId');
  
   const fetchPlaylists = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/playlists/${userId}`);
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error("Failed to fetch playlists", error);
    }
  };

  const handleAddToPlaylist = async (e, track) => {
    e.stopPropagation();
    
    if (!userId) {
      showToast('Please login to add songs to playlists');
      return;
    }
    
    setSelectedTrackForPlaylist(track);
    await fetchPlaylists();
    setShowPlaylistBox(true);
  };

  const handlePlaylistSelect = async (playlist) => {
    if (!selectedTrackForPlaylist) return;
    try {
        const songPath = `${selectedTrackForPlaylist.source}/${selectedTrackForPlaylist.title}`;
      const response = await fetch(`${BACKEND_URL}/playlist-songs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(userId),
          playlistId: Number(playlist.id),
          songPath
        }),
      });

      const data = await response.json();

      if (response.status === 409) {  // Conflict status for duplicate
        showToast(`⚠️ Song already added to ${playlist.name}`);
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to add song');
      } else {
        showToast(`✅ Added to ${playlist.name}`);
      }
    } catch (error) {
      console.error("Add song failed:", error);
      // Check if it's a duplicate error from server
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        showToast(`⚠️ Song already added to ${playlist.name}`);
      } else {
        showToast(`⚠️ Failed to add song to playlist`);
      }
    }

    setShowPlaylistBox(false);
  };

  const formatTitle = (filename) => {
    return filename
      .replace(/_/g, ' ')
      .replace(/\.mp3$/, '')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleDownload = async (track) => {
    try {
      const response = await fetch(`${BACKEND_URL}/${track.path}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = track.title;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download file.");
    }
  };

  const getSongUrl = (song) => `${BACKEND_URL}/${song.path}`;

  const handleTrackSelect = (song) => {
    if (currentSong?.title === song.title && currentSong?.path === song.path) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const ShareModal = ({ track }) => {
    if (!track) return null;
    
    const formattedTitle = formatTitle(track.title);
    const shareUrl = `${window.location.origin}/${track.path}`;
    const platforms = [
      { name: 'WhatsApp', icon: whatsappIcon, url: `https://wa.me/?text=${encodeURIComponent(formattedTitle)}%0A${shareUrl}` },
      { name: 'Facebook', icon: facebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
      { name: 'Telegram', icon: telegramIcon, url: `https://t.me/share/url?url=${shareUrl}&text=${encodeURIComponent(formattedTitle)}` },
      { name: 'Messenger', icon: messengerIcon, url: `fb-messenger://share?link=${shareUrl}` },
      { name: 'Twitter', icon: twitterIcon, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(formattedTitle)}&url=${shareUrl}` },
      { name: 'LinkedIn', icon: linkedinIcon, url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
      { name: 'Email', icon: emailIcon, url: `mailto:?subject=${encodeURIComponent(formattedTitle)}&body=${shareUrl}` },
    ];

    return (
      <div className="share-modal-overlay" onClick={() => setShowShareModal(null)}>
        <div className="share-modal" onClick={(e) => e.stopPropagation()}>
          <div className="share-modal-header">
            <h3>Share "{formattedTitle}"</h3>
            <button 
              className="close-button"
              onClick={() => setShowShareModal(null)}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="share-platforms">
            {platforms.map((platform, i) => (
              <a
                key={i}
                href={platform.url || '#'}
                target={platform.url ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="share-platform"
              >
                <div className="platform-icon">
                  <img src={platform.icon} alt={platform.name} />
                </div>
                <span>{platform.name}</span>
              </a>
            ))}
          </div>
          
          <div className="share-url-container">
            <input 
              type="text" 
              value={shareUrl} 
              readOnly 
              className="share-url-input"
            />
            <button
              className="copy-button"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                showToast('✅ Link copied to clipboard!');
              }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    );
  };

   const handleClosePlayer = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    
    // Also stop the audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }; 

  return (
    <>
      <div className="header-wrapper">
        <UserHeader />
      </div>

      <div className="search-results-container">
        <h1 className="search-results-title">Search Results for "{query}"</h1>

        {toastMessage && (
          <div className="custom-toast">
            {toastMessage}
          </div>
        )}

        {error && <div className="search-error">{error}</div>}

        <div className="song-section1">
          {results.length === 0 ? (
            <div className="search-no-results">No songs found matching "{query}"</div>
          ) : (
            results.map((song, index) => (
              <div
                key={index}
                className={`song-card1 ${currentSong?.title === song.title ? 'active-song' : ''}`}
                onClick={() => handleTrackSelect(song)}
              >
                <div className="track-info1">
                  <div className="track-title1">{formatTitle(song.title)}</div>
                  <div className="track-artist1">Local File</div>
                </div>

                <div className="track-actions1">
                  <button
                    className="action-button1"
                    title="Download"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(song);
                    }}
                  >
                    <Download size={15} />
                  </button>

                  <div className="share-container">
                    <button
                      className="action-button1"
                      title="Share"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShareModal(index);
                      }}
                    >
                      <Share2 size={15} />
                    </button>

                    {showShareModal === index && (
                      <ShareModal track={song} />
                    )}
                  </div>

                  <button
                    className="action-button1"
                    title="Add to Playlist"
                    onClick={(e) => handleAddToPlaylist(e, song)}
                    
                  >
                    <PlusCircle size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showPlaylistBox && (
          <div className="playlist-modal-overlay" onClick={() => setShowPlaylistBox(false)}>
            <div className="playlist-popup-box" onClick={(e) => e.stopPropagation()}>
              <div className="playlist-header">
                <span>Select a Playlist</span>
                <button 
                  className="close-playlist-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistBox(false);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="playlist-list-container">
                {playlists.length === 0 ? (
                  <div className="playlist-item">No playlists found</div>
                ) : (
                  playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="playlist-item"
                      onClick={() => handlePlaylistSelect(playlist)}
                    >
                      {playlist.name}
                    </div>
                  ))
                )}
              </div>
              <div className="playlist-footer">
                <button 
                  className="cancel-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistBox(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {currentSong && (
          <MusicPlayerFooter
            currentTrack={{
              title: currentSong.title,
              artist: 'Local File',
              image: '/images/song-placeholder.png',
              source: getSongUrl(currentSong),
            }}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onSeek={() => {}}
            songs={results}
            setCurrentSong={setCurrentSong}
            backendUrl={BACKEND_URL}
            onClose={handleClosePlayer}
          />
          
        )}

        <audio
          ref={audioRef}
          onLoadedMetadata={(e) => {
            if (currentSong && isPlaying) {
              e.target.play().catch(err => console.error('Play error:', err));
            }
          }}
          onEnded={() => {
            // Handle next track
          }}
        />
      </div>
    </>
  );
};

export default UserSearchResults;