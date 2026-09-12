const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// နမူနာ ဒေတာများ (Sample Data matching your API spec)
let currentLive = {
  "live": {
    "set": "1,626.27",
    "value": "85,650.24",
    "time": "2026-09-12 16:12:40",
    "twod": "70"
  },
  "result": [
    { "set": "1,623.03", "value": "42,311.39", "open_time": "9:30:00", "twod": "31" },
    { "set": "1,621.55", "value": "53,762.32", "open_time": "12:01:00", "twod": "52" },
    { "set": "1,622.37", "value": "67,016.57", "open_time": "14:00:00", "twod": "76" },
    { "set": "1,626.27", "value": "85,650.24", "open_time": "16:30:00", "twod": "70" }
  ]
};

// Home Route
app.get('/', (req, res) => {
    res.send("Thai 2D/3D API Server is Running.");
});

// 1. Daily Live API
app.get('/live', (req, res) => {
    res.json(currentLive);
});

// 2. 2D Result API (Last 10 days or by date ?date=DD-MM-YYYY)
app.get('/2d_result', (req, res) => {
    const { date } = req.query;
    if (date) {
        res.json({
            date: date,
            child: currentLive.result
        });
    } else {
        res.json([
            {
                date: "2026-09-12",
                child: currentLive.result
            }
        ]);
    }
});

// 3. 2D Result History API (?twod=97&date=2021-11-26)
app.get('/2d_history', (req, res) => {
    const { twod, date } = req.query;
    res.json([
        {
            date: date || "2021-11-26",
            child: [
                {
                    time: "11:00:00",
                    set: "1,633.79",
                    value: "45,017.89",
                    twod: twod || "97",
                    is_result: "on"
                }
            ]
        }
    ]);
});

// 4. History of 2D API by date (?date=2021-11-05)
app.get('/history', (req, res) => {
    const { date } = req.query;
    res.json([
        {
            date: date || "2021-11-05",
            child: currentLive.result
        }
    ]);
});

// Data Update Route (Admin update)
app.post('/api/update', (req, res) => {
    const { live, result } = req.body;
    if (live) currentLive.live = live;
    if (result) currentLive.result = result;
    res.json({ success: true, message: "Updated successfully", data: currentLive });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

