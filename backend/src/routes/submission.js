import express from "express";
import Submission from "../models/Submit.js"; // note the `.js` extension for ESM

const submissionRoute = express.Router();

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

export default submissionRoute;
