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




export default route;
// Backend API endpoint (e.g., routes/forms.js or similar)
