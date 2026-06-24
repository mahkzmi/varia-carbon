// frontend/js/api.js

// ============================================================
//  CONFIGURATION
// ============================================================

// آدرس بک‌اند - برای لوکال تست
const API_BASE = 'http://127.0.0.1:8000';

// ============================================================
//  CORE API CALL FUNCTION
// ============================================================

export async function apiCall(endpoint, method = 'GET', data = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method: method,
    headers: headers,
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    // اگر پاسخ OK نبود، خطا را بگیر
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        // اگر پاسخ JSON نبود
      }
      throw new Error(errorMessage);
    }
    
    // اگر پاسخ 204 No Content بود
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

// ============================================================
//  AUTHENTICATION
// ============================================================

export async function register(email, password, fullName) {
  return apiCall('/auth/register', 'POST', {
    email,
    password,
    full_name: fullName
  });
}

export async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Login failed: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
}

export async function getProfile(token) {
  return apiCall('/auth/me', 'GET', null, token);
}

// ============================================================
//  PREDICTION
// ============================================================

export async function predict(data, token) {
  return apiCall('/predict', 'POST', data, token);
}

export async function getHistory(token) {
  return apiCall('/history', 'GET', null, token);
}

export async function predictMap(data, token) {
  return apiCall('/predict-map', 'POST', data, token);
}

export async function benchmark(data, token) {
  return apiCall('/benchmark', 'POST', data, token);
}

export async function getTrend(token, days = 30) {
  return apiCall(`/trend?days=${days}`, 'GET', null, token);
}

// ============================================================
//  PAYMENT
// ============================================================

export async function createPayment(plan, token) {
  return apiCall('/payment/create', 'POST', { plan }, token);
}

export async function verifyPayment(paymentId, txHash, token) {
  return apiCall('/payment/verify', 'POST', {
    payment_id: paymentId,
    tx_hash: txHash
  }, token);
}

export async function getPaymentStatus(paymentId, token) {
  return apiCall(`/payment/status/${paymentId}`, 'GET', null, token);
}

// ============================================================
//  PLANS
// ============================================================

export async function getPlans() {
  return apiCall('/plans', 'GET');
}