import express from "express";
import {
  sendEmailController,
  getBrandDataController,
  getAllBrandsController,
  getUniqueID,
  saveTemplate,
  getAllTemplate,
  routeDeleteTemplate,
  copyTemplate,
  addBrandController ,
} from "../controllers/emailController.js";

const router = express.Router();

// POST /send-email
router.post("/send-email", sendEmailController);

// GET /getdata/:brand
router.get("/getdata/:brand", getBrandDataController);

// GET /brands (fetch all brands)
router.get("/brands", getAllBrandsController);
router.post("/brands", addBrandController);


router.get("/uniqueid",getUniqueID);

router.post("/savetemplate",saveTemplate)

router.get("/getalltemplates",getAllTemplate);
router.delete("/deleteTemplate", routeDeleteTemplate);
router.post("/copyTemplate", copyTemplate);

export default router;
