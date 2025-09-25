import express from "express";
import Submission from "../models/Submit.js"; // note the `.js` extension for ESM

const submissionRoute = express.Router();

// Save submission
submissionRoute.post("/", async (req, res) => {
  const { formId, data } = req.body;
  try {
    await Submission.submitById({ formId, data });
    res.send({ message: "submission complete" });
  } catch (e) {
    res.status(500);
    console.log("catching error", e);
  }
});

// Get all submissions for a form
submissionRoute.get("/all/:id", async (req, res) => {
  const id = req.params.id;
  console.log("request received");
  try {
    const rows = await Submission.getAllSubmissions({ formId: id });
    res.send(rows);
  } catch (e) {
    res.status(500);
    console.log("error", e);
  }
});

// Get all leads
submissionRoute.get("/getleads", async (req, res) => {
  try {
    const filters = {
      country: req.query.country || '',
      brand: req.query.brand || '',
      website: req.query.website || ''
    };
    
    const leads = await Submission.getLeads(filters);
    res.send(leads);
  } catch (e) {
    res.status(500).json({ error: "Error fetching leads" });
    console.log("error fetching leads", e);
  }
});

export default submissionRoute;
