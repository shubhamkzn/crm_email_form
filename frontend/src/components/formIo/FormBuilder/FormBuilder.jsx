import axios from "axios";
import { Formio } from "formiojs";
import {
    Box, Button, Card, CardContent, Grid, TextField, Typography, MenuItem,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../config";

const countries = ["USA", "Australia"];
const brands = ['A', 'B', 'C'];


const FormBuild = ({ isEdit }) => {
    const [formName, setFormName] = useState('');
    const [country, setCountry] = useState('');
    const [brand, setBrand] = useState('');
    const [schema, setSchema] = useState({ components: [] });
    const { id } = useParams(); 
    const [formFetched, setFormFetched] = useState(false);
    const [dialogueOpen, setDialogueOpen] = useState(false);
    const [initialSchema,setInitialSchema] = useState({components: []});

    const navigate = useNavigate();
    const builderRef = useRef()


    async function saveForm(payload) {
        try {
            await axios.post(config.apiUrl + '/form/create', payload);
            navigate('/forms')
        }
        catch (e) {
            console.log(e);
        }
    }

    async function editFrom(payload) {
        try {
            await axios.put(config.apiUrl + '/form/edit', payload);
            navigate('/forms')
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

    function handleSave() {

        if (isEdit) {
            editFrom({ name: formName, schema, country, brand, id })
        }
        else { saveForm({ name: formName, schema: schema, country, brand }); }

    }

    const fetchForm = useCallback(async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/form/${id}`);
            console.log(res);
            setFormName(res?.data?.name);
            setCountry(res?.data?.country);
            setBrand(res?.data?.brand);
            setSchema(res?.data?.form_schema);
            setInitialSchema(res?.data?.form_schema)
            setFormFetched((prev) => !prev)

        } catch (err) {
            console.log("Failed to load form");
        }
    },[id]);


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
    }, [formFetched,builderRef,initialSchema]);

    useEffect(() => {
        if (isEdit) {
            fetchForm()
        }
    }, [isEdit,fetchForm])
    return (
        <Box className='d-flex flex-col gap-10 items-center justify-center p-8' component="form" onSubmit={validation} >

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="Form Name"
                        value={formName}
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
                        label="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        sx={{
                            width: { xs: "100%", sm: 220 }, 
                            minWidth: 160,
                            backgroundColor: "white"
                        }}

                    >
                        {countries.map((c) => (
                            <MenuItem key={c} value={c}>
                                {c}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        select
                        fullWidth
                        disabled={country === ""}
                        label="Brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        // size="small"
                        sx={{
                            width: { xs: "100%", sm: 220 }, 
                            minWidth: 160,
                            backgroundColor: 'white'
                        }}

                    >
                        {brands.map((b) => (
                            <MenuItem key={b} value={b}>
                                {b}
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