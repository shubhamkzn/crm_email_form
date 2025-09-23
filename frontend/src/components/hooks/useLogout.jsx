import axios from 'axios';
import { useNavigate } from 'react-router';

const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        alert("Logged out successfully!");
        navigate('/login');
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("Failed to logout.");
    }
  };

  return handleLogout;
};

export default useLogout;
