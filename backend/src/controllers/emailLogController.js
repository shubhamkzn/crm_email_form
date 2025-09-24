import { fetchEmailLogs, fetchDistinctOptions } from "../models/emailMasterLog.js";

export const getEmailLogs = async (req, res) => {
  try {
    const { page, limit, region, brand, website, template, status } = req.query;

    const logs = await fetchEmailLogs({
      page: page || 1,
      limit: limit || 10,
      region,
      brand,
      website,
      template,
      status
    });

    res.json({ data: logs });
  } catch (err) {
    console.error("getEmailLogs Error:", err);
    res.status(500).json({ error: "Failed to fetch email logs" });
  }
};

export const getFilterOptions = async (req, res) => {
  try {
    const regions = await fetchDistinctOptions("region_name");
    const brands = await fetchDistinctOptions("brand_name");
    const websites = await fetchDistinctOptions("website_name");
    const templates = await fetchDistinctOptions("template_id");

    res.json({ regions, brands, websites, templates });
  } catch (err) {
    console.error("getFilterOptions Error:", err);
    res.status(500).json({ error: "Failed to fetch filter options" });
  }
};
