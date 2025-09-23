import { getConnection } from "../lib/db.js"

export const getWebsiteByBrandModel = async ({ brandId }) => {
    const conn = getConnection();
    const [rows] = await conn.execute("SELECT * FROM websites WHERE brand_id = ?",
        [brandId]);
    return rows;
}