import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import App from './App.jsx';
import LoginPage from './Login.jsx';
import Signup from './Signup.jsx';
import Artists from './Artists.jsx';
import Charts from './Charts.jsx';
import Festivals from './festivals.jsx';
import Layout from './components/Layout';
import SearchResults from './components/SearchResults';
import ClientHome from './ClientHome.jsx';
import UserCharts from './UserCharts.jsx';
import UserFestivals from './UserFestivals.jsx';
import UserArtists from './UserArtists.jsx';
import UserSearchResults from './components/UserSearchResults';
import Profile from './Profile.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Routes with Header */}
        <Route element={<Layout />}>
          <Route path="/" element={<App />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/festivals" element={<Festivals />} /> 
          <Route path="/search-results" element={<SearchResults />} />
          
        </Route>

        {/* Routes WITHOUT Header */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client-home" element={<ClientHome />} />
         <Route path="/UserCharts" element={<UserCharts />} />
         <Route path="/UserFestivals" element={<UserFestivals />} />
         <Route path="/UserArtists" element={<UserArtists />} />
         <Route path="/UserSearchResults" element={<UserSearchResults />} />
         <Route path="/Profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
