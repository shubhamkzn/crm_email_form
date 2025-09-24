import { sendMail } from "../lib/sendmail.js";
import {
  ensureWebsiteTableExists,
  logEmail,
  getBrandByNameOrCreate,
  getEmailLogs,
  getAllBrands,
  getBrandByName,
  getBrandLogs,
  saveTemplateData,
  getAllTemplatesData,
  routeDeleteTemplateData,
  copyTemplateData,
  updateTemplateData,
  getOneTemplate,
  addBrand,
  getBrandByRegion,
  getFormIdByTemplateId ,
  getFormDetails ,
  insertEmailMasterLog ,
  getFormDetailsWithNames,
  addTemplateFormMapping,
} from "../models/emailModel.js";
import { nanoid } from "nanoid";

// -------------------- SEND EMAIL --------------------
export const sendEmailController = async (req, res) => {
  try {
    const { templateId, data } = req.body;

    if (!templateId || !data) {
      return res.status(400).json({ error: "templateId and data are required" });
    }

    // Fetch template
    const template = await getOneTemplate(templateId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    const { html, config, name, created } = template;

    // Fetch form_id
    const formId = await getFormIdByTemplateId(templateId);
    if (!formId) return res.status(404).json({ error: "No form linked to this template" });

    // Fetch form details
    const form = await getFormDetailsWithNames(formId);
    if (!form) return res.status(404).json({ error: "Form not found" });

    // Replace placeholders in HTML
    let finalHtml = html;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
      finalHtml = finalHtml.replace(regex, value ?? "");
    }

    // // Parse config
    // const parsedConfig = typeof config === "string" ? JSON.parse(config) : config;

    // // Auto-fill missing 'to' and 'subject'
    // const toEmail = parsedConfig.to || process.env.DEFAULT_TO_EMAIL || "fallback@example.com";
    // const subject = parsedConfig.subject || "New Form Submission";

    // // Optional: auto-fill missing placeholders like currentYear
    // if (!data.currentYear) {
    //   finalHtml = finalHtml.replace(/{{\s*currentYear\s*}}/g, new Date().getFullYear());
    // }

    
    // Parse config
    const parsedConfig = typeof config === "string" ? JSON.parse(config) : config;

    // Auto-fill missing 'to' and 'subject'
let toEmail = parsedConfig.to || process.env.DEFAULT_TO_EMAIL || "fallback@example.com";
// Replace {{email}} in config with data.email if present
if (typeof toEmail === "string" && toEmail.includes("{{email}}")) {
  toEmail = toEmail.replace("{{email}}", data.email || "");
}

const subject = parsedConfig.subject || "New Form Submission";

    // Optional: auto-fill missing placeholders like currentYear
    if (!data.currentYear) {
      finalHtml = finalHtml.replace(/{{\s*currentYear\s*}}/g, new Date().getFullYear());
    }

    // Send email
    await sendMail({
      to: toEmail,
      subject,
      text: "See HTML version",
      html: finalHtml
    });

    // Log email
    await insertEmailMasterLog({
      form_id: formId,
      template_id: templateId,
      form_schema: form.form_schema,
      page_name: form.page_name,
      brand_name: form.brand_name,
      region_name: form.region_name,
      website_name: form.website_name,
      email_content: { toEmail, subject, html: finalHtml },
      status: "sent"
    });

    res.json({
      success: true,
      message: "Email sent and logged successfully",
      templateUsed: { id: templateId, name, created, subject, toEmail },
    });

  } catch (error) {
    console.error("sendEmailController Error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};



// -------------------- GET BRAND DATA (WITH PAGINATION) --------------------
export const getBrandDataController = async (req, res) => {
  const { brand } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const brandInfo = await getBrandByName(brand);
    if (!brandInfo) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const data = await getBrandLogs(brandInfo.log_table, limit, offset);
    res.json({ page, limit, data });
  } catch (error) {
    console.error("getBrandDataController Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// -------------------- ADD BRAND --------------------
export const addBrandController = async (req, res) => {
  try {
    const { name, countryId } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Brand name is required" });
    }

    const newBrand = await addBrand({ name: name.trim(), countryId });
    res.status(201).json(newBrand);
  } catch (error) {
    console.error("addBrandController Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// -------------------- GET ALL BRANDS --------------------
export const getAllBrandsController = async (req, res) => {
  try {
    const brands = await getAllBrands();
    res.json(brands);
  } catch (error) {
    console.error("getAllBrandsController Error:", error);
    res.status(500).json({ error: error.message });
  }
};


// -------------------- LINK FORM ID TO TEMPLATE --------------------
export const addFormIdController = async (req, res) => {
  try {
    const { formId, templateId } = req.body;
 
    if (!formId || !templateId || !String(formId).trim() || !String(templateId).trim()) {
      return res.status(400).json({ message: 'formId and templateId are required' });
    }
 
    try {
      const result = await addTemplateFormMapping(templateId.trim(), formId.trim());
      // success
      return res.status(201).json({
        message: 'Form ID linked to template',
        templateId: templateId.trim(),
        formId: formId.trim(),
        insertId: result?.insertId ?? null
      });
    } catch (err) {
      // Duplicate pair (primary key)
      if (err && err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Form ID already linked to this template' });
      }
      console.error('addFormIdController inner error:', err);
      return res.status(500).json({ message: 'Failed to link Form ID', error: err?.message });
    }
  } catch (error) {
    console.error('addFormIdController error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --------------------get brand by country ----------------------=
export const getBrandsByRegionController = async (req, res) => {
  try {
    const regionId = req.params.regionId;
    const brands = await getBrandByRegion({ regionId });
    res.json(brands);
  }
  catch (error) {
    console.error("getBrandsByCountryController Error:", error);
    res.status(500).json({ error: error.message });
  }

}

// -------------------- GENERATE UNIQUE ID --------------------
export const getUniqueID = async (req, res) => {
  try {
    const uniqueId = "tpl_" + nanoid(8);
    res.json({ id: uniqueId });
  } catch (error) {
    console.error("getUniqueID Error:", error);
    res.status(500).json({ error: "Failed to generate ID" });
  }
};
export const getUniqueIDForm = async (req, res) => {
  try {
    const uniqueId = "form_" + nanoid(8);
    res.json({ id: uniqueId });
  } catch (error) {
    console.error("getUniqueID Error:", error);
    res.status(500).json({ error: "Failed to generate ID" });
  }
};

// -------------------- SAVE / UPDATE TEMPLATE --------------------
export const saveTemplate = async (req, res) => {
  try {
    const { id, name, html, config, created } = req.body;

    if (!id || !name || !html || !config || !created) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      await saveTemplateData(id, name, html, config, created);
      res.status(201).json({
        message: "Template created successfully",
        template: { id, name, html, config, created },
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        await updateTemplateData(id, name, html, config, created);
        return res.status(200).json({
          message: "Template updated successfully",
          template: { id, name, html, config, created },
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("saveTemplate Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- GET ALL TEMPLATES --------------------
export const getAllTemplate = async (req, res) => {
  try {
    const templates = await getAllTemplatesData();
    res.json(templates);
  } catch (error) {
    console.error("getAllTemplate Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// -------------------- DELETE TEMPLATE --------------------
export const routeDeleteTemplate = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Template ID is required" });
  }

  try {
    const result = await routeDeleteTemplateData(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({ message: "Template deleted successfully", result });
  } catch (error) {
    console.error("routeDeleteTemplate Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// -------------------- COPY TEMPLATE --------------------
export const copyTemplate = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Template ID is required" });
  }

  try {
    const newTemplate = await copyTemplateData(id);
    if (!newTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json({
      message: "Template copied successfully",
      template: newTemplate,
    });
  } catch (error) {
    console.error("copyTemplate Error:", error);
    res.status(500).json({ error: error.message });
  }
};


