import { useState, useEffect } from 'react';
import './Charts.css';
import UserHeader from './components/UserHeader';
import MusicPlayerFooter from './components/MusicPlayerFooter';
import { Download, Share2, PlusCircle, X  } from 'lucide-react';

import whatsappIcon from '/Images/icons/whatsapp.png';
import facebookIcon from '/Images/icons/facebook.png';
import telegramIcon from '/Images/icons/telegram.jpeg';
import messengerIcon from '/Images/icons/masenger.png';
import twitterIcon from '/Images/icons/twitter.jpeg';
import linkedinIcon from '/Images/icons/linkedin.png';
import emailIcon from '/Images/icons/email.png';

const genres = [
  'Tomorrowland',
  'Tomorrowland Winter',
  'Ultra Miami',
  'AMF',
  'EDC',
  'Untold',
  'A State of Trance',
  'Euforia Festival',
  'Tranceformations',
  'Transmission',
];

const BACKEND_URL = 'http://localhost:5000';

const TrackItem = ({ track, onTrackSelect, getSongUrl, isActive, showToast }) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showPlaylistBox, setShowPlaylistBox] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const shareUrl = `${window.location.origin}/${track.source}/${encodeURIComponent(track.title)}`;
  const encodedTitle = encodeURIComponent(track.title);
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

  const handleAddToPlaylist = async (e) => {
    e.stopPropagation();
    
    if (!userId) {
      showToast('Please login to add songs to playlists');
      return;
    }
    
    await fetchPlaylists();
    setShowPlaylistBox(true);
  };

  const handlePlaylistSelect = async (playlist) => {
    try {
      const songPath = `${track.source}/${track.title}`;
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
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const response = await fetch(getSongUrl(track));
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
              setShowShareOptions(!showShareOptions);
            }}
          >
            <Share2 size={15} />
          </button>

          {showShareOptions && (
            <div className="share-modal-overlay" onClick={() => setShowShareOptions(false)}>
              <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal-header">
                  <h3>Share "{track.title}"</h3>
                  <button 
                    className="close-button"
                    onClick={() => setShowShareOptions(false)}
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

        <div className="playlist-container">
          <button
            className="action-button1"
            title="Add to Playlist"
            onClick={handleAddToPlaylist}
          >
            <PlusCircle size={15} />
          </button>

           {showPlaylistBox && (
            <div className="playlist-modal-overlay">
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
        </div>
      </div>
    </div>
  );
};

export default function UserCharts() {
  const [selectedGenre, setSelectedGenre] = useState(genres[0]);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

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

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <UserHeader />
      <div className="charts-container">
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
              src="/Images/BG2.jpg"
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
                  showToast={showToast}
                />
              ))
            )}
          </div>

          {currentSong && (
            <MusicPlayerFooter
              currentTrack={{
                title: currentSong.title,
                artist: 'Local File',
                
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
    </>
  );
}