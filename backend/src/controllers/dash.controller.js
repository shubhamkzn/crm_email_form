import fs from 'fs';
import path from 'path';

// Define the path to the mock data file
const __dirname = path.resolve();
const leadsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/data/mockLeads.json'), 'utf-8'));

export async function getLeads(req, res) {
  const { fromDate, toDate, campaign, platform, sort, limit = 10, offset = 0 } = req.query;

  try {
    let filtered = [...leadsData]; // Start with the mock data

    // Apply filters
    if (fromDate) filtered = filtered.filter((lead) => lead.date >= fromDate);
    if (toDate) filtered = filtered.filter((lead) => lead.date <= toDate);
    if (campaign) filtered = filtered.filter((lead) => lead.campaign === campaign);
    if (platform) filtered = filtered.filter((lead) => lead.platform === platform);

    // Sort if needed
    if (sort === 'asc') filtered.sort((a, b) => a.leads - b.leads);
    if (sort === 'desc') filtered.sort((a, b) => b.leads - a.leads);

    // Pagination
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginated = filtered.slice(start, end);

    res.json({
      total: filtered.length,
      leads: paginated,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getChartData(req, res) {
  try {
    const byPlatform = {};
    const byCampaign = {};

    leadsData.forEach((lead) => {
      byPlatform[lead.platform] = (byPlatform[lead.platform] || 0) + lead.leads;
      byCampaign[lead.campaign] = (byCampaign[lead.campaign] || 0) + lead.leads;
    });

    res.json({ byPlatform, byCampaign });
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
