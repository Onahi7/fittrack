import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const subscriptionApi = {
  // Get current user subscription
  getMySubscription: async (token: string) => {
    const response = await axios.get(`${API_URL}/subscriptions/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Initialize Paystack payment
  initializePaystack: async (token: string, tier: 'premium' | 'pro', email: string) => {
    const response = await axios.post(
      `${API_URL}/subscriptions/initialize/paystack`,
      { tier, email },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Initialize OPay payment
  initializeOpay: async (token: string, tier: 'premium' | 'pro', email: string) => {
    const response = await axios.post(
      `${API_URL}/subscriptions/initialize/opay`,
      { tier, email },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Verify Paystack payment
  verifyPaystack: async (token: string, reference: string) => {
    const response = await axios.get(
      `${API_URL}/subscriptions/verify/paystack/${reference}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Verify OPay payment
  verifyOpay: async (token: string, reference: string) => {
    const response = await axios.get(
      `${API_URL}/subscriptions/verify/opay/${reference}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (token: string) => {
    const response = await axios.post(
      `${API_URL}/subscriptions/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Check feature access
  checkFeatureAccess: async (token: string, feature: string) => {
    const response = await axios.get(
      `${API_URL}/subscriptions/feature-access/${feature}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },
};
