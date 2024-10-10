import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';


const socket = io('http://localhost:5001');

function AlertPopup() {
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    socket.on('alert', (data) => {
      setAlertData(data);

      // Automatically dismiss the alert after 5 seconds
      const timer = setTimeout(() => {
        setAlertData(null);
      }, 5000);

      return () => clearTimeout(timer);
    });

    return () => {
      socket.off('alert');
    };
  }, []);

  return (
    alertData && (
      <div className="fixed top-4 right-4 z-50">
        
          
            
            <p>Alert: {alertData.alertType}</p>
            <p>Male Count: {alertData.maleCount}</p>
            <p>Female Count: {alertData.femaleCount}</p>
            <p>Timestamp: {new Date(alertData.timestamp).toLocaleString()}</p>
          
        
      </div>
    )
  );
}

export default AlertPopup;