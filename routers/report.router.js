const report = require("../controllers/report.controller.js");
const express = require('express');
const router = express.Router();

router.get("/:job_id",report.createPdf);

module.exports = router;