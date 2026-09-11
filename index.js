const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// အချိန်ဇယားအမှန်အတိုင်း သတ်မှတ်ထားသော ကိုယ်ပိုင်ဒေတာ
let my2DDatabase = {
    live_number: "97", 
    updated_at: "2026-09-11 04:00:00",
    results: {
        "09_30_AM": { set: "1,605.32", value: "35,326.05", twod: "26" },
        "12_01_PM": { set: "1,604.76", value: "43,229.58", twod: "69" },
        "02_00_PM": { set: "1,605.82", value: "57,885.24", twod: "25" },
        "04_30_PM": { set: "1,605.39", value: "64,057.39", twod: "--" }
    }
};

// အဓိက လမ်းကြောင်း (Home IP) ဝင်လျှင် သတိပေးချက်ပြရန်
app.get('/', (req, res) => {
    res.send("Thai 2D API Server is Running. Please go to /api/2d to see data.");
});

// ဒေတာအားလုံးကို လှမ်းဖတ်မည့်လမ်းကြောင်း (GET)
app.get('/api/2d', (req, res) => {
    res.json({
        success: true,
        data: my2DDatabase
    });
});

// ဂဏန်းများ လှမ်းပြင်မည့်လမ်းကြောင်း (POST)
app.post('/api/2d/update', (req, res) => {
    const { time_slot, set, value, twod, live_number } = req.body;

    if (live_number) my2DDatabase.live_number = live_number;

    if (time_slot && my2DDatabase.results[time_slot]) {
        if (set) my2DDatabase.results[time_slot].set = set;
        if (value) my2DDatabase.results[time_slot].value = value;
        if (twod) my2DDatabase.results[time_slot].twod = twod;
    }

    const now = new Date();
    my2DDatabase.updated_at = now.toLocaleString();

    res.json({ success: true, updated_data: my2DDatabase });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

