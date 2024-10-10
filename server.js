const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Alert = require('./models/alert'); // Define your Alert model in models/alert.js\
const cors = require('cors')

const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors())

const MONGO_URI = 'mongodb+srv://subhransutripathy05:<Bqoib81rurucs1EQ>@cluster0.d4xm6.mongodb.net/';
mongoose.connect(MONGO_URI);

let lastAlertTime = 0;
const ALERT_IGNORE_TIME = 5000; // 5 seconds

io.on('connection', (socket) => {
    console.log('New client connected');

    // Emit live camera feed and alerts
    socket.on('info', async (data) => {
        // Emit live camera feed
        io.emit('liveFeed', {
            image: data.image,
            maleCount: data.male_count,
            femaleCount: data.female_count
        });

        // Check if an alert is present
        if (data.sos_detected || data.woman_surrounded || data.lone_woman_at_night) {
            const now = Date.now();
            if (now - lastAlertTime > ALERT_IGNORE_TIME) {
                lastAlertTime = now;

                // Save alert to MongoDB
                const alert = new Alert({
                    alertType: data.sos_detected ? 'sos_detected' :
                               data.woman_surrounded ? 'woman_surrounded' :
                               'lone_woman_at_night',
                    maleCount: data.male_count,
                    femaleCount: data.female_count,
                    timestamp: new Date()
                });

                await alert.save();

                // Emit the alert
                io.emit('alert', {  // Emit to all connected clients
                    alertType: alert.alertType,
                    maleCount: alert.maleCount,
                    femaleCount: alert.femaleCount,
                    timestamp: alert.timestamp
                });
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// to fetch alert logs
app.get('/api/alerts', async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ timestamp: -1 }); // Get all alerts sorted by timestamp descending
        res.json({alerts});
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Serve JSON data for heatmap
app.get('/data', async (req, res) => {
    await fs.readFile(path.join(__dirname, 'output_coordinates.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading file');
            return;
        }
        res.json(JSON.parse(data));
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});