import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import config from '../config';
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [forms, setForms] = useState([]); // initialize as empty array
  const navigate = useNavigate();
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);

  const handleDeleteClick = (id) => {
    setSelectedFormId(id);
    setDialogueOpen(true);
  };

  const handleDialogueClose = () => {
    setDialogueOpen(false);
    setSelectedFormId(null);
  };

  const handleDialogueConfirm = async () => {
    setDialogueOpen(false);
    if (selectedFormId) {
      await deleteForm(selectedFormId);
      await fetchAllForms();
      setSelectedFormId(null);
    }
  };

  const fetchAllForms = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/form/all`);
      const data = res.data;
      data.sort((a, b) => b.id - a.id);
      setForms(data);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteForm = async (id) => {
    try {
      await axios.delete(`${config.apiUrl}/form/${id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleView = (form) => navigate(`/forms/${form.id}`);
  const handleEdit = (form) => navigate(`/forms/edit/${form.id}`);

  useEffect(() => {
    fetchAllForms();
  }, []);

  return (
    <div className="p-[30px]">
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
            <TableRow>
              <TableCell>S. No</TableCell>
              <TableCell>Form Name</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: "#f9f9f9" }}>
            {forms.map((form, index) => (
              <TableRow
                key={form.id}
                sx={{
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{form.name}</TableCell>
                <TableCell>{form.country}</TableCell>
                <TableCell>{form.brand}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleView(form)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton color="success" onClick={() => handleEdit(form)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(form.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogueOpen} onClose={handleDialogueClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this form?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogueClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDialogueConfirm}
            color="primary"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;
