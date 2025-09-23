import express from "express"; 
import { getWebsiteByBrandController } from "../controllers/website.controller.js";

const router = express.Router()

router.get('/:brandId',getWebsiteByBrandController);

export default router;