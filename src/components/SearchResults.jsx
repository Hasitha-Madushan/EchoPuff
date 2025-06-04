import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
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

const SearchResults = () => {
  const location = useLocation();
  const { results = [], query = '', error } = location.state || {};
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);
  const [showPlaylistMessage, setShowPlaylistMessage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(null); // Track which song's modal is open
  const [toastMessage, setToastMessage] = useState(null); // For toast notifications

  const formatTitle = (filename) => {
    return filename
      .replace(/_/g, ' ')
      .replace(/\.mp3$/, '')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const getSongUrl = (song) => {
    return `${BACKEND_URL}/${song.path}`;
  };

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

  // New ShareModal component
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
    <div className="search-results-container">
      <h1 className="search-results-title">Search Results for "{query}"</h1>

      {/* Toast notification */}
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
                    setShowDownloadMessage(true);
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistMessage(true);
                  }}
                >
                  <PlusCircle size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Download Message Modal */}
      {showDownloadMessage && (
        <div className="download-message-modal">
          <div className="download-modal-content">
            <div className="download-modal-header">
              <div className="download-icon">!</div>
              <h3>Download Required</h3>
            </div>
            <p>Please login to download tracks</p>
            <button 
              className="download-ok-button"
              onClick={() => setShowDownloadMessage(false)}
            >
              OK
            </button>
          </div>
          <div className="modal-backdrop"></div>
        </div>
      )}

      {/* Playlist Message Modal */}
      {showPlaylistMessage && (
        <div className="playlist-message-modal">
          <div className="playlist-modal-content">
            <div className="playlist-modal-header">
              <div className="playlist-icon">
                <PlusCircle size={24} />
              </div>
              <h3>Add to Playlist</h3>
            </div>
            <p>Please login to create and manage playlists</p>
            <button 
              className="playlist-ok-button"
              onClick={() => setShowPlaylistMessage(false)}
            >
              OK
            </button>
          </div>
          <div className="modal-backdrop"></div>
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
    </div>
  );
};

export default SearchResults;