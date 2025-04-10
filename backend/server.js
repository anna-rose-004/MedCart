const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const http = require("http");
const socketIo = require("socket.io");

dotenv.config();
const app = express();
const server = http.createServer(app); // Create HTTP server
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }
});

app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization", "removed-by"]
}));
app.options("*", cors());


const SECRET_KEY = "your_secret_key"; // Change this in production

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "crashcart_db",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

//Register new user
app.post('/api/users/register', async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    let query, values;

    if (role === 'Nurse') {
      query = 'INSERT INTO users (name, email, password, role, dept) VALUES (?, ?, ?, ?, ?)';
      values = [name, email, hashedPassword, role, department];
    } else {
      query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      values = [name, email, hashedPassword, role];
    }

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'User registered successfully!' });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// LOGIN ROUTE
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const query = `
    SELECT u.user_id, u.email, u.password, u.role, u.dept, c.cart_id 
    FROM users u 
    LEFT JOIN crashcarts c ON u.dept = c.location 
    WHERE u.email = ?`; // Include crashcart_id in the query

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (results.length === 0) {
      console.log("User not found in database");
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = results[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log("Password incorrect");
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    console.log("Login successful!");
    const token = jwt.sign({ id: user.user_id, email: user.email, role: user.role, dept: user.dept, crashcart_id: user.cart_id  }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ success: true, token, role:user.role, dept: user.dept, crashcart_id: user.cart_id});
  });
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const authRoutes = require("./routes/auth")(db);
app.use("/api/auth", authRoutes);

const forgotPasswordRoutes = require("./routes/forgotPassword")(db);
app.use("/api", forgotPasswordRoutes); 

const unitMedicineRoutes = require("./routes/unitMedicine")(db, io);
app.use("/api/unit-medicine", unitMedicineRoutes);

const batchesRouter = require('./routes/batches')(db);
app.use('/api/batches', batchesRouter);

const notificationRoutes = require("./routes/notifications")(db, io); 
app.use("/api/notifications", notificationRoutes);

const eventRoutes = require("./routes/events")(db);
app.use("/api/events", eventRoutes);

const restockRoutes = require('./routes/restock')(db);
app.use('/api/restock', restockRoutes);



server.listen(5000, "0.0.0.0", () => console.log("Server running on all interfaces"));

