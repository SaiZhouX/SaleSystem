const API_BASE_URL = 'http://localhost:8080/api';

const api = {
  addFish: `${API_BASE_URL}/fish`,
  getFishList: `${API_BASE_URL}/fish`,
  getFishDetail: (id) => `${API_BASE_URL}/fish/${id}`,
  updateFish: (id) => `${API_BASE_URL}/fish/${id}`,
  uploadPhoto: `${API_BASE_URL}/files/uploadPhoto`,
  uploadBarcode: `${API_BASE_URL}/files/uploadBarcode`,
};

module.exports = api;