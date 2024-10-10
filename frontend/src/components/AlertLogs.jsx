import React, { useEffect, useState } from 'react';

function AlertLogs() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5001/api/alerts')
            .then(response => response.json())
            .then(data => setLogs(data))
            .catch(error => console.error('Error fetching alert logs:', error));
    }, []);

    return (
        <div>
            <h2>Alert Logs</h2>
            <ul>
                {logs.map(log => (
                    <li key={log._id}>
                        <p>Type: {log.alertType}</p>
                        <p>Male Count: {log.maleCount}</p>
                        <p>Female Count: {log.femaleCount}</p>
                        <p>Timestamp: {new Date(log.timestamp).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AlertLogs;