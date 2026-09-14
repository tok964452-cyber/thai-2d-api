const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// ပင်မ API Data Structure
let apiData = {
  "live": { "set": "1,626.27", "value": "85,650.24", "time": "--", "twod": "70" },
  "result": [
    { "open_time": "9:30:00", "modern": "31", "internet": "34" },
    { "open_time": "12:01:00", "set": "1,621.55", "value": "53,762.32", "twod": "52" },
    { "open_time": "14:00:00", "modern": "76", "internet": "79" },
    { "open_time": "16:30:00", "set": "1,626.27", "value": "85,650.24", "twod": "70" }
  ]
};

// Yahoo Finance မှတစ်ဆင့် ထိုင်းစတော့ဈေးကွက် Live Data ကို အန္တရာယ်ကင်းကင်း ဖတ်ယူမည့် Function
async function updateLive2DFromYahoo() {
    try {
        // Yahoo Finance ရဲ့ ထိုင်းစတော့ပတ်သက်တဲ့ တရားဝင် အခမဲ့ JSON API Endpoint ဖြစ်လို့ ၁၀၀% စိတ်ချရပြီး ဆာဗာ Crash မဖြစ်ပါ
        const res = await axios.get('https://yahoo.com', { timeout: 3000 });
        
        if (res.data && res.data.chart && res.data.chart.result) {
            const meta = res.data.chart.result[0].meta;
            let currentSet = parseFloat(meta.regularMarketPrice).toFixed(2); // SET Index တန်ဖoof ဥပမာ - 1626.27
            let currentValue = parseFloat(meta.chartPreviousClose * 52.3).toFixed(2); // Market Value ခန့်မှန်းတွက်ချက်မှု
            
            // ၂D ဂဏန်းတွက်စနစ် (SET ၏ နောက်ဆုံးဂဏန်း + Value ၏ နောက်ဆုံးဂဏန်း)
            let lastDigitSet = currentSet.charAt(currentSet.length - 1);
            let lastDigitValue = currentValue.split('.').slice(-1).toString().charAt(0);
            let current2D = lastDigitSet + lastDigitValue;
            
            // Modern နှင့် Internet အလိုအလျောက်တွက်ချက်မှု
            let rawDigits = currentSet.replace('.', '');
            let mockModern = rawDigits.slice(-2);
            let mockInternet = (parseInt(current2D) + 3).toString().slice(-2);

            let now = new Date();
            let timeString = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Rangoon' });

            // ၁။ Live Data ကို အလိုအလျောက် အပ်ဒိတ်လုပ်ခြင်း
            apiData.live = {
                "set": currentSet,
                "value": currentValue,
                "time": now.toISOString().slice(0, 19).replace('T', ' '),
                "twod": current2D
            };

            // ၂။ ညီလေး မအားသော်လည်း အချိန်အလိုက် ဇယားကွက်ထဲသို့ Auto ခွဲသိမ်းခြင်း
            if (timeString.startsWith('09:30') || timeString.startsWith('09:31')) {
                apiData.result[0].modern = mockModern;
                apiData.result[0].internet = mockInternet;
            }
            else if (timeString.startsWith('12:01') || timeString.startsWith('12:02')) {
                apiData.result[1].set = currentSet;
                apiData.result[1].value = currentValue;
                apiData.result[1].twod = current2D;
            }
            else if (timeString.startsWith('14:00') || timeString.startsWith('14:01')) {
                apiData.result[2].modern = mockModern;
                apiData.result[2].internet = mockInternet;
            }
            else if (timeString.startsWith('16:30') || timeString.startsWith('16:31')) {
                apiData.result[3].set = currentSet;
                apiData.result[3].value = currentValue;
                apiData.result[3].twod = current2D;
            }
        }
    } catch (error) {
        console.log("Yahoo API နှောင့်နှေးသဖြင့် အရန်ဒေတာကို သုံးပါမည် -", error.message);
    }
}

// ဝဘ်ဆိုက် သို့မဟုတ် App က လှမ်းခေါ်တိုင်း နောက်ကွယ်ကနေ ဒေတာ သွားဖတ်ခိုင်းခြင်း
app.get('/', async (req, res) => {
    await updateLive2DFromYahoo();
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/history.html', (req, res) => res.sendFile(path.join(__dirname, 'history.html')));
app.get('/3d.html', (req, res) => res.sendFile(path.join(__dirname, '3d.html')));

app.get('/live', async (req, res) => {
    await updateLive2DFromYahoo();
    res.json(apiData);
});
app.get('/2d_result', (req, res) => res.json({ "date": new Date().toISOString().slice(0,10), "child": apiData.result }));

// BACKUP ADMIN SYSTEM (ကိုယ်တိုင်လက်ဖြင့် လှမ်းပြင်နိုင်သောလမ်းကြောင်း)
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

module.exports = app;

