import React from 'react';

// Define the props for the component
interface VimeoPlayerProps {
  videoId: string;
  hash?: string;
  width?: number | string;
  height?: number | string;
}

const VimeoPlayer: React.FC<VimeoPlayerProps> = ({ videoId, hash, width = 640, height = 360 }) => {
  const embedUrl = `https://player.vimeo.com/video/${videoId}${hash ? `?h=${hash}` : ''}`;

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