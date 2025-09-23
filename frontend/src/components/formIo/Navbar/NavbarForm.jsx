import { AppBar, Toolbar, Typography, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useLocation, useNavigate } from "react-router-dom";


const pageTitles = {
    "/": "Dashboard",
    "/create-form": "Create Form",
    "/edit-form": "Edit Form",
    "/view-form": "View Form",
};

const NavbarForm = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const currentPath = location.pathname;
    const isDashboard = currentPath === "/";


    return (
        <AppBar position="static" color="primary" >
            <Toolbar>
                {/* Left Side */}
                {!isDashboard && (
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate("/")}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                )}

                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, ml: isDashboard ? 0 : 1 }}
                >
                    {pageTitles[currentPath] || "Form Manager"}
                </Typography>

                {/* Right Side */}
                {isDashboard && (
                    <Button
                        color="inherit"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/create-form")}
                    >
                        Create Form
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    )
}

export default NavbarForm