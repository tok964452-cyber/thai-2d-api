const express = require('express');
const app = express();
app.use(express.json()); // JSON data လက်ခံနိုင်ရန်
const PORT = process.env.PORT || 3000;

// နမူနာ ကိုယ်ပိုင် ဒေတာဘေ့စ် (မန်မိုရီထဲတွင် ယာယီသိမ်းဆည်းထားမည်)
let my2DDatabase = {
    set: "1420.55",
    value: "52400.62",
    twod: "52",
    status: "live", // live သို့မဟုတ် closed စသည်ဖြင့် ပြောင်းနိုင်သည်
    last_updated: new Date().toLocaleTimeString()
};

// ၁။ Sketchware ကနေ ဂဏန်းတွေ လှမ်းဖတ်မယ့် လမ်းကြောင်း (GET Method)
app.get('/api/2d', (req, res) => {
    res.json({
        success: true,
        source: "My Personal Custom API",
        data: my2DDatabase
    });
});

// ၂။ မိမိစိတ်ကြိုက် ဂဏန်းအသစ်တွေကို ဖုန်းကနေ လှမ်းပြင်မယ့် လမ်းကြောင်း (POST Method)
// (ဤနေရာတွင် ဒေတာပြင်ဆင်ရန် Postman app သို့မဟုတ် နောက်ထပ် Sketchware Admin App တစ်ခု သုံးနိုင်သည်)
app.post('/api/2d/update', (req, res) => {
    const { set, value, twod, status } = req.body;

    if (set) my2DDatabase.set = set;
    if (value) my2DDatabase.value = value;
    if (twod) my2DDatabase.twod = twod;
    if (status) my2DDatabase.status = status;
    
    my2DDatabase.last_updated = new Date().toLocaleTimeString();

    res.json({
        success: true,
        message: "ဒေတာများကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။",
        updated_data: my2DDatabase
    });
});

app.listen(PORT, () => console.log(`Custom Live API running on port ${PORT}`));

