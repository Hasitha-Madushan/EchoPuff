import React, { useState, useEffect } from 'react';
import UserHeader from './components/UserHeader';
import './profile.css';
import MusicPlayerFooter from './components/MusicPlayerFooter';
import { Download, Share2, X, Play, Pause, Music, List } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

const Profile = () => {
  const [playlistName, setPlaylistName] = useState('');
  const [message, setMessage] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('profileImage') || '/default-profile.png'
  );
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [activeSongId, setActiveSongId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentSharedSong, setCurrentSharedSong] = useState(null);

  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');

  const getAudioUrl = (song) => {
    return song.audioSrc || `${BACKEND_URL}/${song.source}/${encodeURIComponent(song.title)}`;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('profileImage', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/playlists/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch playlists');
        
        const data = await response.json();
        setPlaylists(data);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [userId]);

   // Handle automatic playback of next song
  useEffect(() => {
    const handleEnded = () => {
      if (!currentSong || !playlistSongs.length) return;
      
      const currentIndex = playlistSongs.findIndex(song => 
        song.id === currentSong.id
      );
      
      if (currentIndex === -1) return;
      
      const nextIndex = (currentIndex + 1) % playlistSongs.length;
      const nextSong = playlistSongs[nextIndex];
      
      setCurrentSong({ 
        id: nextSong.id,
        title: nextSong.title,
        source: nextSong.source,
        audioSrc: getAudioUrl(nextSong),
        artist: 'Playlist Track',
        image: '/images/song-placeholder.png'
      });
      setActiveSongId(nextSong.id);
      setIsPlaying(true);
    };

    // Listen for ended event
    document.addEventListener('audioEnded', handleEnded);
    
    return () => {
      document.removeEventListener('audioEnded', handleEnded);
    };
  }, [currentSong, playlistSongs]);

  const handleCreatePlaylist = async () => {
    if (!userId) {
      setMessage('Please login to create playlists');
      return;
    }

    const trimmedName = playlistName.trim();
    if (!trimmedName) {
      setMessage('Please enter a playlist name');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: parseInt(userId), 
          name: trimmedName 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create playlist');
      }

      setPlaylists(prev => [...prev, { id: data.playlistId, name: trimmedName }]);
      setPlaylistName('');
      
    } catch (error) {
      console.error('Error creating playlist:', error);
      setMessage(error.message);
    }
  };

  const fetchPlaylistSongs = async (playlistId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/playlist-songs/${playlistId}`);
      const data = await response.json();
      
      const songsWithSource = data.map(song => {
        // Parse URL to extract folder and filename
        const urlParts = song.url.split('/');
        const fileName = decodeURIComponent(urlParts.pop());
        const folder = urlParts.pop();
        
        return {
          ...song,
          source: folder,
          title: fileName
        };
      });
      
      setPlaylistSongs(songsWithSource);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage(error.message);
    }
  };

  const showConfirmationDialog = (type, id) => {
    setDialogType(type);
    setItemToRemove(id);
    setShowConfirmDialog(true);
  };

  const handleConfirmation = async () => {
    if (dialogType === 'song') {
      await removeSong();
    } else if (dialogType === 'playlist') {
      await deletePlaylist();
    }
    setShowConfirmDialog(false);
  };

  const removeSong = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/playlist-songs/${itemToRemove}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const songToRemoveObj = playlistSongs.find(s => s.id === itemToRemove);
        setPlaylistSongs(prev => prev.filter(s => s.id !== itemToRemove));
        
        if (currentSong && currentSong.id === itemToRemove) {
          setIsPlaying(false);
          setCurrentSong(null);
          setActiveSongId(null);
        }
      }
    } catch (error) {
      console.error('Error removing song:', error);
      setMessage('Failed to remove song');
    }
  };

  const deletePlaylist = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/playlists/${itemToRemove}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete playlist');
      
      setPlaylists(prev => prev.filter(p => p.id !== itemToRemove));
      
      if (expandedPlaylist === itemToRemove) {
        setExpandedPlaylist(null);
        setPlaylistSongs([]);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
      setMessage(error.message);
    }
  };

  const handlePlaylistToggle = async (playlistId) => {
    if (expandedPlaylist === playlistId) {
      setExpandedPlaylist(null);
      setPlaylistSongs([]); 
    } else {
      setExpandedPlaylist(playlistId);
      await fetchPlaylistSongs(playlistId);
    }
  };

  useEffect(() => {
    if (currentSong && expandedPlaylist) {
      const songExists = playlistSongs.some(song => song.id === currentSong.id);
      if (!songExists) {
        setIsPlaying(false);
        setCurrentSong(null);
        setActiveSongId(null);
      }
    }
  }, [playlistSongs, currentSong, expandedPlaylist]);

  const handleShareSong = (song) => {
    setCurrentSharedSong(song);
    setShowShareModal(true);
  };

  const ShareModal = () => {
    if (!currentSharedSong) return null;
    
    const shareUrl = `${window.location.origin}/${currentSharedSong.source}/${encodeURIComponent(currentSharedSong.title)}`;
    const platforms = [
      { name: 'WhatsApp', icon: '/Images/icons/whatsapp.png', url: `https://wa.me/?text=${encodeURIComponent(currentSharedSong.title)}%0A${shareUrl}` },
      { name: 'Facebook', icon: '/Images/icons/facebook.png', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
      { name: 'Twitter', icon: '/Images/icons/twitter.jpeg', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentSharedSong.title)}&url=${shareUrl}` },
      { name: 'Email', icon: '/Images/icons/email.png', url: `mailto:?subject=${encodeURIComponent(currentSharedSong.title)}&body=${shareUrl}` },
      { name: 'LinkedIn', icon: '/Images/icons/linkedin.png', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
      { name: 'Messenger', icon: '/Images/icons/masenger.png', url: `fb-messenger://share?link=${shareUrl}` },
    ];

    return (
      <div className="share-modal-overlay">
        <div className="share-modal">
          <div className="share-modal-header">
            <h3>Share "{currentSharedSong.title}"</h3>
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
                onClick={(e) => {
                  if (platform.action) {
                    e.preventDefault();
                    platform.action();
                    const originalText = e.currentTarget.querySelector('span').textContent;
                    e.currentTarget.querySelector('span').textContent = 'Copied!';
                    setTimeout(() => {
                      if (e.currentTarget.querySelector('span')) {
                        e.currentTarget.querySelector('span').textContent = originalText;
                      }
                    }, 1500);
                  }
                }}
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
                const button = document.querySelector('.copy-button');
                if (button) {
                  const originalText = button.textContent;
                  button.textContent = 'Copied!';
                  setTimeout(() => {
                    button.textContent = originalText;
                  }, 1500);
                }
              }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PlaylistSongItem = ({ song, index }) => {
    const isActive = activeSongId === song.id;

    return (
      <div 
        className={`song-item ${isActive ? 'active' : ''}`}
        onClick={() => {
          if (isActive) {
            setIsPlaying(!isPlaying);
          } else {
            setCurrentSong({ 
              id: song.id,
              title: song.title,
              source: song.source,
              audioSrc: song.url,
              artist: 'Playlist Track',
              image: '/images/song-placeholder.png'
            });
            setActiveSongId(song.id);
            setIsPlaying(true);
          }
        }}
      >
        <div className="song-info">
          <span className="song-number">{index + 1}.</span>
          <span className="song-title">{song.title}</span>
        </div>

        <div className="song-actions">
          

          <button
            className="action-button"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const response = await fetch(`${BACKEND_URL}/${song.source}/${encodeURIComponent(song.title)}`);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = song.title;
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
            <Download size={16} />
          </button>

          <button
            className="action-button"
            onClick={(e) => {
              e.stopPropagation();
              handleShareSong(song);
            }}
          >
            <Share2 size={16} />
          </button>

          <button
            className="action-button danger"
            onClick={(e) => {
              e.stopPropagation();
              showConfirmationDialog('song', song.id);
            }}
          >
            <X size={16} />
          </button>
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
    <div className="profile-container">
      <UserHeader profileImage={profileImage} />

      {showConfirmDialog && (
        <div className="custom-confirm-overlay">
          <div className="custom-confirm-box">
            <div className="confirm-icon">
              {dialogType === 'song' ? (
                <Music size={48} color="#ff6b6b" />
              ) : (
                <List size={48} color="#ff6b6b" />
              )}
            </div>
            <h2 className="confirm-title">
              {dialogType === 'song' ? 'Remove Song' : 'Delete Playlist'}
            </h2>
            <p className="confirm-message">
              {dialogType === 'song' 
                ? 'Are you sure you want to remove this song from the playlist?'
                : 'Are you sure you want to delete this playlist?'}
            </p>
            <div className="confirm-buttons">
              <button 
                className="confirm-button cancel"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-button confirm"
                onClick={handleConfirmation}
              >
                {dialogType === 'song' ? 'Remove' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && <ShareModal />}

      <div className="profile-header">
        <div className="profile-info">
          <label htmlFor="profile-upload" className="profile-image-container">
            <img 
              src={profileImage}
              alt="Profile"
              className="profile-image"
            />
            <div className="image-overlay">Change Photo</div>
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />
          <h1 className="profile-name">{userEmail}</h1>
        </div>
      </div>

      <div className="profile-content">
        <div className="playlist-management">
          <div className="playlist-creator">
            <input
              type="text"
              placeholder="New playlist name"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
            />
            <button 
              className="create-button"
              onClick={handleCreatePlaylist}
            >
              Create New
            </button>
          </div>

          {message && <div className="status-message">{message}</div>}

          {loading ? (
            <div className="loading">Loading your playlists...</div>
          ) : (
            <div className="playlists-grid">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="playlist-card">
                  <div className="playlist-header" onClick={() => handlePlaylistToggle(playlist.id)}>
                    <div className="playlist-info">
                      <h3>{playlist.name}</h3>
                      <div className="song-count1">
                        {expandedPlaylist === playlist.id ? 
                          `${playlistSongs.length} songs` : 'Click to view'}
                      </div>
                    </div>
                    <div className="playlist-controls">
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirmationDialog('playlist', playlist.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {expandedPlaylist === playlist.id && (
                    <div className="playlist-songs">
                      {playlistSongs.length === 0 ? (
                        <div className="empty">No songs in this playlist</div>
                      ) : (
                        playlistSongs.map((song, index) => (
                          <PlaylistSongItem 
                            key={song.id} 
                            song={song} 
                            index={index} 
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {currentSong && (
        <MusicPlayerFooter
          currentTrack={{
            ...currentSong,
            title: currentSong.title,
            artist: currentSong.artist || 'Playlist Track',
            audioSrc: getAudioUrl(currentSong),
            source: currentSong.source
          }}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          songs={playlistSongs.map(song => ({
            id: song.id,
            title: song.title,
            source: song.source,
            audioSrc: getAudioUrl(song),
            artist: 'Playlist Track'
          }))}
          setCurrentSong={(song) => {
            setCurrentSong({ 
              ...song,
              artist: 'Playlist Track',
              
            });
            setActiveSongId(song.id);
          }}
          setIsPlaying={setIsPlaying}
          backendUrl={BACKEND_URL}
          onEnded={() => document.dispatchEvent(new Event('audioEnded'))}
          onClose={handleClosePlayer}
          
        />
      )}
    </div>
  );
};

export default Profile;