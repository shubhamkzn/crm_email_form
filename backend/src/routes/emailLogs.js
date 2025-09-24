import express from "express";
import { getEmailLogs, getFilterOptions } from "../controllers/emailLogController.js";

const router = express.Router();

// GET /api/email/logs?page=1&limit=10&region=&brand=&website=&template=&status=
router.get("/logs", getEmailLogs);

// GET /api/email/filters
router.get("/filters", getFilterOptions);

export default router;
