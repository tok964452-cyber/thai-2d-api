// Global memory အဖြစ် အရန်ဒေတာ သတ်မှတ်ခြင်း
let apiData = {
  "live": { "set": "1,626.27", "value": "85,650.24", "time": "2026-09-14 16:30:00", "twod": "70" },
  "result": [
    { "open_time": "9:30:00", "modern": "31", "internet": "34" },
    { "open_time": "12:01:00", "set": "1,621.55", "value": "53,762.32", "twod": "52" },
    { "open_time": "14:00:00", "modern": "76", "internet": "79" },
    { "open_time": "16:30:00", "set": "1,626.27", "value": "85,650.24", "twod": "70" }
  ]
};

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    // ဂဏန်းလှမ်းပြင်သည့် Admin စနစ်
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
        }
        return res.status(200).json({ "status": "success", "message": "Updated" });
    }
    
    // ပုံမှန်ဆိုလျှင် Live data ထုတ်ပေးမည်
    res.status(200).json(apiData);
};

