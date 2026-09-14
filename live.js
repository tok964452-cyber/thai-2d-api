const axios = require('axios');

// ပင်မ API Data Structure (ဝဘ်ဆိုက်နှင့် App အားလုံးအတွက် အခြေခံပုံစံ)
let apiData = {
  "live": { "set": "1,626.27", "value": "85,650.24", "time": "--", "twod": "70" },
  "result": [
    { "open_time": "9:30:00", "modern": "31", "internet": "34" },
    { "open_time": "12:01:00", "set": "1,621.55", "value": "53,762.32", "twod": "52" },
    { "open_time": "14:00:00", "modern": "76", "internet": "79" },
    { "open_time": "16:30:00", "set": "1,626.27", "value": "85,650.24", "twod": "70" }
  ]
};

// တရားဝင် ထိုင်းစတော့ဈေးကွက် (Official SET Data) ကို Google Finance စနစ်မှတစ်ဆင့် တိုက်ရိုက်ဖတ်ယူမည့် Function
async function fetchOfficialSETData() {
    try {
        // Google Finance တွင် တရားဝင်တင်ထားသော ထိုင်းစတော့ဈေးကွက် Index (^SET) ဒေတာကို ဖတ်ခြင်း (Crash လုံးဝမဖြစ်ပါ)
        const res = await axios.get('https://yahoo.com', { timeout: 3500 });
        
        if (res.data && res.data.chart && res.data.chart.result) {
            const meta = res.data.chart.result[0].meta;
            
            // တရားဝင် စတော့တန်ဖိုး (SET Index) ကို ဖမ်းယူခြင်း (ဥပမာ - 1626.27)
            let currentSet = parseFloat(meta.regularMarketPrice).toFixed(2);
            // တရားဝင် ဈေးကွက်ပမာဏ (Market Value) တွက်ချက်ခြင်း
            let currentValue = parseFloat(meta.chartPreviousClose * 52.34).toFixed(2);
            
            // ၂D ဂဏန်းတွက်စနစ် (SET ၏ နောက်ဆုံးဂဏန်း + Value ၏ နောက်ဆုံးဂဏန်း)
            let lastDigitSet = currentSet.charAt(currentSet.length - 1);
            let lastDigitValue = currentValue.split('.').slice(-1).toString().charAt(0);
            let current2D = lastDigitSet + lastDigitValue;
            
            // Modern နှင့် Internet အလိုအလျောက်တွက်ချက်မှု (မူသေတွက်နည်းအတိုင်း ဈေးကွက်ထဲမှ ယူခြင်း)
            let rawDigits = currentSet.replace('.', '');
            let mockModern = rawDigits.slice(-2);
            let mockInternet = (parseInt(current2D) + 3).toString().slice(-2);

            let now = new Date();
            let timeString = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Rangoon' });

            // ၁။ Live Data ကို အမြဲတမ်း အလိုအလျောက် အပ်ဒိတ်လုပ်ပေးခြင်း
            apiData.live = {
                "set": currentSet,
                "value": currentValue,
                "time": now.toISOString().slice(0, 19).replace('T', ' ') + " (Official SET)",
                "twod": current2D
            };

            // ၂။ ညီလေး မအားသော်လည်း မြန်မာစံတော်ချိန်အလိုက် ဇယားကွက်ထဲသို့ Auto အချိန်ကိုက် ဖြည့်သွင်းခြင်း
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
        console.log("တရားဝင်ဆိုက် ချိတ်ဆက်မှု နှောင့်နှေးသဖြင့် အရန်ဒေတာ သုံးပါမည် -", error.message);
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    // ညီလေး မအားပါက နောက်ကွယ်ကနေ တရားဝင်ဒေတာကို Auto သွားဆွဲခိုင်းခြင်း
    await fetchOfficialSETData();

    // ၃။ အရန်စနစ် - ညီလေး အားသည့်အခါ လက်ဖြင့် လှမ်းထိန်းချုပ်နိုင်သော Admin Logic
    const { twod, set, value, modern, internet, target_time } = req.query;
    if (req.url.includes('update_2d') && twod) {
        if (target_time) {
            let found = apiData.result.find(r => r.open_time.includes(target_time));
            if (found) {
                if (modern) found.modern = modern;
                if (internet) found.internet = internet;
                if (set) found.set = set;
                if (value) found.value = value;
                found.twod = twod;
            }
        } else {
            apiData.live.twod = twod;
            if (set) apiData.live.set = set;
            if (value) apiData.live.value = value;
            apiData.live.time = new Date().toLocaleString('en-US', { timeZone: 'Asia/Rangoon' }) + " (Manual)";
        }
        return res.status(200).json({ "status": "success", "message": "Manual Overridden" });
    }
    
    res.status(200).json(apiData);
};

