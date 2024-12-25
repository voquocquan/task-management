const express = require("express");

const database = require("./config/database");
require("dotenv").config();

const Task = require("./models/task.model")
database.connect();

const app = express();
const port = process.env.PORT;


app.get("/tasks", async (req, res) => {
  const tasks = await Task.find({
    deleted: false
  })
  console.log(tasks);
  
  res.json(tasks)
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
  
})