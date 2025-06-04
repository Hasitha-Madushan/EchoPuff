import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './header.css';

const UserHeader = () => {
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
      navigate('/UserSearchResults', { 
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
      navigate('/UserSearchResults', { 
        state: { 
          results: [], 
          query: search,
          error: error.message || "Search failed. Please try again later." 
        } 
      });
    }
  }
};
  const handleLogout = () => {
    // Example: remove token or session logic here
    // localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <NavLink to="/client-home" className="logo-link">
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
          <li><NavLink to="/client-home" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          <li><NavLink to="/UserCharts" className={({ isActive }) => isActive ? "active" : ""}>Charts</NavLink></li>
          <li><NavLink to="/UserFestivals" className={({ isActive }) => isActive ? "active" : ""}>Festivals</NavLink></li>
          <li><NavLink to="/UserArtists" className={({ isActive }) => isActive ? "active" : ""}>Artists</NavLink></li>
          <li><NavLink to="/Profile" className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink></li>
          <li><button onClick={handleLogout} className="logout-button">Logout</button></li>
        </ul>
      </nav>
    </header>
  );
};

export default UserHeader;
