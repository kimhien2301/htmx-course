const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")
const bodyParser = require("body-parser")

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({}));

// Set out templating engine
app.set("view engine", "ejs");

// Setup MySQL connection
async function connectToMySQL() {
    return await mysql.createConnection({
        host: "localhost",
        port: 3333,
        user: "root",
        password: "root",
        database: "testdb"
    });
}

let db;

(async () => {
    db = await connectToMySQL();
})();

app.get("/", (req, res) => {
    res.render("templates/home");
})

app.get("/tasks", async (req, res) => {
    await fetchAllTasks(res)
});

app.get("/get-task-form", (req, res) => {
    res.render("templates/addTaskForm");
})

app.post("/task", async (req, res) => {
    const data = req.body
    const task = data.task.trim();

    if (task === "") {
        res.status(400).send("Task content is empty!!!");
        return;
    }

    try {
        const sql = "INSERT INTO tasks (task) VALUES (?)";
        await db.query(sql, [task]);

        res.send(`<li>${task}</li>`);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

app.get("/get-update-form/:id", async (req, res) => {
    const id = req.params.id;
    const task = await fetchTask(id);
    res.render("templates/updateTaskForm", {
        task
    });
})

app.put("/task/:id", async (req, res) => {
    const id = req.params.id;

    const data = req.body;
    const task = data.task.trim();

    let done;
    switch (data.done) {
        case "on" :
            done = 1;
            break;
        case "off":
            done = 0;
            break;
        default:
            done = 0;
            break;
    }

    if (task === "") {
        res.status(400).send("Task content is empty!!!");
        return;
    }

    try {
        const sql = "UPDATE tasks SET task = ?, done = ? WHERE id = ?";
        await db.query(sql, [task, done, id]);
        await fetchAllTasks(res);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

app.delete("/task/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const sql = "DELETE FROM tasks WHERE id = ?";
        await db.query(sql, [id]);
        await fetchAllTasks(res);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

async function fetchAllTasks(res) {
    try {
        const [results, fields] = await db.query("SELECT * FROM tasks");
        res.render("templates/taskList", {
            tasks: results
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}

async function fetchTask(id) {
    const sql = "select * from tasks where id = ?";
    try {
        const [rows] = await db.query(sql, [id]);

        if (rows.length > 0)
            return rows[0];
        else
            return null;
    } catch (error) {
        console.error(error);
    }
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is now running on port: ${PORT}`)
})