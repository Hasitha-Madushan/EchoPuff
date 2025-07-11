import React, { useEffect, useState } from 'react';
import UserHeader from './components/UserHeader';
import './home.css';
import MusicPlayerFooter from './components/MusicPlayerFooter';
import { Download, Share2, PlusCircle, X } from 'lucide-react';

// Platform share icons 
import whatsappIcon from '/Images/icons/whatsapp.png';
import facebookIcon from '/Images/icons/facebook.png';
import telegramIcon from '/Images/icons/telegram.jpeg';
import messengerIcon from '/Images/icons/masenger.png';
import twitterIcon from '/Images/icons/twitter.jpeg';
import linkedinIcon from '/Images/icons/linkedin.png';
import emailIcon from '/Images/icons/email.png';

const BACKEND_URL = 'http://localhost:5000';

const TrackItem = ({
  track,
  index,
  isTopTrack = false,
  onTrackSelect,
  isActive = false,
  getSongUrl,
  showToast,
}) => {
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

      if (!response.ok) {
        if (data.error && data.error.includes('already exists')) {
          showToast(`⚠️ Song already added to ${playlist.name}`);
        } else {
          throw new Error(data.error || 'Failed to add song');
        }
      } else {
        showToast(`✅ Added to ${playlist.name}`);
      }
    } catch (error) {
      console.error("Add song failed:", error);
      showToast(`⚠️ Song already added to ${playlist.name}`);
    }

    setShowPlaylistBox(false);
  };

  const platforms = [
    { name: 'WhatsApp', icon: whatsappIcon, url: `https://wa.me/?text=${encodedTitle}%0A${shareUrl}` },
    { name: 'Facebook', icon: facebookIcon, url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { name: 'Twitter', icon: twitterIcon, url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${shareUrl}` },
    { name: 'LinkedIn', icon: linkedinIcon, url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
    { name: 'Email', icon: emailIcon, url: `mailto:?subject=${encodedTitle}&body=${shareUrl}` },
    { name: 'Telegram', icon: telegramIcon, url: `https://t.me/share/url?url=${shareUrl}&text=${encodedTitle}` },
    { name: 'Messenger', icon: messengerIcon, url: `fb-messenger://share?link=${shareUrl}` },
  ];

  return (
    <div
      className={`track-item ${isTopTrack ? 'top-track' : ''} ${isActive ? 'active' : ''}`}
      onClick={() => onTrackSelect(track)}
    >
      {isTopTrack && <div className="track-number">{String(index).padStart(2, '0')}</div>}
      <div className="track-info">
        <div className="track-title">{track.title}</div>
        <div className="track-artist">Local File</div>
      </div>

      <div className="track-actions">
        <button
          className="action-button"
          title="Download"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const response = await fetch(`${BACKEND_URL}/${track.source}/${encodeURIComponent(track.title)}`);
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
              showToast("Failed to download file.");
            }
          }}
        >
          <Download size={15} />
        </button>

        <div className="share-container">
          <button
            className="action-button"
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
            className="action-button"
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

