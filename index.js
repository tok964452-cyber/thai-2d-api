const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// ညီလေးရဲ့ မူလ API Data Structure (ဝဘ်ဆိုက်နှင့် App အတွက် အခြေခံဒေတာ)
let apiData = {
  "live": {
    "set": "1,626.27",
    "value": "85,650.24",
    "time": "2026-09-14 16:30:00",
    "twod": "70"
  },
  "result": [
    {
      "open_time": "9:30:00",
      "modern": "31",
      "internet": "34"
    },
    {
      "open_time": "12:01:00",
      "set": "1,621.55",
      "value": "53,762.32",
      "twod": "52"
    },
    {
      "open_time": "14:00:00",
      "modern": "76",
      "internet": "79"
    },
    {
      "open_time": "16:30:00",
      "set": "1,626.27",
      "value": "85,650.24",
      "twod": "70"
    }
  ]
};

// Web Pages Routes (ဝဘ်ဆိုက်စာမျက်နှာများ ဖွင့်ရန်)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/history.html', (req, res) => res.sendFile(path.join(__dirname, 'history.html')));
app.get('/3d.html', (req, res) => res.sendFile(path.join(__dirname, '3d.html')));

// APIs Routes (App နှင့် ဝဘ်ဆိုက်က ဒေတာလှမ်းဖတ်ရန်)
app.get('/live', (req, res) => {
    res.json(apiData);
});

app.get('/2d_result', (req, res) => {
    res.json({
        "date": new Date().toISOString().slice(0, 10),
        "child": apiData.result
    });
});

// BACKUP ADMIN SYSTEM (ဂဏန်းများကို ဖုန်း Browser ကနေ လှမ်းပြောင်းနိုင်သောစနစ်)
// သုံးနည်းဥပမာ- https://vercel.app
app.get('/update_2d', (req, res) => {
    const { twod, set, value, modern, internet, target_time } = req.query;
    
    // Live Data ကို အဓိကပြင်ခြင်း
    if (twod && !target_time) {
        apiData.live.twod = twod;
        if (set) apiData.live.set = set;
        if (value) apiData.live.value = value;
        apiData.live.time = new Date().toLocaleString();
        return res.json({ "status": "success", "message": "Live data updated." });
    }
    
    // အချိန်အလိုက် ဇယားကွက်ထဲက ဒေတာကိုပြင်ခြင်း
    if (target_time) {
        let found = apiData.result.find(r => r.open_time.includes(target_time));
        if (found) {
            if (modern) found.modern = modern;
            if (internet) found.internet = internet;
            if (set) found.set = set;
            if (value) found.value = value;
            if (twod) found.twod = twod;
            return res.json({ "status": "success", "message": `${target_time} updated.` });
        }
    }
    res.status(400).send("Invalid request");
});

// Vercel Server Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
