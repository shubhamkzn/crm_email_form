import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Card, CardContent, Divider } from "@mui/material";
import axios from "axios";
import config from "../config";
import { Formio } from "formiojs";


const DisplayForm = () => {
    const { id } = useParams(); 
    const [formSchema, setFormSchema] = useState(null);
    const rendererRef = useRef(null);


    const fetchForm = useCallback(async () => {
        try {
            const res = await axios.get(`${config.apiUrl}/form/${id}`);
            setFormSchema({
                name: res?.data?.name, country: res?.data?.country,
                brand: res?.data?.brand, schema: res?.data?.form_schema
            });
        } catch (err) {
            console.log("Failed to load form");
        }
    },[id]);

    const submitForm = async ({ payload }) => {
        try {
            await axios.post(config.apiUrl + '/submission', payload);

        }
        catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        fetchForm();
    }, [fetchForm]);

    useEffect(() => {
        if (rendererRef.current) {
            Formio.createForm(rendererRef.current, formSchema.schema).then((form) => {
                form.on("submit", async (submission) => {
                    console.log("Form submission:", submission.data);
                    await submitForm({ payload: { formId: id, data: submission.data } });
                    form.emit("submitDone", submission); 

                });
            });
        }
    }, [formSchema,id]);

    return (
        <>{
            formSchema?.schema ? (
                <Card sx={{  borderRadius: 2,  }} >
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {formSchema?.name}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box ref={rendererRef} />
                    </CardContent>
                </Card >
            ) : <></>}</>
    )

}

export default DisplayForm;