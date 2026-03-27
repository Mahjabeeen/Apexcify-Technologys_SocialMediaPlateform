import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitcore_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fitcore_token');
      localStorage.removeItem('fitcore_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login         = (data) => API.post('/auth/login', data);
export const register      = (data) => API.post('/auth/register', data);
export const getMe         = ()     => API.get('/auth/me');
export const updatePassword= (data) => API.put('/auth/updatepassword', data);

// Dashboard
export const getDashStats   = ()     => API.get('/dashboard/stats');
export const getDashActivity= ()     => API.get('/dashboard/activity');

// Members
export const getMembers    = (params) => API.get('/members', { params });
export const getMember     = (id)     => API.get(`/members/${id}`);
export const createMember  = (data)   => API.post('/members', data);
export const updateMember  = (id, data) => API.put(`/members/${id}`, data);
export const deleteMember  = (id)     => API.delete(`/members/${id}`);
export const getMemberQR   = (id)     => API.get(`/members/${id}/qr`);

// Trainers
export const getTrainers   = ()       => API.get('/trainers');
export const getTrainer    = (id)     => API.get(`/trainers/${id}`);
export const createTrainer = (data)   => API.post('/trainers', data);
export const updateTrainer = (id, d)  => API.put(`/trainers/${id}`, d);
export const rateTrainer   = (id, d)  => API.post(`/trainers/${id}/rate`, d);

// Classes
export const getClasses    = ()       => API.get('/classes');
export const getClass      = (id)     => API.get(`/classes/${id}`);
export const createClass   = (data)   => API.post('/classes', data);
export const updateClass   = (id, d)  => API.put(`/classes/${id}`, d);
export const deleteClass   = (id)     => API.delete(`/classes/${id}`);
export const enrollClass   = (id)     => API.post(`/classes/${id}/enroll`);
export const unenrollClass = (id)     => API.delete(`/classes/${id}/unenroll`);

// Attendance
export const getAttendance  = (params) => API.get('/attendance', { params });
export const checkIn        = (data)   => API.post('/attendance/checkin', data);
export const qrCheckIn      = (data)   => API.post('/attendance/qr-checkin', data);
export const getAttendStats = (id)     => API.get(`/attendance/stats/${id}`);

// Payments
export const getPayments    = (params) => API.get('/payments', { params });
export const getPaymentStats= ()       => API.get('/payments/stats');
export const createPayment  = (data)   => API.post('/payments', data);
export const markPaid       = (id)     => API.put(`/payments/${id}/mark-paid`);
export const stripeSession  = (data)   => API.post('/payments/stripe-session', data);

// Workouts
export const getWorkoutPlans= ()       => API.get('/workouts/plans');
export const createWorkoutPlan=(data)  => API.post('/workouts/plans', data);
export const assignWorkout  = (id, d)  => API.post(`/workouts/plans/${id}/assign`, d);
export const getDietPlans   = ()       => API.get('/workouts/diet');
export const createDietPlan = (data)   => API.post('/workouts/diet', data);

export default API;
