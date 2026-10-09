const http = require("http");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

// In-memory storage and sequential id counter
let habits = [];
let habitIdCounter = 1;

// --- Helpers: date formatting/parsing (local time) ---
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseYMDToDate(ymd) {
  // expects "YYYY-MM-DD"
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// calculate next_due from a Y-M-D startDate string and frequency (days)
function calculateNextDue(startDateYMD, frequency) {
  const base = parseYMDToDate(startDateYMD);
  base.setDate(base.getDate() + parseInt(frequency, 10));
  return formatDateLocal(base);
}

// --- Static file serving ---
function sendFile(res, filepath) {
  fs.readFile(filepath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }
    const type = mime.lookup(filepath) || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  });
}

// --- API handlers ---
function handleApi(req, res) {
  const url = req.url;
  const apiBase = "/api/habits";

  // Route: /api/habits
  if (url === apiBase) {
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(habits));
      return;
    }

    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { name, frequency } = JSON.parse(body);
          // Use local date (YYYY-MM-DD) for start_date
          const today = new Date();
          const start_date = formatDateLocal(today);
          const next_due = calculateNextDue(start_date, frequency);

          const habit = {
            id: habitIdCounter++,      // <- sequential small id
            name,
            frequency: parseInt(frequency, 10),
            start_date,
            next_due,
          };

          habits.push(habit);

          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(habit));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    // Method not allowed on /api/habits
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  // Route: /api/habits/:id
  if (url.startsWith(apiBase + "/")) {
    const parts = url.split("/");
    const id = parseInt(parts[parts.length - 1], 10);
    if (Number.isNaN(id)) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Invalid ID");
      return;
    }

    if (req.method === "GET") {
      const habit = habits.find((h) => h.id === id);
      if (!habit) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(habit));
      return;
    }

    if (req.method === "PUT") {
      // Update name/frequency and recalc next_due (based on today)
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { name, frequency } = JSON.parse(body);
          const habit = habits.find((h) => h.id === id);
          if (!habit) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("Habit not found");
            return;
          }
          habit.name = name;
          habit.frequency = parseInt(frequency, 10);
          // Recalculate next_due using today's date (so edit resets next due)
          const todayYMD = formatDateLocal(new Date());
          habit.next_due = calculateNextDue(todayYMD, habit.frequency);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(habit));
        } catch (err) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
      return;
    }

    if (req.method === "DELETE") {
      const beforeLen = habits.length;
      habits = habits.filter((h) => h.id !== id);
      if (habits.length === beforeLen) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
        return;
      }
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  // not an API route
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
}

// --- Server main ---
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res);
  } else {
    // serve static files (including subfolders e.g. /js/main.js, /css/main.css)
    const filePath = req.url === "/" ? path.join(publicDir, "index.html") : path.join(publicDir, req.url);
    sendFile(res, filePath);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
