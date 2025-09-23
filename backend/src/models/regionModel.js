import { getConnection } from "../lib/db.js"

export const getAllRegions = async () => {
    try{
        const conn = getConnection();
        const [result] = await conn.execute('SELECT * FROM region');
        return result;
    }
    catch(e){
        console.log(e);
    }
}