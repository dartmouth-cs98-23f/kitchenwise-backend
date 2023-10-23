import express from "express";
import indexRouter from "./routes/index.js";
const app = express();
const port = 3000;

app.use("/",indexRouter);

app.get("/",(req,res) => {
  console.log(req.rawHeaders);
  res.send("<p>Hello World</p>");
})

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
