import React from "react";

export default function PlaylistCard({ playlist, onClick }) {
  let iconUrl = "";
  let defaultCover = "/src/default-playlist.jpg";

  if (playlist.name === "watch-later") {
    iconUrl = "https://pixelsea.neocities.org/icons/puff-folder-yellow.gif";
    defaultCover = "/src/watch-later-playlist.jpg";
  } else if (playlist.name === "watched") {
    iconUrl = "https://pixelsea.neocities.org/icons/puff-folder-green.gif";
    defaultCover = "/src/watched-playlist.jpg";
  } else if (playlist.name === "liked") {
    iconUrl = "https://pixelsea.neocities.org/icons/puff-folder-red.gif";
    defaultCover = "/src/liked-playlist.jpg";
  }
  

  return (
    <div className="playlist-card" onClick={onClick}>
      <img src={playlist.cover || defaultCover} alt={playlist.name} />
      <div className="title">
        {playlist.name}
        {iconUrl && <img src={iconUrl} style={{ width: 20, height: 20, marginLeft: 4, verticalAlign: "middle" }} />}
      </div>
      <style jsx>{`
        .playlist-card {
          background-color: #0F1C24;
          color: #41D3D2;
          border: 1px solid #41D3D2;
          border-radius: 0;
          box-shadow: 0 2px 5px rgba(0,0,0,.1);
          overflow: hidden;
          text-align: center;
          cursor: pointer;
          transition: transform .2s;
        }
        .playlist-card:hover { transform: scale(1.05); }
        .playlist-card img { width: 100%; height: 120px; object-fit: cover; }
        .title { padding: .5rem; font-weight: 600; }
      `}</style>
    </div>
  );
}
