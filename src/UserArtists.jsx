import React from 'react';
import './Artists.css';
import UserHeader from './components/UserHeader';

const artists = [
  { name: "Martin Garrix", img: "./assets/Artist/MG1.jpg" },
  { name: "Tiesto", img: "/assets/Artist/Tiesto.jpg" },
  { name: "Armin Van Buuren", img: "/assets/Artist/Armin Van Buuren.webp" },
  { name: "Hardwell", img: "/assets/Artist/Hardwell.jpeg" },
  { name: "David Guetta", img: "/assets/Artist/David Guetta.jpeg" },
  { name: "Alesso", img: "/assets/Artist/Alesso.jpeg" },
  { name: "Kaaze", img: "/assets/Artist/Kaaze1.jpg" },
  { name: "Dimitri Vegas & Like Mike", img: "/assets/Artist/Dimitri Vegas & Like Mike1.jpg" },
  { name: "Anyma", img: "/assets/Artist/Anyma.jpeg" },
  { name: "Topic", img: "/assets/Artist/Topic.jpg" },
  { name: "Julian Jordan", img: "/assets/Artist/Julian Jordan1.jpeg" },
  { name: "Matisse & Sadko", img: "/assets/Artist/Matisse & Sadko.jpeg" },
  { name: "Daxon", img: "/assets/Artist/Daxon.jpg" },
  { name: "Marlo", img: "/assets/Artist/Marlo.jpg" },
  { name: "Afrojack", img: "/assets/Artist/Afrojack.jpg" },
  { name: "Nicky Romero", img: "/assets/Artist/NR.jpg" },
  { name: "Tujamo", img: "/assets/Artist/Tujamo.jpg" },
  { name: "James Hype", img: "/assets/Artist/JH.jpg" },
  { name: "Calvin Harris", img: "/assets/Artist/CH.jpg" },
  { name: "Third Party", img: "/assets/Artist/TP.jpg" },
  { name: "Skrillex", img: "/assets/Artist/Skrillex.jpg" },
];

const Artists = () => {
  return (
    <div className="artists-page">
      {/* Top Header Section */}
      <div className="artists-header">
        <UserHeader />
      </div>

      {/* Main Content */}
      <div className="artists-container1">
        <h1>ARTISTS</h1>
        <div className="artists-grid1">
          {artists.map((artist, index) => (
            <div className="artist-card1" key={index}>
              <img src={artist.img} alt={artist.name} />
              <p>{artist.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Artists;
