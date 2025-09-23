import express from "express"; 
import { getAllRegionController } from "../controllers/region.controller.js";

const router = express.Router()

router.get('/',getAllRegionController);

export default router;


