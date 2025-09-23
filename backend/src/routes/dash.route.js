import express from "express"; 
import { getLeads, getChartData } from "../controllers/dash.controller.js";

const router = express.Router();

router.get("/leads", getLeads); 
router.get("/chart", getChartData);

export default router;