function ClientHome() {
  const [songs, setSongs] = useState([]);
  const [top10Songs, setTop10Songs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('tracks');
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
    fetch(`${BACKEND_URL}/api/songs`)
      .then((res) => res.json())
      .then((data) => {
        const songsWithSource = data.map(title => ({ title, source: 'songs' }));
        setSongs(songsWithSource);
      })
      .catch(console.error);

    fetch(`${BACKEND_URL}/api/top10Songs`)
      .then((res) => res.json())
      .then((data) => {
        const topSongsWithSource = data.map(title => ({ title, source: 'top10Songs' }));
        setTop10Songs(topSongsWithSource);
      })
      .catch(console.error);
  }, []);

  const getSongUrl = (song) => `${BACKEND_URL}/${song.source}/${encodeURIComponent(song.title)}`;

  const handleTrackSelect = (song) => {
    if (currentSong && song.title === currentSong.title && song.source === currentSong.source) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => setIsPlaying(prev => !prev);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const allSongs = [...songs, ...top10Songs];

  return (
    <div className="home">
      {toastMessage && (
        <div className="custom-toast">
          {toastMessage}
        </div>
      )}

      <UserHeader />
      <div className="main-image-banner"></div>
      <div className="home-container">
        <div className="home-content">
          <div className="latest-section">
            <div className="dropdown-selector"><span>Latest Updates</span></div>
            <div className="track-list">
              {songs.length === 0 ? (
                <div>No local songs found.</div>
              ) : (
                songs.map((song, index) => (
                  <TrackItem
                    key={index}
                    track={song}
                    index={index + 1}
                    onTrackSelect={handleTrackSelect}
                    isActive={currentSong?.title === song.title && currentSong?.source === song.source}
                    getSongUrl={getSongUrl}
                    showToast={showToast}
                  />
                ))
              )}
            </div>
          </div>

          <div className="featured-section">
            <div className="featured-tabs">
              <div className={`tab ${activeTab === 'tracks' ? 'active' : ''}`} onClick={() => setActiveTab('tracks')}>Top 10 Tracks</div>
              <div className={`tab ${activeTab === 'artists' ? 'active' : ''}`} onClick={() => setActiveTab('artists')}>Top Artists</div>
              <div className={`tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Top Festivals</div>
            </div>

            <div className="featured-content">
              {activeTab === 'tracks' && (
                <>
                  <div className="top-tracks-header"><h2>Top 10 Tracks</h2></div>
                  <div className="top-tracks-list">
                    {top10Songs.map((song, index) => (
                      <TrackItem
                        key={index}
                        track={song}
                        index={index + 1}
                        isTopTrack={true}
                        onTrackSelect={handleTrackSelect}
                        isActive={currentSong?.title === song.title && currentSong?.source === song.source}
                        getSongUrl={getSongUrl}
                        showToast={showToast}
                      />
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'artists' && (
                <>
                  <div className="top-tracks-header"><h2>Top 10 Artists</h2></div>
                  <div className="top-artists-list">
                    {[
                      { name: 'Martin Garrix', image: '/Images/artists/MG1.jpg' },
                      { name: 'David Guetta', image: '/Images/artists/DG.jpeg' },
                      { name: 'Dimitri Vegas & Like Mike', image: '/Images/artists/DVLM.jpg' },
                      { name: 'Alok', image: '/Images/artists/Alok.jpeg' },
                      { name: 'Timmy Trumpet', image: '/Images/artists/TT.jpeg' },
                      { name: 'Armin Van Buuren', image: '/Images/artists/AVB.webp' },
                      { name: 'Afrojack', image: '/Images/artists/Afrojack.jpg' },
                      { name: 'Fisher', image: '/Images/artists/Fisher.jpeg' },
                      { name: 'Vintage Culture', image: '/Images/artists/VC.jpg' },
                      { name: 'Hardwell', image: '/Images/artists/Hardwell.jpeg' },
                    ].map((artist, index) => (
                      <div key={index} className="artist-card">
                        <div className="artist-rank">#{index + 1}</div>
                        <img src={artist.image} alt={artist.name} className="artist-image" />
                        <div className="artist-name">{artist.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'events' && (
                <>
                  <div className="top-tracks-header"><h2>Top 10 Festivals</h2></div>
                  <div className="top-events-list">
                    {[
                      { name: 'Tomorrowland', image: '/Images/events/TML.webp' },
                      { name: 'EDC Las Vegas', image: '/Images/events/EDC.webp' },
                      { name: 'Untold', image: '/Images/events/Untold.jpg' },
                      { name: 'Ultra Miami', image: '/Images/events/Ultra.webp' },
                      { name: 'Creamfields', image: '/Images/events/CF.jpg' },
                      { name: 'Exit', image: '/Images/events/Exit.jpg' },
                      { name: 'World Club Dome', image: '/Images/events/WCD.jpg' },
                      { name: 'AMF', image: '/Images/events/AMF.webp' },
                      { name: 'Electric Love', image: '/Images/events/EL.jpg' },
                      { name: 'Parookaville', image: '/Images/events/PV.jpg' },
                    ].map((event, index) => (
                      <div key={index} className="event-card">
                        <img src={event.image} alt={event.name} className="event-image" />
                        <div className="event-name">#{index + 1} {event.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
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
            songs={allSongs}
            setCurrentSong={setCurrentSong}
            setIsPlaying={setIsPlaying}
            backendUrl={BACKEND_URL}
            onClose={handleClosePlayer}
          />
        )}
      </div>
    </div>
  );
}

export default ClientHome;