// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';

const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/check-auth`, {
          withCredentials: true,
        });
                
        if (res.status === 200) {
          setUser(res.data.user);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  return { loading, user };
};

export default useAuth;
