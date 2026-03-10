// User Management System
// Handles user registration, login, and data storage

// Initialize users database
function initUsersDB() {
  if (!localStorage.getItem('usersDB')) {
    localStorage.setItem('usersDB', JSON.stringify([]));
  }
}

// Get all users
function getAllUsers() {
  initUsersDB();
  return JSON.parse(localStorage.getItem('usersDB')) || [];
}

// Save all users
function saveAllUsers(users) {
  localStorage.setItem('usersDB', JSON.stringify(users));
}

// Register new user
function registerUser(userData) {
  const users = getAllUsers();
  
  // Check if email already exists
  const existingUser = users.find(user => user.email === userData.email);
  if (existingUser) {
    return { success: false, message: 'Email already registered. Please login.' };
  }
  
  // Add new user
  const newUser = {
    id: Date.now(), // Unique ID
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    password: userData.password, // In production, this should be hashed
    address: userData.address || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveAllUsers(users);
  
  return { success: true, message: 'Account created successfully!', user: newUser };
}

// Login user
function loginUser(email, password) {
  const users = getAllUsers();
  
  // Find user by email
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { success: false, message: 'Email not found. Please sign up.' };
  }
  
  // Check password
  if (user.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }
  
  // Set login status
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('currentUser', JSON.stringify({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    address: user.address
  }));
  
  return { success: true, message: 'Login successful!', user: user };
}

// Logout user
function logoutUser() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  return { success: true, message: 'Logged out successfully!' };
}

// Get current logged-in user
function getCurrentUser() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) return null;
  
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Update user profile
function updateUserProfile(userId, updates) {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found.' };
  }
  
  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveAllUsers(users);
  
  // Update current user in localStorage if it's the logged-in user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem('currentUser', JSON.stringify({
      id: users[userIndex].id,
      fullName: users[userIndex].fullName,
      email: users[userIndex].email,
      phone: users[userIndex].phone,
      address: users[userIndex].address
    }));
  }
  
  return { success: true, message: 'Profile updated successfully!', user: users[userIndex] };
}

// Update user address
function updateUserAddress(userId, address) {
  return updateUserProfile(userId, { address: address });
}

// Get user by email
function getUserByEmail(email) {
  const users = getAllUsers();
  return users.find(u => u.email === email);
}

// Check if email exists
function emailExists(email) {
  const users = getAllUsers();
  return users.some(u => u.email === email);
}

// Delete user account
function deleteUserAccount(userId) {
  const users = getAllUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  
  if (users.length === filteredUsers.length) {
    return { success: false, message: 'User not found.' };
  }
  
  saveAllUsers(filteredUsers);
  
  // Logout if it's the current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    logoutUser();
  }
  
  return { success: true, message: 'Account deleted successfully!' };
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initUsersDB,
    getAllUsers,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updateUserProfile,
    updateUserAddress,
    getUserByEmail,
    emailExists,
    deleteUserAccount
  };
}
