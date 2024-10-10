import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

function LiveFeed() {
    const [videoFrame, setVideoFrame] = useState('');

    useEffect(() => {
        socket.on('liveFeed', (data) => {
            setVideoFrame(data.image);
        });

        return () => {
            socket.off('liveFeed');
        };
    }, []);

    const frameStyle = {
        width: '70%',
        objectFit: 'cover',
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    };

    return (
        <div style={containerStyle}>
            {videoFrame ? (
                <img src={`data:image/jpeg;base64,${videoFrame}`} alt="Live Feed" style={frameStyle} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

export default LiveFeed;