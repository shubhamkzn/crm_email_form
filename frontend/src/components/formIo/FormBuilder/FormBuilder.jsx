import axios from "axios";
import { Formio } from "formiojs";
import {
    Box, Button, Card, CardContent, Grid, TextField, Typography, MenuItem,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    IconButton
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../config";

const FormBuild = ({ isEdit }) => {
    const [formName, setFormName] = useState('');
    const [brands, setBrands] = useState([]);
    const [regions, setRegions] = useState([]);
    
    // State management for selected values
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedWebsite, setSelectedWebsite] = useState(null);
    
    const [websites, setWebsites] = useState([]);
    const [schema, setSchema] = useState({ components: [] });
    const { id } = useParams();
    const [formFetched, setFormFetched] = useState(false);
    const [dialogueOpen, setDialogueOpen] = useState(false);
    const [initialSchema, setInitialSchema] = useState({ components: [] });

    // Modal states
    const [brandModalOpen, setBrandModalOpen] = useState(false);
    const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [newWebsiteName, setNewWebsiteName] = useState('');

    const navigate = useNavigate();
    const builderRef = useRef();

    const fetchBrands = async (regionId) => {
        try {
            const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/email/brands/${regionId}`);
            setBrands(res.data);
        } catch (err) {
            console.error("Error fetching brands:", err);
            setBrands([]);
        }
    };

    const fetchWebsites = async (brandId) => {
        try {
            const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/websites/${brandId}`);
            setWebsites(res.data);
        } catch (e) {
            console.log('Error fetching websites', e);
            setWebsites([]);
        }
    };

    // Create new brand
    const createBrand = async () => {
        try {
            if (!newBrandName.trim()) {
                alert("Please enter a brand name");
                return;
            }
            
            if (!selectedCountry?.id) {
                alert("Please select a country first");
                return;
            }
            
            const payload = {
                name: newBrandName.trim(),
                countryId: selectedCountry.id,
            };
            console.log(payload);
            
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/form/createBrand`, payload);
            
            // Refresh brands list
            await fetchBrands(selectedCountry.id);
            
            // Set the newly created brand as selected
            setSelectedBrand({
                id: res.data.brand.id,
                name: res.data.brand.name,
                country_id: selectedCountry.id
            });
            
            // Reset website selection since brand changed
            setSelectedWebsite(null);
            setWebsites([]);
            
            // Reset and close modal
            setNewBrandName('');
            setBrandModalOpen(false);
            
            alert("Brand created successfully!");
        } catch (error) {
            console.error("Error creating brand:", error);
            alert("Failed to create brand. Please try again.");
        }
    };

    // Create new website
    const createWebsite = async () => {
        try {
            if (!newWebsiteName.trim()) {
                alert("Please enter both website ");
                return;
            }
            
            if (!selectedBrand?.id) {
                alert("Please select a brand first");
                return;
            }
            
            if (!selectedCountry?.id) {
                alert("Please select a country first");
                return;
            }
            
            const payload = {
                name: newWebsiteName.trim(),
                brandId: selectedBrand.id,
                countryId: selectedCountry.id,
            };
            console.log(payload);
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/form/createWebsite`, payload);
            
            // Refresh websites list
            await fetchWebsites(selectedBrand.id);
            
            // Set the newly created website as selected
            setSelectedWebsite({
                id: res.data.website.id,
                name: res.data.website.name,
                brand_id: selectedBrand.id,
                country_id: selectedCountry.id
            });
            
            // Reset and close modal
            setNewWebsiteName('');
            setWebsiteModalOpen(false);
            
            alert("Website created successfully!");
        } catch (error) {
            console.error("Error creating website:", error);
            alert("Failed to create website. Please try again.");
        }
    };

    // Fetch regions/countries on component mount
    useEffect(() => {
        const fetchRegion = async () => {
            try {
                const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/region`);
                setRegions(res.data);
            } catch (e) {
                console.log(e);
            }
        };
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

    async function editForm(payload) {
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

        if (!formName || !selectedCountry || !selectedBrand) {
            alert("Please fill all required fields (Form Name, Country, Brand)");
            return;
        }
        setDialogueOpen(true);
    }

    function handleDialogueClose() {
        setDialogueOpen(false);
    }

    function handleDialogueConfirm() {
        setDialogueOpen(false);
        handleSave();
    }

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
            editForm({ formId:id, schema, page_name:formName })
        }
        else { 
            const formId = await genrateFormId();
            saveForm({
            formId,pageName:formName, schema, regionId:selectedCountry.id, brandId:selectedBrand.id,websiteId :selectedWebsite.id
            // name: formName, schema: schema, country, brand,
         }); 
        }

    }

    const fetchForm = useCallback(async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/form/${id}`);
            console.log(res);
            setFormName(res?.data?.page_name);
            
            
            // Set the states properly
            const country = {id:res?.data?.region_id,countryName: res?.data?.region_name};
            const brand =  {id:res?.data?.brand_id,name: res?.data?.brand_name};
            const website =  {id:res?.data?.website_id,name: res?.data?.website_name};
            setSelectedCountry(country);
            setSelectedBrand(brand);
            setSelectedWebsite(website);
            setRegions([country]);
            setBrands([brand]);
            setWebsites([website]);
            
            setSchema(res?.data?.form_schema);
            setInitialSchema(res?.data?.form_schema);
            setFormFetched(prev => !prev);

        } catch (err) {
            console.log("Failed to load form",err);
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
            fetchForm();
        }
    }, [isEdit, fetchForm]);

    // Handle country selection
    const handleCountryChange = (countryName) => {
        const region = regions.find(val => val.countryName === countryName);
        if (region) {
            console.log('region',region)
            setSelectedCountry(region);
            fetchBrands(region.id);
            
            // Reset dependent fields
            setSelectedBrand(null);
            setSelectedWebsite(null);
            setBrands([]);
            setWebsites([]);
        }
    };

    // Handle brand selection
    const handleBrandChange = (brandName) => {
        const brand = brands.find(val => val.name === brandName);
        if (brand) {
            setSelectedBrand(brand);
            fetchWebsites(brand.id);
            
            // Reset website selection
            setSelectedWebsite(null);
            setWebsites([]);
        }
    };

    // Handle website selection
    const handleWebsiteChange = (websiteName) => {
        const website = websites.find(val => val.name === websiteName);
        if (website) {
            setSelectedWebsite(website);
        }
    };

    return (
        <Box className='d-flex flex-col gap-10 items-center justify-center p-8' component="form" onSubmit={validation}>
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
                        required
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        select
                        fullWidth
                        disabled={isEdit}
                        label="Country"
                        value={selectedCountry?.countryName || ""}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        sx={{
                            width: { xs: "100%", sm: 220 },
                            minWidth: 160,
                            backgroundColor: "white"
                        }}
                        required
                    >
                        {regions?.map((c) => (
                            <MenuItem key={'region' + c.id} value={c.countryName}>
                                {c.countryName}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    {/* <TextField
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
                    </TextField> */}
                    <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                            select
                            fullWidth
                            disabled={!selectedCountry?.id || isEdit}
                            label="Brand"
                            value={selectedBrand?.name || "fgd"}
                            onChange={(e) => handleBrandChange(e.target.value)}
                            sx={{
                                width: { xs: "100%", sm: 180 },
                                minWidth: 140,
                                backgroundColor: 'white'
                            }}
                            required
                        >
                            {brands?.map((b) => (
                                <MenuItem key={'brand' + b.id} value={b.name}>
                                    {b.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        {!isEdit && <IconButton 
                            color="primary" 
                            disabled={!selectedCountry?.id}
                            onClick={() => setBrandModalOpen(true)}
                            sx={{ 
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <AddIcon />
                        </IconButton>}
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    {/* <TextField
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
                    </TextField> */}
                    <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                            select
                            fullWidth
                            label="Website"
                            disabled={!selectedBrand?.id || isEdit}
                            value={selectedWebsite?.name || ''}
                            onChange={(e) => handleWebsiteChange(e.target.value)}
                            sx={{
                                width: { xs: "100%", sm: 180 },
                                minWidth: 140,
                                backgroundColor: "white"
                            }}
                        >
                            {websites?.map((w) => (
                                <MenuItem key={'website' + w.id} value={w.name}>
                                    {w.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        {!isEdit && <IconButton 
                            color="primary" 
                            disabled={!selectedBrand?.id}
                            onClick={() => setWebsiteModalOpen(true)}
                            sx={{ 
                                backgroundColor: 'white',
                                border: '1px solid #ccc',
                                '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                }
                            }}
                        >
                            <AddIcon />
                        </IconButton>}
                    </Box>
                </Grid>
            </Grid>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Form Builder
                    </Typography>
                    {isEdit ? 
                        <>{formFetched ? <div ref={builderRef} className="w-[70vw]"></div> : <div></div>}</> 
                        : 
                        <div ref={builderRef} className="w-[70vw]"></div>
                    }
                </CardContent>
            </Card>

            <Box display="flex" gap={2}>
                <Button variant="contained" color="primary" type="submit">
                    {isEdit ? 'Update Form' : 'Save Form'}
                </Button>
            </Box>

            {/* Save/Update Confirmation Dialog */}
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
                    <Button onClick={handleDialogueClose} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogueConfirm} color="primary" variant="contained">
                        {isEdit ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Brand Creation Modal */}
            <Dialog open={brandModalOpen} onClose={() => setBrandModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Brand</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Create a new brand for {selectedCountry?.countryName}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Brand Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="Enter brand name"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setBrandModalOpen(false);
                        setNewBrandName('');
                    }} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={createBrand} color="primary" variant="contained">
                        Create Brand
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Website Creation Modal */}
            <Dialog open={websiteModalOpen} onClose={() => setWebsiteModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Website</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Create a new website for {selectedBrand?.name}
                    </DialogContentText>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Website Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newWebsiteName}
                            onChange={(e) => setNewWebsiteName(e.target.value)}
                            placeholder="Enter website name"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setWebsiteModalOpen(false);
                        setNewWebsiteName('');
                    }} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={createWebsite} color="primary" variant="contained">
                        Create Website
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FormBuild;