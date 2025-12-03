import React from 'react';

// Define the props for the component
interface VimeoPlayerProps {
  videoId: string;
  width?: number | string;
  height?: number | string;
}

const VimeoPlayer: React.FC<VimeoPlayerProps> = ({ videoId, width = 640, height = 360 }) => {
  // Construct the full embed URL
  const embedUrl = `https://player.vimeo.com/video/${videoId}?h=abcdef1234&badge=0&autopause=0&player_id=0&app_id=58479`;

  return (
    <div className="vimeo-player-container">
      <iframe
        src={embedUrl}
        width={width}
        height={height}
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo Video Player"
      ></iframe>
    </div>
  );
};

export default VimeoPlayer;