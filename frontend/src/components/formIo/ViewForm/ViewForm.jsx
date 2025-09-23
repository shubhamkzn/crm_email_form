import { useParams } from "react-router-dom";
import config from "../config";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography, Card, CardContent, Divider, Button } from "@mui/material";
import axios from "axios";
import { Formio } from "formiojs";

const ViewForm = () => {
    const { id } = useParams();
    const [formSchema, setFormSchema] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [showSubmission, setShowSubmission] = useState(false)
    const [columns, setColumns] = useState([])
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
    },[id])

    const submitForm = async ({ payload }) => {
        try {
            await axios.post(config.apiUrl + '/submission', payload);

        }
        catch (e) {
            console.log(e);
        }
    }

    const fetchSubmissions = async () => {
        try {
            const response = await axios(config.apiUrl + `/submission/all/${id}`);
            console.log(response)
            setSubmissions(response?.data);
            if (response?.data) {
                setColumns(Object.keys(response?.data[0]))
            }

        }
        catch (e) {
            console.log(e);
        }
    }

    const handleViewSubmission = () => {
        setShowSubmission(true)
        fetchSubmissions();
    }

    const handleHideSubmission = () => {
        setShowSubmission(false);
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
        <Box
            className="flex flex-col items-center bg-[#f5f7fa] min-h-screen"
        >
            <Box className='w-full p-[60px]'>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <div style={{ display: 'flex', gap: 40 }}>
                        <div className='p-[5px] bg-[rgb(79,125,241)] rounded-[10px] shadow-sm shadow-black font-semibold text-[25px] min-w-[100px] text-white text-center'>{formSchema?.country}</div>
                        <div className='p-[5px] bg-[rgb(79,125,241)] rounded-[10px] shadow-sm shadow-black font-semibold text-[25px] min-w-[100px] text-white text-center'>{formSchema?.brand}</div>
                    </div>
                    {formSchema?.schema ? (
                        <Card sx={{ boxShadow: 3, borderRadius: 2, maxWidth: '50vw', marginTop: 5, marginBottom: 5 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {formSchema?.name}
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Box ref={rendererRef} />
                            </CardContent>
                        </Card>
                    ) : <></>}
                    {showSubmission ? <Button variant="contained" onClick={handleHideSubmission}>Hide Submissions</Button>
                        : <Button variant="contained" onClick={handleViewSubmission}>View All Submissions</Button>}

                </Box>
            </Box >
            {showSubmission ? <div>
                <h2 style={{
                    marginTop: 50,
                }}>
                    {formSchema.name}'s Submissions
                </h2>
                <div className='w-[70vw] pt-[10px] shadow-sm rounded-[10px] bg-[#1976d2] overflow-x-auto' >
                    <table style={{ width: '100%' }}>
                        <thead style={{ backgroundColor: '#1976d2', color: '#ffffff' }} >
                            <tr >
                                {columns.map(c => <th key={c}>
                                    <div className='flex justify-center p-[3px]'>{c.toUpperCase()}</div>
                                </th>)}
                            </tr>
                        </thead>

                        <tbody style={{ backgroundColor: 'white', padding: 5 }}>
                            {submissions.map((s, i) => (
                                <tr key={i} >
                                    {columns.map(c => <td key={c}>
                                        <div className='flex w-full justify-center p-[3px] mt-[8px]' style={{}}>{s[c] || '-'}</div>
                                    </td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> </div> : <></>
            }
        </Box>);
}

export default ViewForm;