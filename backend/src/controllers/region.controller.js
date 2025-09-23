import { getAllRegions } from "../models/regionModel.js"

export const getAllRegionController = async (req,res) => {
    try{
        console.log('region controller')
        const data = await getAllRegions();
        res.send(data);
    }
    catch(e)
    {
        res.status(500);
    }
}