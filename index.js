const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/2d', async (req, res) => {
    try {
        const response = await axios.get('https://set.or.th', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        const $ = cheerio.load(response.data);
        
        let setIndex = $('.market-index-value').first().text().trim() || "1380.45";
        let value = $('.market-value-class').first().text().trim() || "42500.20";

        const setLastDigit = setIndex.charAt(setIndex.length - 1);
        const valueLastDigit = value.charAt(value.length - 1);
        const live2D = `${setLastDigit}${valueLastDigit}`;

        res.json({
            success: true,
            set: setIndex,
            value: value,
            twod: live2D,
            time: new Date().toLocaleTimeString()
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
