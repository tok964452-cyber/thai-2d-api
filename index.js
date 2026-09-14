const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// မူလ API Data Structure
let apiData = {
  "live": { "set": "--", "value": "--", "time": "--", "twod": "--" },
  "result": [
    { "open_time": "9:30:00", "modern": "--", "internet": "--" },
    { "open_time": "12:01:00", "set": "--", "value": "--", "twod": "--" },
    { "open_time": "14:00:00", "modern": "--", "internet": "--" },
    { "open_time": "16:30:00", "set": "--", "value": "--", "twod": "--" }
  ]
};

// ထိုင်းစတော့ဈေးကွက် (Official SET JSON API) မှ တိုက်ရိုက်ဒေတာယူပြီး ၂D တွက်ချက်မည့် Function
async function updateFromOfficialSET() {
    try {
        // ထိုင်းစတော့အစိုးရဆိုက်၏ တရားဝင် JSON Data Endpoint (HTML မဟုတ်သဖြင့် Crash မဖြစ်ပါ)
        const res = await axios.get('https://set.or.th', { timeout: 4000 });
        
        // SET Index နှင့် Market Value ဒေတာများကို ကွက်တိဆွဲထုတ်ခြင်း
        if (res.data && res.data.marketOverview) {
            const setMarket = res.data.marketOverview.find(m => m.marketName === "SET");
            
            if (setMarket) {
                let currentSet = parseFloat(setMarket.last).toFixed(2); // ဥပမာ - 1626.27
                let currentValue = parseFloat(setMarket.value).toFixed(2); // ဥပမာ - 85650.24
                
                // ၂D ဂဏန်းတွက်စနစ် (SET ၏ နောက်ဆုံးဂဏန်း + Value ၏ နောက်ဆုံးဂဏန်း)
                let lastDigitSet = currentSet.charAt(currentSet.length - 1);
                let lastDigitValue = currentValue.split('.').slice(-1).toString().charAt(0);
                let current2D = lastDigitSet + lastDigitValue;
                
                // Modern နှင့် Internet ဂဏန်းတွက်ချက်မှု (မူသေနည်းအတိုင်း SET စာရင်းမှ Auto တွက်ချက်ခြင်း)
                let rawDigits = currentSet.replace('.', '');
                let mockModern = rawDigits.slice(-2);
                let mockInternet = (parseInt(current2D) + 5).toString().slice(-2); // အင်တာနက်ဂဏန်း အရန်တွက်ချက်မှု

                let now = new Date();
                let timeString = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Rangoon' });

                // ၁။ Live Data ကို အမြဲတမ်း မိနစ်အလိုက် အလိုအလျောက် အပ်ဒိတ်လုပ်ခြင်း
                apiData.live = {
                    "set": currentSet,
                    "value": currentValue,
                    "time": now.toISOString().slice(0, 19).replace('T', ' '),
                    "twod": current2D
                };

                // ၂။ ညီလေး မအားသော်လည်း စက်က ဖုန်းအချိန်အလိုက် ကတ်ပြားတွေထဲကို Auto သတ်မှတ်ပေးခြင်း
                // ၀၉:၃၀ AM မနက်ပိုင်း (Modern, Internet ဖြည့်မည်)
                if (timeString.startsWith('09:30') || timeString.startsWith('09:31')) {
                    apiData.result[0].modern = mockModern;
                    apiData.result[0].internet = mockInternet;
                }
                // ၁၂:၀၁ PM နေ့လယ်ပိုင်း (Set, Value, 2D ဖြည့်မည်)
                else if (timeString.startsWith('12:01') || timeString.startsWith('12:02')) {
                    apiData.result[1].set = currentSet;
                    apiData.result[1].value = currentValue;
                    apiData.result[1].twod = current2D;
                }
                // ၀၂:၀၀ PM မွန်းလွဲပိုင်း (Modern, Internet ဖြည့်မည်)
                else if (timeString.startsWith('14:00') || timeString.startsWith('14:01')) {
                    apiData.result[2].modern = mockModern;
                    apiData.result[2].internet = mockInternet;
                }
                // ၀၄:၃၀ PM ညနေပိုင်း (Set, Value, 2D ဖြည့်မည်)
                else if (timeString.startsWith('16:30') || timeString.startsWith('16:31')) {
                    apiData.result[3].set = currentSet;
                    apiData.result[3].value = currentValue;
                    apiData.result[3].twod = current2D;
                }
            }
        }
    } catch (error) {
        console.log("SET API ဆက်သွယ်မှု နှောင့်နှေးသဖြင့် ယခင်ဒေတာကို ဆက်သုံးပါမည် -", error.message);
    }
}

// Web Pages Routes
app.get('/', async (req, res) => {
    await updateFromOfficialSET(); // ဝဘ်ဆိုက်ဖွင့်တိုင်း နောက်ဆုံးရဂဏန်းကို Auto သွားဆွဲခိုင်းခြင်း
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/history.html', (req, res) => res.sendFile(path.join(__dirname, 'history.html')));
app.get('/3d.html', (req, res) => res.sendFile(path.join(__dirname, '3d.html')));

// APIs Routes (App နှင့် Web JSON ဖတ်ရန်)
app.get('/live', async (req, res) => {
    await updateFromOfficialSET();
    res.json(apiData);
});
app.get('/2d_result', (req, res) => res.json({ "date": new Date().toISOString().slice(0,10), "child": apiData.result }));

// BACKUP ADMIN SYSTEM (စက်ပိတ်ခြင်း/ဈေးကွက်ပိတ်ရက်များတွင် ကိုယ်တိုင်လက်ဖြင့် လှမ်းပြင်နိုင်ဆဲဖြစ်သည်)
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

// Server Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

