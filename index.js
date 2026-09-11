const express = require('express');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// သင့်ပုံထဲက အချိန်ဇယား (၄) ခုအတိုင်း ကွက်တိပြင်ဆင်ထားသော ဒေတာဘေ့စ်
let my2DDatabase = {
    live_number: "97", 
    updated_at: "2026-09-11 03:50:00",
    results: {
        "09_30_AM": { set: "1,605.32", value: "35,326.05", twod: "26" },
        "12_01_PM": { set: "1,604.76", value: "43,229.58", twod: "69" },
        "02_00_PM": { set: "1,605.82", value: "57,885.24", twod: "25" },
        "04_30_PM": { set: "1,605.39", value: "64,057.39", twod: "--" }
    }
};

// ၁။ ဒေတာအားလုံးကို လှမ်းဖတ်မည့်လမ်းကြောင်း (GET)
app.get('/api/2d', (req, res) => {
    res.json({
        success: true,
        source: "My Personal Custom API (Correct Timetable)",
        data: my2DDatabase
    });
});

// ၂။ သတ်မှတ်ထားသော အချိန်ကွက်တစ်ခုချင်းစီကို လှမ်းပြင်မည့်လမ်းကြောင်း (POST)
app.post('/api/2d/update-time', (req, res) => {
    const { time_slot, set, value, twod, live_number } = req.body;

    if (live_number) my2DDatabase.live_number = live_number;

    if (time_slot && my2DDatabase.results[time_slot]) {
        if (set) my2DDatabase.results[time_slot].set = set;
        if (value) my2DDatabase.results[time_slot].value = value;
        if (twod) my2DDatabase.results[time_slot].twod = twod;
    }

    const now = new Date();
    my2DDatabase.updated_at = now.toISOString().replace('T', ' ').substring(0, 19);

    res.json({
        success: true,
        message: `${time_slot || 'Live Number'} ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`,
        updated_data: my2DDatabase
    });
});

app.listen(PORT, () => console.log(`API with correct timetable running on port ${PORT}`));

