import axios from 'axios';

export const fileProcessingService = axios.create({
  baseURL: process.env.VUE_APP_FILE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
