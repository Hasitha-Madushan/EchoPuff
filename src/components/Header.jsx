import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './header.css';

const Header = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
  if (e.key === 'Enter' && search.trim()) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/search?q=${encodeURIComponent(search)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const results = await response.json();
      navigate('/search-results', { 
        state: { 
          results: results.map(song => ({
            ...song,
            // Add proper path formatting if needed
          })) || [], 
          query: search 
        } 
      });
      
    } catch (error) {
      console.error('Search failed:', error);
      navigate('/search-results', { 
        state: { 
          results: [], 
          query: search,
          error: error.message || "Search failed. Please try again later." 
        } 
      });
    }
  }
};

  return (
    <header className="header">
      <div className="header-left">
        <NavLink to="/" className="logo-link">
          <img src="/Images/HL1.png" alt="Logo" />
        </NavLink>
        <div className="search-container">
          <img src="/Images/s.png" alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Search for songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            aria-label="Search songs"
          />
        </div>
      </div>

      <nav>
        <ul>
          <li><NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          <li><NavLink to="/charts" className={({ isActive }) => isActive ? "active" : ""}>Charts</NavLink></li>
          <li><NavLink to="/festivals" className={({ isActive }) => isActive ? "active" : ""}>Festivals</NavLink></li>
          <li><NavLink to="/artists" className={({ isActive }) => isActive ? "active" : ""}>Artists</NavLink></li>
          <li><NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Log In</NavLink></li>
          <li><NavLink to="/signup" className={({ isActive }) => isActive ? "active" : ""}>Sign Up</NavLink></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
