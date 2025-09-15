import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
try {
    const response = await axios.get(`${API_BASE_URL}/some-endpoint`);
    console.log('API response:', response.data);
} catch (error) {
    console.log(`Error: ${error}`);
}