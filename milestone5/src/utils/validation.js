// validation.js
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidName = (name) => {
  return typeof name === 'string' && name.length >= 2 && name.length <= 50;
};

const isValidPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

const isValidAddress = (address) => {
  return typeof address === 'object' && 
         address !== null && 
         address.street && 
         address.city && 
         address.state && 
         address.zipCode;
};

module.exports = {
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidAddress
};
