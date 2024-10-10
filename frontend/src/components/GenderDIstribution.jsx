import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

function GenderDistribution() {
    const [genderData, setGenderData] = useState({
        maleCount: 0,
        femaleCount: 0
    });

    useEffect(() => {
        socket.on('liveFeed', (data) => {
            setGenderData({
                maleCount: data.maleCount,
                femaleCount: data.femaleCount
            });
        });

        return () => {
            socket.off('liveFeed');
        };
    }, []);

    return (
        <div>
            <h2>Gender Distribution</h2>
            <p>Male Count: {genderData.maleCount}</p>
            <p>Female Count: {genderData.femaleCount}</p>
        </div>
    );
}

export default GenderDistribution;