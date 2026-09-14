module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        "date": new Date().toISOString().slice(0, 10),
        "child": [
            { "open_time": "9:30:00", "modern": "31", "internet": "34" },
            { "open_time": "12:01:00", "set": "1,621.55", "value": "53,762.32", "twod": "52" },
            { "open_time": "14:00:00", "modern": "76", "internet": "79" },
            { "open_time": "16:30:00", "set": "1,626.27", "value": "85,650.24", "twod": "70" }
        ]
    });
};

