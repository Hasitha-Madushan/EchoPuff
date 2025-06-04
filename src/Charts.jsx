import { useState, useEffect } from 'react';
import './Charts.css';
import MusicPlayerFooter from './components/MusicPlayerFooter';
import { Download, Share2, PlusCircle, X } from 'lucide-react'; // Added X icon

import whatsappIcon from '/Images/icons/whatsapp.png';
import facebookIcon from '/Images/icons/facebook.png';
import telegramIcon from '/Images/icons/telegram.jpeg';
import messengerIcon from '/Images/icons/masenger.png';
import twitterIcon from '/Images/icons/twitter.jpeg';
import linkedinIcon from '/Images/icons/linkedin.png';
import emailIcon from '/Images/icons/email.png';

const genres = [
  'Progressive House',
  'Future House',
  'Future Rave',
  'Bigroom',
  'Bigroom Techno',
  'Minimal Techno',
  'Melodic Techno',
  'Techno House',
  'Bass House',
  'Dubstep',
  'Hardstyle',
  'Afro House',
  'Drum and Bass',
  'Trance',
  'Trap',
];

const BACKEND_URL = 'http://localhost:5000';

const TrackItem = ({ 
  track, 
  onTrackSelect, 
  getSongUrl, 
  isActive,
  onDownloadClick,
  onPlaylistClick,
  showToast // Added showToast prop
}) => {
  const [showShareModal, setShowShareModal] = useState(false); // Changed to modal state

  const shareUrl = `${window.location.origin}/${track.source}/${encodeURIComponent(track.title)}`;
  const encodedTitle = encodeURIComponent(track.title);

  const platforms = [
    { name: 'WhatsApp', icon: whatsappIcon, url: `https://wa.me/?text=${encodedTitle}%0A${shareUrl}` },
    { name: 'Facebook', icon: facebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { name: 'Telegram', icon: telegramIcon, url: `https://t.me/share/url?url=${shareUrl}&text=${encodedTitle}` },
    { name: 'Messenger', icon: messengerIcon, url: `fb-messenger://share?link=${shareUrl}` },
    { name: 'Twitter', icon: twitterIcon, url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${shareUrl}` },
    { name: 'LinkedIn', icon: linkedinIcon, url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
    { name: 'Email', icon: emailIcon, url: `mailto:?subject=${encodedTitle}&body=${shareUrl}` },
  ];

  return (
    <div
      className={`song-card1 ${isActive ? 'active-song' : ''}`}
      onClick={() => onTrackSelect(track)}
    >
      <div className="track-info1">
        <div className="track-title1">{track.title}</div>
        <div className="track-artist1">Local File</div>
      </div>

      <div className="track-actions1">
        <button
          className="action-button1"
          title="Download"
          onClick={(e) => {
            e.stopPropagation();
            onDownloadClick();
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
              setShowShareModal(true);
            }}
          >
            <Share2 size={15} />
          </button>

          {showShareModal && (
            <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
              <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal-header">
                  <h3>Share "{track.title}"</h3>
                  <button 
                    className="close-button"
                    onClick={() => setShowShareModal(false)}
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
          )}
        </div>

        <button
          className="action-button1"
          title="Add to Playlist"
          onClick={(e) => {
            e.stopPropagation();
            onPlaylistClick();
          }}
        >
          <PlusCircle size={15} />
        </button>
      </div>
    </div>
  );
};

export default function ChartsPage() {
  const [selectedGenre, setSelectedGenre] = useState(genres[0]);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);
  const [showPlaylistMessage, setShowPlaylistMessage] = useState(false);
  const [toastMessage, setToastMessage] = useState(null); // Added toast state

   const handleClosePlayer = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    
    // Also stop the audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/songs/${selectedGenre}`)
      .then((res) => res.json())
      .then((data) => setSongs(data))
      .catch(console.error);
  }, [selectedGenre]);

  const getSongUrl = (song) => {
    return `${BACKEND_URL}/${song.source}/${encodeURIComponent(song.title)}`;
  };

  const handleTrackSelect = (song) => {
    if (
      currentSong &&
      song.title === currentSong.title &&
      song.source === currentSong.source
    ) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => setIsPlaying((prev) => !prev);
  const handleDownloadClick = () => setShowDownloadMessage(true);
  const handlePlaylistClick = () => setShowPlaylistMessage(true);
  
  // Toast notification function
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="charts-container">
      {/* Toast notification */}
      {toastMessage && (
        <div className="custom-toast">
          {toastMessage}
        </div>
      )}
      
      <div className="sidebar">
        {genres.map((genre, index) => (
          <div
            key={index}
            className={`genre-item ${selectedGenre === genre ? 'active' : ''}`}
            onClick={() => setSelectedGenre(genre)}
          >
            {genre}
          </div>
        ))}
      </div>

      <div className="main-panel">
        <div className="banner">
          <img
            src="/Images/BG1.jpg"
            alt="Genre Banner"
            className="banner-image"
          />
          <div className="banner-title">{selectedGenre}</div>
        </div>

        <div className="song-section1">
          {songs.length === 0 ? (
            <div>No songs found for this genre.</div>
          ) : (
            songs.map((song, index) => (
              <TrackItem
                key={index}
                track={song}
                onTrackSelect={handleTrackSelect}
                isActive={
                  currentSong?.title === song.title &&
                  currentSong?.source === song.source
                }
                getSongUrl={getSongUrl}
                onDownloadClick={handleDownloadClick}
                onPlaylistClick={handlePlaylistClick}
                showToast={showToast} // Passed showToast to TrackItem
              />
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
              source: currentSong.source,
            }}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSeek={() => {}}
            songs={songs}
            setCurrentSong={setCurrentSong}
            backendUrl={BACKEND_URL}
            onClose={handleClosePlayer}
          />
        )}
      </div>
    </div>
  );
}