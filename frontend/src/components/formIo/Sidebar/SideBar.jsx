import { Drawer, Icon, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";
import PreviewIcon from '@mui/icons-material/Preview';
import BuildIcon from '@mui/icons-material/Build';


const drawerWidth = 220;

const SideBar = ({ open, onClose }) => {
    return (
        <Drawer variant="permanent"
            open={open}
            onClose={onClose}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
            }}
        >
            <Toolbar />
            <List>

                <ListItemButton component={Link} to="/">
                    <ListItemIcon>
                        <BuildIcon />
                    </ListItemIcon>
                    <ListItemText primary="Form Builder" />
                </ListItemButton>
                <ListItemButton component={Link} to="/forms">
                    <ListItemIcon>
                        <PreviewIcon />
                    </ListItemIcon>
                    <ListItemText primary="Form Render" />
                </ListItemButton>
            </List>
        </Drawer>
    )
}

export default SideBar;