import axios from "axios";
import { Formio } from "formiojs";
import {
    Box, Button, Card, CardContent, Grid, TextField, Typography, MenuItem,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../config";

// const countries = ["USA", "Australia"];
// const brands = ['A', 'B', 'C'];


const FormBuild = ({ isEdit }) => {
    const [formName, setFormName] = useState('');
    const [brands, setBrands] = useState([]);
    const [regions, setRegions] = useState([])
    const [country, setCountry] = useState({});
    const [websites, setWebsites] = useState([]);
    const [website, setWebsite] = useState("");
    const [brand, setBrand] = useState('');
    const [schema, setSchema] = useState({ components: [] });
    const { id } = useParams();
    const [formFetched, setFormFetched] = useState(false);
    const [dialogueOpen, setDialogueOpen] = useState(false);
    const [initialSchema, setInitialSchema] = useState({ components: [] });

    const navigate = useNavigate();
    const builderRef = useRef()

    const fetchBrands = async ({ regionId }) => {
        try {
            const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/email/brands/${regionId}`);
            setBrands(res.data);
        } catch (err) {
            console.error("Error fetching brands:", err);
        }
    };

    const fetchWebsites = async ({ brandId }) => {
        try {
            const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/websites/${brandId}`)
            setWebsites(res.data);
        }
        catch (e) {
            console.log('Error fetching websites', e);
        }
    }
    useEffect(() => {
        const fetchRegion = async () => {
            try {
                const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/region`);
                setRegions(res.data)
            }
            catch (e) {
                console.log(e)
            }
        }
        fetchRegion();
    }, []);


    async function saveForm(payload) {
        try {
            await axios.post(config.apiUrl + '/form/create', payload);
            navigate('/forms/list');
        }
        catch (e) {
            console.log(e);
        }
    }

    async function editFrom(payload) {
        try {
            await axios.put(config.apiUrl + '/form/edit', payload);
            navigate('/forms/list')
        }
        catch (e) {
            console.log(e);
        }
    }

    function validation(e) {
        e.preventDefault();

        if (!formName || !country || !brand) {
            alert("Please fill all the fields");
            return;
        }
        setDialogueOpen(true);
    }

    function handleDialogueClose() {
        setDialogueOpen(false);
    };

    function handleDialogueConfirm() {
        setDialogueOpen(false);
        handleSave();
    };

    const genrateFormId = async () => {
        try{
            const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/email/uniqueIdForm`);
            console.log(res);
            return res.data.id;
        }
        catch(e)
        {
            console.log('error generating form id',e);
        }
    }

    async function handleSave() {

        if (isEdit) {
            editFrom({ formId:id, schema, page_name:formName })
        }
        else { 
            const formId = await genrateFormId();
            saveForm({
            formId,pageName:formName, schema, regionId:country.id, brandId:brand.id,websiteId :website.id
            // name: formName, schema: schema, country, brand,
         }); 
        }

    }

    const fetchForm = useCallback(async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/form/${id}`);
            console.log(res);
            setFormName(res?.data?.page_name);
            setCountry({countryName: res?.data?.countryName});
            console.log({name: res?.data?.brand_name})
            setBrand({name: res?.data?.brand_name});
            setSchema(res?.data?.form_schema);
            setInitialSchema(res?.data?.form_schema)
            setFormFetched((prev) => !prev)

        } catch (err) {
            console.log("Failed to load form");
        }
    }, [id]);


    useEffect(() => {
        if (builderRef.current) {
            Formio.builder(builderRef.current, initialSchema).then((builder) => {

                const updateSchema = () => {
                    setSchema({ ...builder.schema });
                    console.log("Updated schema:", builder.schema);
                };

                builder.on("change", updateSchema);
            });
        }
    }, [formFetched, builderRef, initialSchema]);

    useEffect(() => {
        if (isEdit) {
            fetchForm()
        }
    }, [isEdit, fetchForm])
    return (
        <Box className='d-flex flex-col gap-10 items-center justify-center p-8' component="form" onSubmit={validation} >

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Form Name"
                        value={formName || ''}
                        onChange={(e) => setFormName(e.target.value)}
                        sx={{
                            width: { xs: "100%", sm: 220 },
                            minWidth: 160,
                            backgroundColor: "white"
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        select
                        fullWidth
                        disabled={isEdit}
                        label="Country"
                        value={country?.countryName || ""}
                        onChange={(e) => {
                            const region = regions?.filter((val) => val.countryName == e.target.value);
                            setCountry(region[0]);
                            fetchBrands({ regionId: region[0].id });
                        }}
                        sx={{
                            width: { xs: "100%", sm: 220 },
                            minWidth: 160,
                            backgroundColor: "white"
                        }}

                    >
                        {regions?.map((c) => (
                            <MenuItem key={'region' + c.id} value={c.countryName}>
                                {c.countryName}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        select
                        fullWidth
                        disabled={country === "" || isEdit}
                        label="Brand"
                        value={brand?.name || ""}
                        onChange={(e) => {
                            const brand = brands?.filter((val) => val.name == e.target.value);
                            setBrand(brand[0]);
                            fetchWebsites({ brandId: brand[0].id });
                        }}
                        // size="small"
                        sx={{
                            width: { xs: "100%", sm: 220 },
                            minWidth: 160,
                            backgroundColor: 'white'
                        }}

                    >
                        {brands?.map((b) => (
                            <MenuItem key={'brans' + b.id} value={b.name}>
                                {b.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="Website"
                        disabled={brand === "" || isEdit}
                        value={website?.name || ''}
                        onChange={(e) => {
                            const website = websites.filter((val) => (val.name===e.target.value))
                            setWebsite(website[0]);

                        }}
                        sx={{
                            width: { xs: "100%", sm: 220 },
                            minWidth: 160,
                            backgroundColor: "white"
                        }}

                    >
                        {websites?.map((c) => (
                            <MenuItem key={'region' + c.id} value={c.name}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            <Card >
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Form Builder
                    </Typography>
                    {isEdit ? <>{formFetched ? <div ref={builderRef} className="w-[70vw]"></div> : <div></div>}</> : <div ref={builderRef} className="w-[70vw]"></div>}

                </CardContent>
            </Card>
            <Box display="flex" gap={2}>
                <Button variant="contained" color="primary" type="submit">
                    {isEdit ? 'Update Form' : 'Save Form'}
                </Button>

            </Box>

            <Dialog open={dialogueOpen} onClose={handleDialogueClose}>
                <DialogTitle>
                    {isEdit ? "Confirm Update" : "Confirm Save"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {isEdit
                            ? "Are you sure you want to update this form?"
                            : "Are you sure you want to save this form?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogueClose} color="black">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogueConfirm} color="primary" variant="contained">
                        {isEdit ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    )
}

export default FormBuild;