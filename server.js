const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const statsFile = "stats.json";
const configFile = "config.json";

// Получить текущую конфигурацию
app.get("/bot-config", (req, res) => {
  if (fs.existsSync(configFile)) {
    const config = JSON.parse(fs.readFileSync(configFile));
    res.json(config);
  } else {
    res.status(404).json({ error: "No config found" });
  }
});

// Обновить конфигурацию
app.post("/update-config", (req, res) => {
  const data = req.body;
  fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
  res.json({ status: "ok" });
});

// Получить статистику
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

// Главная страница — панель управления
app.get("/", (req, res) => {
  const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile)) : {};
  res.send(`
    <html>
    <head>
      <title>VLADOS KRUTIT – Панель управления</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    </head>
    <body class="bg-dark text-light p-4">
      <div class="container">
        <h1 class="mb-4 text-warning">VLADOS KRUTIT – Управление ботом</h1>
        <form method="POST" action="/update-config" class="bg-secondary p-4 rounded" onsubmit="return submitForm(event)">
          <div class="mb-3">
            <label class="form-label">Ссылка:</label>
            <input type="text" name="url" id="url" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Время работы (мин):</label>
            <input type="number" name="workMins" id="workMins" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Задержка между перезагрузками (сек):</label>
            <input type="number" name="reloadDelay" id="reloadDelay" class="form-control" required />
          </div>
          <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" id="active" name="active">
            <label class="form-check-label" for="active">Активность</label>
          </div>
          <button type="submit" class="btn btn-warning">💾 Сохранить</button>
        </form>
        <div class="mt-4"><a class="btn btn-outline-light" href="/stats">📊 Смотреть статистику</a></div>
      </div>
      <script>
        async function loadConfig() {
          const res = await fetch('/bot-config');
          const cfg = await res.json();
          document.getElementById('url').value = cfg.url || "";
          document.getElementById('workMins').value = cfg.workMins || 60;
          document.getElementById('reloadDelay').value = cfg.reloadDelay || 10;
          document.getElementById('active').checked = cfg.active === true;
        }
        async function submitForm(event) {
          event.preventDefault();
          const body = {
            url: document.getElementById('url').value,
            workMins: parseInt(document.getElementById('workMins').value),
            reloadDelay: parseInt(document.getElementById('reloadDelay').value),
            active: document.getElementById('active').checked
          };
          await fetch('/update-config', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          alert("Сохранено!");
        }
        loadConfig();
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => console.log("Server running on port", PORT));
