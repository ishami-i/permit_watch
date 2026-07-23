import axios from 'axios';
import { PERMIT_API_FULL_URL } from '../config';

// calling the api to get the permit data from the backend
export const permitData = async () => {
    try {
        const response = await axios.get(PERMIT_API_FULL_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching permit data:', error);
        throw error;
    }

};