const DEV_API_BASE_URL = "http://192.168.1.100:5000";
const PROD_API_BASE_URL = "https://your-messmate-backend.onrender.com";

export const API_BASE_URL = __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL;
