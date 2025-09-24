import express from "express";
import Form from "../models/Form.js"; // note the `.js` extension for ESM

const route = express.Router();

route.post("/create", async (req, res) => {
  try {
    const { formId,pageName, schema, regionId, brandId,websiteId } = req.body;
    await Form.create({ formId,pageName, schema, regionId, brandId,websiteId });
    res.send({ message: "completed" });
  } catch (e) {
    res.status(500);
    console.log(e);
  }
});

route.get("/all", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const data = await Form.findAll({ page: parseInt(page), limit: parseInt(limit) });
    res.json(data);
  } catch (e) {
    console.error("Error in /all:", e);
    res.status(500).json({ error: "Server error" });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const formId = req.params.id;
    const form = await Form.findById(formId);
    res.send(form);
  } catch (e) {
    res.status(500);
    console.log(e);
  }
});

route.put("/edit", async (req, res) => {
  try {
    const { formId, schema, page_name } = req.body;
    const result = await Form.editById({ formId, schema, page_name });
    if (result.affectedRows > 0 && result.changedRows > 0) {
      res.send({ message: "updated successfully" });
    } else {
      res.status(400);
    }
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

route.delete("/:id", async (req, res) => {
  try {
    const formId = req.params.id;
    const isDeleted = await Form.deleteById({ formId });
    if (isDeleted) {
      res.send({ message: "Deleted successfully" });
    } else {
      res.status(400).send({ message: "Unable to delete" });
    }
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

// POST /createBrand
route.post("/createBrand", async (req, res) => {
  try {
    const { name, countryId } = req.body;
    console.log("Incoming brand data:", name, countryId);

    if (!name || !countryId) {
      return res.status(400).json({
        success: false,
        message: "Name and countryId are required",
      });
    }

    // Call your createBrand function
    const brand = await Form.createBrand({ name, countryId });

    res.status(201).json({
      success: true,
      brand,
      message: "Brand created successfully",
    });
  } catch (err) {
    console.error("Error creating brand:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error: err.message,
    });
  }
});


route.post("/createWebsite", async (req, res) => {
  try {
    const { name, brandId, countryId } = req.body;

    // Validate input
    if (!name || !brandId || !countryId) {
      return res.status(400).json({
        success: false,
        message: "Name, brandId, and countryId are required",
      });
    }

    // Create the website (this will also create the log table)
    const website = await Form.createWebsite({ name, brandId, countryId });

    res.status(201).json({
      success: true,
      website,
      message: "Website created successfully",
    });
  } catch (err) {
    console.error("Error creating website:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create website",
      error: err.message,
    });
  }
});


export default route;
// Backend API endpoint (e.g., routes/forms.js or similar)
