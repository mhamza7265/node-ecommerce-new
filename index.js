const express = require("express");
const cors = require("cors");
const connectToDB = require("./config/connectToDB");
const routes = require("./routes/api");
connectToDB();
/*************************************************************************************************************/

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("files"));
app.use(require("./routes/api"));

app.listen("3000", () => console.log("Server started on port 3000"));
