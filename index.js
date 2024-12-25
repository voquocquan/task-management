const express = require("express");

const database = require("./config/database");
require("dotenv").config();

const routeApiVer1 = require("./api/v1/routes/index.route")
database.connect();

const app = express();
const port = process.env.PORT;

// api routes v1
routeApiVer1(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  
})