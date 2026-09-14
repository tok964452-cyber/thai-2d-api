const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// မူလ ဒေတာအခြေအနေ (ဝဘ်ဆိုက်ဆွဲမရပါက ဤအရန်ဒေတာများ ပေါ်နေမည်ဖြစ်၍ 500 error မတက်တော့ပါ)
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
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            timeout: 4000 // ၄ စက္ကန့်အတွင်း မကျလာပါက အလိုအလျောက် ကျော်သွားမည်
        });
        const $ = cheerio.load(response.data);
        
        let currentSet = $('.set-index-value').first().text().trim();
        let currentValue = $('.set-market-value').first().text().trim();
        
        if (currentSet && currentValue && currentSet !== "0.00" && currentSet !== "") {
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
        console.log("ဝဘ်ဆိုက်မှ ဒေတာဆွဲမရပါသဖြင့် အရန်ဒေတာကို သုံးပါမည် -", error.message);
        // Error တက်သော်လည်း ပရိုဂရမ်ကို ဆက်လက်အလုပ်လုပ်ခိုင်းခြင်းဖြင့် 500 server error ကို ကျော်ဖြတ်သည်
    }
}

// Web Pages Routes
app.get('/', async (req, res) => {
    try {
        await getLiveThaiSET();
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (err) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.get('/history.html', (req, res) => res.sendFile(path.join(__dirname, 'history.html')));
app.get('/3d.html', (req, res) => res.sendFile(path.join(__dirname, '3d.html')));

// APIs Routes
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

// Vercel Connection
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
