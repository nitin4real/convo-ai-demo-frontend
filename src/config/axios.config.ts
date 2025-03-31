import axios from 'axios';
import { API_CONFIG } from './api.config';

axios.defaults.baseURL = API_CONFIG.BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export default axios; 