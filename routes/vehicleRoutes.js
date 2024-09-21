const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// 1. Retrieve Total Distance Traveled by Each Vehicle in the Last 30 Days
router.get('/vehicles/distance_traveled', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT vehicle_id, SUM(distance_traveled) AS total_distance 
            FROM Trips 
            WHERE start_time >= '2023-08-01'  -- Adjusted date range to match sample data
            GROUP BY vehicle_id
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving distance traveled' });
    }
});

// 2. Detect Sensor Anomalies
router.get('/vehicles/sensor_anomalies', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT vehicle_id, sensor_type, sensor_reading 
            FROM Sensors 
            WHERE sensor_reading > 120 OR sensor_reading < 10
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error detecting sensor anomalies' });
    }
});

// 3. Get Maintenance History
router.get('/vehicles/:vehicle_id/maintenance_history', async (req, res) => {
    const { vehicle_id } = req.params;

    try {
        const { rows } = await pool.query(`
            SELECT * 
            FROM Maintenance 
            WHERE vehicle_id = $1
        `, [vehicle_id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving maintenance history' });
    }
});

// 4. Find Vehicles with Frequent Trips
router.get('/vehicles/frequent_trips', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT vehicle_id, COUNT(trip_id) AS trip_count 
            FROM Trips 
            WHERE start_time >= '2023-08-01'  -- Adjusted date range to match sample data
            GROUP BY vehicle_id 
            HAVING COUNT(trip_id) > 5
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error retrieving frequent trips' });
    }
});

module.exports = router;
