import express from "express";
// const express = require("express");
const router = express.Router();


router.get("/",(req,res) => {
  console.log(req.rawHeaders);
  res.send("<p>Setting up router/p>");
})


export default router;