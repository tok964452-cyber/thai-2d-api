const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// မူလ Data Structure
let apiData = {
  "live": { "set": "1,626.27", "value": "85,650.24", "time": "2026-09-14 16:30:00", "twod": "70" },
  "result": [
    { "open_time": "9:30:00", "modern": "31", "internet": "34" },
    { "open_time": "12:01:00", "set": "1,621.55", "value": "53,762.32", "twod": "52" },
    { "open_time": "14:00:00", "modern": "76", "internet": "79" },
    { "open_time": "16:30:00", "set": "1,626.27", "value": "85,650.24", "twod": "70" }
  ]
};

// ထိုင်းဝဘ်ဆိုက်မှ Live ဒေတာဆွဲယူမည့် Function
async function getLiveThaiSET() {
    try {
        const response = await axios.get('https://set.or.th', {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
        });
        const $ = cheerio.load(response.data);
        
        let currentSet = $('.set-index-value').first().text().trim();
        let currentValue = $('.set-market-value').first().text().trim();
        
        if (currentSet && currentValue && currentSet !== "0.00") {
            let lastDigitSet = currentSet.charAt(currentSet.length - 1);
            let lastDigitValue = currentValue.split('.').slice(-1)[0].charAt(0);
            let current2D = lastDigitSet + lastDigitValue;
            
            apiData.live = {
                "set": currentSet,
                "value": currentValue,
                "time": new Date().toISOString().slice(0, 19).replace('T', ' '),
                "twod": current2D
            };
        }
    } catch (error) {
        console.error("Scraping Error:", error.message);
    }
}

// Web Pages Routes (ဝဘ်ဆိုက်ဖွင့်ရန်)
app.get('/', async (req, res) => {
    await getLiveThaiSET(); // ဝဘ်ဆိုက်ဖွင့်လိုက်တိုင်း နောက်ဆုံးရဒေတာကို Auto သွားဆွဲခိုင်းခြင်း
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/history.html', (req, res) => res.sendFile(path.join(__dirname, 'history.html')));
app.get('/3d.html', (req, res) => res.sendFile(path.join(__dirname, '3d.html')));

// APIs Routes (App နှင့် Web JSON ဖတ်ရန်)
app.get('/live', async (req, res) => {
    await getLiveThaiSET();
    res.json(apiData);
});

app.get('/2d_result', (req, res) => {
    res.json({ "date": new Date().toISOString().slice(0,10), "child": apiData.result });
});

// BACKUP ADMIN SYSTEM
app.get('/update_2d', (req, res) => {
    const { twod, set, value, modern, internet, target_time } = req.query;
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

// index.js ရဲ့ အောက်ဆုံးနားတွင် ဤသို့ ပြန်ပြောင်းပါ
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;


