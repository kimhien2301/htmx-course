const express = require("express")
const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const cors = require("cors")
const multer = require("multer")
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

app.use(cors({credentials: true, origin: true}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})


app.get("/", (req, res) => {
    // setTimeout(() => {
        res.send("<h2>Welcome to the Node Hypermedia API</h2>")
    // }, 7000);
})

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

app.post("/message", async (req, res) => {
    // await sleep(1000)
    // res.send(`<div><h3>Hello World</h3></div>`);

    // setTimeout(() => {
    res.set({
        "Last-Modified": "Wednesday, 21 Sept 2023"
    })
    res.send(`<div><h3>Hello World</h3></div>`);
    // }, 3000)
});

app.post("/echopayload", async (req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;

    res.send(`<div><b>Email:</b> ${email}, <b>Password:</b> ${pass}</div>`)
});

app.post("/upload", upload.single("file"), async (req, res) => {
    const filePath = req.file.path;
    console.log(filePath);
    res.send(`<b>Upload Successful</b>: ${filePath}`);
})

app.post("/oob", async (req, res) => {
    res.send(`<div>
                        <h3 id="target2" hx-swap-oob="true">Hello World</h3>
                        This goes into the main target
                    </div>`);
});

app.post("/sr", async (req, res) => {
    res.send(`<div>
                        <h3 id="target2">Hello World</h3>
                        This goes into the main target
                    </div>`);
});

app.get("/bigbox", (req, res) => {
    res.send(`
        <div id="growing-box"
            class="grow"
            style="height: 300px; width: 300px; background-color: aquamarine; text-align: center"
        >
            Big Box
        </div>
    `)
})

app.get("/users", (req, res) => {
    res.json([
        {id: 1, name: "Steph Curry"},
        {id: 2, name: "Lebron James"},
        {id: 3, name: "Kevin Durant"},
        {id: 4, name: "Giannis Antetokounmpo"}
    ])
});

app.post("/htmx", async (req, res) => {

    res.send(`
        <div>
            <h3>
                I am loading HTMX Stuff    
            </h3>
            <button type="button"
                    hx-get="http://localhost:1330"
                    hx-target="#destination">
                Load Root              
            </button>
        </div>
    `)
})

app.post("/script", async (req, res) => {
    res.send(`
        <div>
            <h3>I am loading a script</h3>
            <script>
                console.log("Hey")
            </script>
        </div>
    `);
})


const PORT = process.env.PORT || 1330;

app.listen(PORT, () => {
    console.log(`App is now running on port: ${PORT}`);
})