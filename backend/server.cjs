const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'echopuff'
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static directories
const SONGS_DIR = path.join(__dirname, 'songs');
const TOP10SONGS_DIR = path.join(__dirname, 'top10Songs');
const GENRE_BASE_DIR = path.join(__dirname, 'genres');

// Database connection check
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Registration endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(201).json({ message: 'User registered successfully' , userId: result.insertId });
  });
});

//
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    
    // Direct password comparison (INSECURE - for testing only)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({ message: 'Login successful', userId: user.id , email: user.email  });
  });
});


// Search endpoint with normalization

// Add this endpoint to your Express server (in the existing server file)
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q.toLowerCase().trim();
    if (!query) return res.json([]);

    const results = [];

    // Helper function to search directories
    const searchDirectory = async (dirPath, routePath) => {
      try {
        const files = await fs.promises.readdir(dirPath);
        files.forEach(file => {
          if (file.toLowerCase().includes(query) && file.endsWith('.mp3')) {
            results.push({
              title: file,
              path: `${routePath}/${file}`
            });
          }
        });
      } catch (error) {
        console.error(`Error searching directory ${dirPath}:`, error);
      }
    };

    // Search main songs directory
    await searchDirectory(SONGS_DIR, 'songs');

    // Search top10 songs directory
    await searchDirectory(TOP10SONGS_DIR, 'top10Songs');

    // Search genre directories
    const genreDirs = await fs.promises.readdir(GENRE_BASE_DIR);
    for (const genreDir of genreDirs) {
      const fullPath = path.join(GENRE_BASE_DIR, genreDir);
      const stat = await fs.promises.stat(fullPath);
      if (stat.isDirectory()) {
        await searchDirectory(fullPath, `genres/${genreDir}`);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  // Modified search endpoint with better matching

// Existing endpoints
app.get('/api/songs', (req, res) => {
  fs.readdir(SONGS_DIR, (err, files) => {
    if (err) return res.status(500).send('Error reading songs directory');
    const mp3Files = files.filter(file => file.endsWith('.mp3'));
    res.json(mp3Files);
  });
});

app.get('/api/top10Songs', (req, res) => {
  fs.readdir(TOP10SONGS_DIR, (err, files) => {
    if (err) {
      console.error('Error reading top10 directory:', err);
      return res.status(500).send('Error reading top10 directory');
    }
    const mp3Files = files.filter(file => file.endsWith('.mp3'));
    res.json(mp3Files);
  });
});

app.get('/api/songs/:genre', (req, res) => {
  const genreName = req.params.genre;
  const genreDir = path.join(GENRE_BASE_DIR, genreName);

  if (!fs.existsSync(genreDir)) {
    return res.status(404).send('Genre folder not found');
  }

  fs.readdir(genreDir, (err, files) => {
    if (err) {
      console.error(`Error reading genre folder for ${genreName}:`, err);
      return res.status(500).send('Error reading genre folder');
    }

    const mp3Files = files.filter(file => file.endsWith('.mp3')).map(title => ({
      title,
      source: `genres/${genreName}`
    }));

    res.json(mp3Files);
  });
});

// File serving endpoints
// Update your server routes to handle all song paths:
app.get('/songs/:filename', (req, res) => {
  const filePath = path.join(SONGS_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Song not found');
  }
});

app.get('/top10Songs/:filename', (req, res) => {
  const filePath = path.join(TOP10SONGS_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Top10 song not found');
  }
});

app.get('/genres/:genre/:filename', (req, res) => {
  const filePath = path.join(GENRE_BASE_DIR, req.params.genre, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Genre song not found');
  }
});



app.post('/playlists', (req, res) => {
  const { user_id, name } = req.body;
  if (!user_id || !name) {
    return res.status(400).json({ error: 'User ID and name are required' });
  }

  const query = 'INSERT INTO playlists (user_id, name) VALUES (?, ?)';
  db.query(query, [user_id, name], (err, result) => {
    if (err) {
      console.error('Error creating playlist:', err);
      return res.status(500).json({ error: 'Failed to create playlist' });
    }
    res.json({ message: 'Playlist created', playlistId: result.insertId });
  });
});



app.get('/playlists/:userId', (req, res) => {
  const userId = parseInt(req.params.userId); 

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = 'SELECT id, name FROM playlists WHERE user_id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching playlists:', err);
      return res.status(500).json({ error: 'Failed to fetch playlists' });
    }
    res.json(results);
  });
});


app.post('/playlist-songs', (req, res) => {
  const { userId, playlistId, songPath } = req.body;
  
  // First check if song exists in playlist
  db.query(
    'SELECT id FROM playlist_songs WHERE playlist_id = ? AND song_path = ?',
    [playlistId, songPath],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        return res.status(409).json({ error: 'Song already in playlist' });
      }

      // If not duplicate, insert
      db.query(
        'INSERT INTO playlist_songs (user_id, playlist_id, song_path) VALUES (?, ?, ?)',
        [userId, playlistId, songPath],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({
            success: true,
            song: {
              id: result.insertId.toString(),
              path: songPath,
              title: songPath.split('/').pop(),
              url: `http://localhost:5000/${songPath}`
            }
          });
        }
      );
    }
  );
});



// Delete playlist endpoint
app.delete('/playlists/:playlistId', (req, res) => {
  const playlistId = req.params.playlistId;
  
  db.query(
    'DELETE FROM playlists WHERE id = ?',
    [playlistId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Playlist deleted' });
    }
  );
});




app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use('/songs', express.static(SONGS_DIR));
app.use('/top10Songs', express.static(TOP10SONGS_DIR));
app.use('/genres', express.static(GENRE_BASE_DIR));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Update the GET playlist songs endpoint
app.get('/playlist-songs/:playlistId', (req, res) => {
  const playlistId = req.params.playlistId;
  db.query(
    'SELECT id, song_path FROM playlist_songs WHERE playlist_id = ?',
    [playlistId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
       const songs = results.map(row => {
        // Extract source and title from path
        const pathParts = row.song_path.split('/');
        const source = pathParts[0];
        const title = pathParts.slice(1).join('/');
        
        return {
          id: row.id.toString(),
          title: decodeURIComponent(title),
          source: source,
          url: `http://localhost:5000/${encodeURI(row.song_path)}`
        };
      });
      
      res.json(songs);
    }
  );
});

app.delete('/playlist-songs/:songId', (req, res) => {
  const songId = req.params.songId;
  db.query('DELETE FROM playlist_songs WHERE id = ?', [songId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Song removed' });
  });
});