import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Users
// Fetch all users from the backend
export const getUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

// Create a new user with provided data
export const createUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/users`, userData);
  return response.data;
};

// Auth
// Log in a user with credentials (username/email and password)
export const login = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  return response.data;
};

// Log out the current user (uncomment if implemented in backend)
// export const logout = async () => {
//   const response = await axios.post(`${API_BASE_URL}/auth/logout`);
//   return response.data;
// };

// Products
// Fetch all products from the backend
export const getProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};

// Create a new product with provided data
export const createProduct = async (productData) => {
  const response = await axios.post(`${API_BASE_URL}/products`, productData);
  return response.data;
};

// Leaderboard
// Fetch the top users for the leaderboard
export const getLeaderboard = async () => {
  const response = await axios.get(`${API_BASE_URL}/leaderboard`);
  return response.data;
};

// Receipts
// Scan a receipt image and get extracted items (use FormData for image upload)
export const scanReceipt = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/receipts/scan`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};


// Scan a barcode image and get the matched product info

//HOW TO ADD IMAGE TO FORM DATA:
//const formData = new FormData()
// formData.append('image', file); // 'file' is a File object from an <input type="file">
// const result = await scanBarcode(formData);

export const scanBarcode = async (formData) => {
  const response = await fetch('http://localhost:3000/api/products/scan-barcode', {
    method: 'POST',
    body: formData,
  });
  return await response.json();
};


// Recommendations
// Get sustainable alternatives for a specific product
export const getSustainableAlternatives = async (productId, limit = 3) => {
  const response = await axios.get(`${API_BASE_URL}/recommendations/alternatives/${productId}?limit=${limit}`);
  return response.data;
};

// Get personalized recommendations
export const getPersonalizedRecommendations = async (limit = 5, userId = null) => {
  const url = userId 
    ? `${API_BASE_URL}/recommendations/personalized?limit=${limit}&userId=${userId}`
    : `${API_BASE_URL}/recommendations/personalized?limit=${limit}`;
  const response = await axios.get(url);
  return response.data;
};

// Get product recommendations for a specific user (keeping your existing one)
export const getRecommendations = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/recommendations/${userId}`);
  return response.data;
};

// Upload (example for file upload)
// Upload a file to the backend (use FormData for file upload)
export const uploadFile = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};