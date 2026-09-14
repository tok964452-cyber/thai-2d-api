const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
// index.js ရဲ့ အပေါ်ဆုံးနားတွင် အောက်ပါအတိုင်း ပြင်ပါ
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path'); // ဤတစ်ကြောင်း ထည့်ပါ
const app = express();

// ဤနေရာတွင် __dirname အစား path.join သုံးပြီး HTML များကို လမ်းကြောင်းပေးပါ
app.use(express.static(path.join(__dirname, '/'))); 


app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ညီလေး လိုချင်တဲ့ ကတ်ပြားပုံစံအတိုင်း တိကျတဲ့ Data Structure
let apiData = {
  "live": { 
    "set": "--", 
    "value": "--", 
    "time": "--", 
    "twod": "--" 
  },
  "result": [
    {
      "open_time": "9:30:00",
      "modern": "--",
      "internet": "--"
    },
    {
      "open_time": "12:01:00",
      "set": "--",
      "value": "--",
      "twod": "--"
    },
    {
      "open_time": "14:00:00",
      "modern": "--",
      "internet": "--"
    },
    {
      "open_time": "16:30:00",
      "set": "--",
      "value": "--",
      "twod": "--"
    }
  ]
};

// ဝဘ်ဆိုက်မှ Live ဒေတာဆွဲယူပြီး အချိန်အလိုက် Auto ခွဲခြားမည့် Function
async function scrapeThaiSET() {
    try {
        const response = await axios.get('https://set.or.th', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        
        let currentSet = $('.set-index-value').first().text().trim() || "0.00";
        let currentValue = $('.set-market-value').first().text().trim() || "0.00";
        
        if (currentSet !== "0.00" && currentValue !== "0.00") {
            // ၂D တွက်ချက်ခြင်း (SET ၏ နောက်ဆုံးဂဏန်း + Value ၏ နောက်ဆုံးဂဏန်း)
            let lastDigitSet = currentSet.charAt(currentSet.length - 1);
            let lastDigitValue = currentValue.split('.').slice(-1)[0].charAt(0); // ဒသမမတိုင်မီ နောက်ဆုံးဂဏန်း
            let current2D = lastDigitSet + lastDigitValue;
            
            // Modern နှင့် Internet ဂဏန်းတွက်ချက်ခြင်း (ဥပမာ Logic အနေဖြင့် SET ရေတွက်မှုပေါ်မူတည်၍ ယူခြင်း)
            let rawSetDigits = currentSet.replace(/[^0-9]/g, '');
            let mockModern = rawSetDigits.slice(-2); // SET ရဲ့ နောက်ဆုံး ၂ လုံးကို မော်ဒန်အဖြစ် ယူဆခြင်း
            let mockInternet = (parseInt(current2D) + 3).toString().slice(-2); // အင်တာနက်ဂဏန်းအဖြစ် ဥပမာတွက်ခြင်း
            
            let now = new Date();
            let timeString = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Rangoon' });
            
            // ၁။ Live ဒေတာကို အမြဲတမ်း Update လုပ်ပေးခြင်း
            apiData.live = {
                "set": currentSet,
                "value": currentValue,
                "time": now.toISOString().slice(0, 19).replace('T', ' '),
                "twod": current2D
            };

            // ၂။ အချိန်အလိုက် ကွက်တိ ခွဲသိမ်းခြင်း
            // မနက်ပိုင်း (09:30:00) -> Modern, Internet ပဲ သိမ်းမည်
            if (timeString.startsWith('09:30') || timeString.startsWith('09:31')) {
                apiData.result[0].modern = mockModern;
                apiData.result[0].internet = mockInternet;
            }
            // နေ့လယ်ပိုင်း (12:01:00) -> Set, Value, 2D သိမ်းမည်
            else if (timeString.startsWith('12:01') || timeString.startsWith('12:02')) {
                apiData.result[1].set = currentSet;
                apiData.result[1].value = currentValue;
                apiData.result[1].twod = current2D;
            }
            // မွန်းလွဲပိုင်း (14:00:00) -> Modern, Internet ပဲ သိမ်းမည်
            else if (timeString.startsWith('14:00') || timeString.startsWith('14:01')) {
                apiData.result[2].modern = mockModern;
                apiData.result[2].internet = mockInternet;
            }
            // ညနေပိုင်း (16:30:00) -> Set, Value, 2D သိမ်းမည်
            else if (timeString.startsWith('16:30') || timeString.startsWith('16:31')) {
                apiData.result[3].set = currentSet;
                apiData.result[3].value = currentValue;
                apiData.result[3].twod = current2D;
            }
        }
    } catch (error) {
        console.error("Scraping Error:", error.message);
    }
}

// စက္ကန့် ၃၀ လျှင် တစ်ကြိမ် Auto ဒေတာသွားဆွဲခိုင်းထားမည်
setInterval(scrapeThaiSET, 30000);

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
            return res.json({ "status": "success", "message": `${target_time} ဒေတာကို ပြင်ဆင်ပြီးပါပြီ။` });
        }
    }
    res.status(400).send("Target time မမှန်ကန်ပါ သို့မဟုတ် ဒေတာမပြည့်စုံပါ");
});

// APIs Routes
app.get('/live', (req, res) => res.json(apiData));
app.get('/2d_result', (req, res) => res.json({ "date": new Date().toISOString().slice(0,10), "child": apiData.result }));

// index.js ထဲက app.listen အပေါ်နားမှာ ရှိရမယ့် ကုဒ်များ
app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });
app.get('/history.html', (req, res) => { res.sendFile(__dirname + '/history.html'); });
app.get('/3d.html', (req, res) => { res.sendFile(__dirname + '/3d.html'); });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

