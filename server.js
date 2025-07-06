const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const statsFile = "stats.json";

// GET настройки
app.get("/bot-config", (req, res) => {
  res.json({
    url: "https://ok.ru/profile/586754200320/statuses/164700715288576",
    reloadDelay: 10,
    workMins: 60,
    active: true
  });
});

// POST статистика
app.post("/report-stats", (req, res) => {
  const data = req.body;
  const id = data.deviceId || "unknown";

  let stats = {};
  if (fs.existsSync(statsFile)) {
    stats = JSON.parse(fs.readFileSync(statsFile));
  }

  stats[id] = {
    ...data,
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
  res.json({ status: "ok" });
});

// Панель статистики
app.get("/stats", (req, res) => {
  if (!fs.existsSync(statsFile)) return res.send("No stats yet");
  const data = JSON.parse(fs.readFileSync(statsFile));
  let html = "<h1>Статистика клиентов</h1><table border=1 cellpadding=5><tr><th>ID</th><th>Циклы</th><th>Релоады</th><th>Рекламы</th><th>Последнее обновление</th></tr>";
  for (const [id, s] of Object.entries(data)) {
    html += `<tr><td>${id}</td><td>${s.cycles}</td><td>${s.reloads}</td><td>${s.adsWatched}</td><td>${s.lastUpdated}</td></tr>`;
  }
  html += "</table>";
  res.send(html);
});

app.listen(PORT, () => console.log("Server running on port", PORT));