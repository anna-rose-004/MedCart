const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

// 🔹 MySQL Database Connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root", // Change this if your MySQL username is different
    password: "", // Add your MySQL password if you have one
    database: "crashcart_db", // Replace with your actual database name
});

// 🔹 Array of Users to Insert
const users = [
    { name: "Anna Thomas", email: "annarosethomas121@gmail.com", password: "admin@123", role: "Admin" },
    { name: "Archana P.S", email: "archanaps0000@gmail.com", password: "archana@2003", role: "Pharmacist" },
    { name: "Milka Joseph", email: "milkajoseph@gmail.com", password: "milka@2004", role: "Nurse" },
    { name: "Siya Joe", email: "siyajoe@gmail.com", password: "siya@1206", role: "Nurse"},
    { name: "Maria John", email: "mariajohn@gmail.com", password: "maria@2308", role: "Nurse" },
    { name: "Anna Mathew", email: "annarosethomas12@gmail.com", password: "anna@123", role: "Nurse" }
];


// 🔹 Hash Passwords and Insert Users
(async () => {
    try {
        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
            const values = [user.name, user.email, hashedPassword, user.role];

            connection.query(sql, values, (err, results) => {
                if (err) {
                    console.error("Error inserting user:", err);
                } else {
                    console.log(`User ${user.name} inserted successfully`);
                }
            });
        }
    } catch (error) {
        console.error("Error hashing passwords:", error);
    } finally {
        setTimeout(() => connection.end(), 2000); // Delay closing connection to allow inserts
    }
})();
