import { getWebsiteByBrandModel } from "../models/websiteModel.js";

export const getWebsiteByBrandController = async (req, res) => {
    try {
        const brandId = req.params.brandId;
        console.log('brandId',brandId);
        const brands = await getWebsiteByBrandModel({ brandId });
        res.send(brands);
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ message: e.message });
    }
}