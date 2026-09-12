const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// မူလ API Data Structure
let apiData = {
  "live": {
    "set": "1,626.27",
    "value": "85,650.24",
    "time": "2026-09-12 16:12:40",
    "twod": "70"
  },
  "result": [
    {
      "set": "1,623.03",
      "value": "42,311.39",
      "open_time": "9:30:00",
      "twod": "31"
    },
    {
      "set": "1,621.55",
      "value": "53,762.32",
      "open_time": "12:01:00",
      "twod": "52"
    },
    {
      "set": "1,622.37",
      "value": "67,016.57",
      "open_time": "14:00:00",
      "twod": "76"
    },
    {
      "set": "1,626.27",
      "value": "85,650.24",
      "open_time": "16:30:00",
      "twod": "70"
    }
  ]
};

// Root (/) ဝင်လိုက်တာနဲ့ Card / Table ပုံစံ Web Page ပေါ်လာစေရန်
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="my">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thai 2D Results</title>
            <style>
                body {
                    background-color: #121214;
                    color: #fff;
                    font-family: sans-serif;
                    padding: 15px;
                }
                .card {
                    background-color: #1e1e24;
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 15px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                }
                h3 {
                    margin-top: 0;
                    color: #ffbc00;
                }
                .time-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #2a2a35;
                    padding-bottom: 12px;
                    margin-bottom: 12px;
                }
                .time-row:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                .time {
                    font-size: 16px;
                    font-weight: bold;
                }
                .details {
                    font-size: 13px;
                    color: #a0a0b0;
                    margin-top: 4px;
                }
                .twod-number {
                    font-size: 24px;
                    font-weight: bold;
                    color: #ffbc00;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h3>2D ရလဒ်များ</h3>
                <div id="result-container">ဒေတာများကို ဆွဲယူနေပါပြီ...</div>
            </div>

            <script>
                fetch('/2d_result')
                    .then(response => response.json())
                    .then(data => {
                        const container = document.getElementById('result-container');
                        container.innerHTML = '';
                        let results = Array.isArray(data) ? data[0].child : data.result;

                        results.forEach(item => {
                            const row = document.createElement('div');
                            row.className = 'time-row';
                            row.innerHTML = \`
                                <div>
                                    <div class="time">\${item.open_time}</div>
                                    <div class="details">ထိပ်စီး: \${item.set} &nbsp; နောက်ပိတ်: \${item.value}</div>
                                </div>
                                <div class="twod-number">\${item.twod}</div>
                            \`;
                            container.appendChild(row);
                        });
                    })
                    .catch(error => {
                        document.getElementById('result-container').innerHTML = 'ဒေတာ ဆွဲယူ၍မရပါ။';
                    });
            </script>
        </body>
        </html>
    `);
});

// 1. Daily Live API
app.get('/live', (req, res) => {
    res.json(apiData);
});

// 2. 2D Result API
app.get('/2d_result', (req, res) => {
    const { date } = req.query;
    if (date) {
        res.json({
            "date": date,
            "child": apiData.result
        });
    } else {
        res.json([
            {
                "date": "2026-09-12",
                "child": apiData.result
            }
        ]);
    }
});

// 3. 2D Result History API
app.get('/2d_history', (req, res) => {
    const { twod, date } = req.query;
    res.json([
        {
            "date": date || "2026-09-12",
            "child": [
                {
                    "time": "11:00:00",
                    "set": "1,633.79",
                    "value": "45,017.89",
                    "twod": twod || "97",
                    "is_result": "on"
                }
            ]
        }
    ]);
});

// 4. History API
app.get('/history', (req, res) => {
    const { date } = req.query;
    res.json([
        {
            "date": date || "2026-09-12",
            "child": apiData.result
        }
    ]);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

