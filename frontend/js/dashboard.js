// frontend/js/dashboard.js

import { getToken, getCurrentUser, logoutUser, requireAuth } from './auth.js';
import { 
  predict, 
  getHistory, 
  benchmark, 
  getTrend,
  createPayment as createPaymentAPI,
  verifyPayment as verifyPaymentAPI,
  getPaymentStatus as getPaymentStatusAPI
} from './api.js';

console.log('Dashboard loaded');

const API_BASE = 'http://127.0.0.1:8000';
const token = getToken();

if (!requireAuth()) {
  console.log('Redirecting to login...');
  window.location.href = 'login.html';
}

console.log('Token:', token);

// ===== DOM REFS =====
const $ = id => document.getElementById(id);

// ============================================================
//  PROFILE
// ============================================================

async function loadProfile() {
  try {
    const user = await getCurrentUser();
    console.log('User profile:', user);
    const userEmailEl = $('userEmail');
    const userPlanEl = $('userPlan');
    const requestsInfoEl = $('requestsInfo');
    if (userEmailEl) userEmailEl.textContent = user.email;
    if (userPlanEl) userPlanEl.textContent = user.plan || 'free';
    if (requestsInfoEl) {
      requestsInfoEl.textContent = `${user.requests_used || 0} / ${user.requests_limit || 100} requests`;
    }
  } catch (e) { console.error('Profile error:', e); }
}

// ============================================================
//  HISTORY
// ============================================================

async function loadHistory() {
  try {
    const history = await getHistory(token);
    const historyList = $('historyList');
    if (!historyList) {
      console.error('historyList element not found!');
      return;
    }
    if (!history || history.length === 0) {
      historyList.innerHTML = '<div class="empty-state">No predictions yet.</div>';
      return;
    }
    historyList.innerHTML = history.map(p => `
      <div class="history-item">
        <div><strong>${p.soc_percent}%</strong> SOC</div>
        <div class="text-right text-gray-500 text-xs">
          ${p.carbon_credits} tCO₂/ha<br>
          ${new Date(p.created_at).toLocaleDateString()}
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('History error:', e);
    const historyList = $('historyList');
    if (historyList) historyList.innerHTML = '<div class="empty-state text-red-600">Error loading history</div>';
  }
}

// ============================================================
//  PREDICT
// ============================================================

const predictForm = $('predictForm');
if (predictForm) {
  predictForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Predict form submitted');
    
    const data = {
      ndvi: parseFloat($('ndvi').value),
      precipitation: parseFloat($('precipitation').value),
      temperature: parseFloat($('temperature').value),
      elevation: parseFloat($('elevation').value),
      clay: parseFloat($('clay').value)
    };

    if (data.ndvi < 0 || data.ndvi > 1) { alert('NDVI must be between 0 and 1'); return; }
    if (data.clay < 0 || data.clay > 100) { alert('Clay must be between 0 and 100'); return; }

    const btn = $('predictBtn');
    const orig = btn.textContent;
    btn.textContent = '⏳ Predicting...';
    btn.disabled = true;

    try {
      const result = await predict(data, token);
      console.log('Prediction result:', result);
      const resultBox = $('result');
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div class="flex justify-between items-center">
            <div>
              <div class="text-sm text-gray-600">Soil Organic Carbon</div>
              <div class="text-3xl font-bold text-green-700">${result.soc_percent}%</div>
              <div class="text-sm text-gray-600">Carbon Credits: ${result.carbon_credits} tCO₂/ha</div>
            </div>
            <div class="bg-green-100 px-4 py-2 rounded-xl text-center">
              <div class="text-xs text-gray-600">Accuracy</div>
              <div class="font-bold text-green-700">R² = 0.78</div>
            </div>
          </div>
        `;
      }
      await loadHistory();
      await loadProfile();
    } catch (e) {
      console.error('Prediction error:', e);
      alert('Prediction failed: ' + e.message);
    } finally {
      btn.textContent = orig;
      btn.disabled = false;
    }
  });
} else {
  console.error('Predict form not found!');
}

// ============================================================
//  BENCHMARK
// ============================================================

const benchmarkBtn = $('benchmarkBtn');
if (benchmarkBtn) {
  benchmarkBtn.addEventListener('click', async () => {
    console.log('Benchmark button clicked');
    const btn = $('benchmarkBtn');
    const div = $('benchmarkResult');
    const orig = btn.textContent;
    btn.textContent = '⏳ Comparing...';
    btn.disabled = true;
    if (div) div.innerHTML = '';

    try {
      const data = await benchmark({
        ndvi: parseFloat($('ndvi').value),
        precipitation: parseFloat($('precipitation').value),
        temperature: parseFloat($('temperature').value),
        elevation: parseFloat($('elevation').value),
        clay: parseFloat($('clay').value)
      }, token);
      
      console.log('Benchmark data:', data);

      const colors = { high: '#1a5d3a', good: '#2d7d4f', moderate: '#f59e0b', low: '#d32f2f' };
      if (div) {
        div.style.display = 'block';
        div.innerHTML = `
          <div class="border-b pb-2"><strong>Your SOC:</strong> <span class="text-xl font-bold text-green-700">${data.your_soc}%</span></div>
          <div class="grid grid-cols-2 gap-1 mt-2 text-sm">
            <div>vs Global: <strong>${data.vs_global > 0 ? '+' : ''}${data.vs_global}%</strong></div>
            <div>vs Europe: <strong>${data.vs_europe > 0 ? '+' : ''}${data.vs_europe}%</strong></div>
            <div>vs Cropland: <strong>${data.vs_optimal_cropland > 0 ? '+' : ''}${data.vs_optimal_cropland}%</strong></div>
            <div>vs Grassland: <strong>${data.vs_optimal_grassland > 0 ? '+' : ''}${data.vs_optimal_grassland}%</strong></div>
          </div>
          <div class="mt-2 text-sm font-medium" style="color:${colors[data.status] || '#6b7f6b'}">${data.status_text}</div>
        `;
      }
    } catch (e) {
      console.error('Benchmark error:', e);
      if (div) div.innerHTML = `<span class="text-red-600">Error: ${e.message}</span>`;
    } finally {
      btn.textContent = orig;
      btn.disabled = false;
    }
  });
} else {
  console.error('Benchmark button not found!');
}

// ============================================================
//  TREND
// ============================================================

const trendBtn = $('trendBtn');
if (trendBtn) {
  trendBtn.addEventListener('click', async () => {
    console.log('Trend button clicked');
    const btn = $('trendBtn');
    const div = $('trendResult');
    const orig = btn.textContent;
    btn.textContent = '⏳ Loading...';
    btn.disabled = true;
    if (div) div.innerHTML = '';

    try {
      const result = await getTrend(token, 30);
      console.log('Trend data:', result);
      const data = result.data || [];

      if (result.message) {
        if (div) {
          div.style.display = 'block';
          div.innerHTML = `<div class="bg-yellow-100 p-3 rounded-lg text-yellow-800">${result.message}</div>`;
        }
        return;
      }
      if (data.length === 0) {
        if (div) {
          div.style.display = 'block';
          div.innerHTML = `<div class="bg-yellow-100 p-3 rounded-lg text-yellow-800">No predictions yet.</div>`;
        }
        return;
      }

      const first = data[0];
      const last = data[data.length - 1];
      const firstVal = parseFloat(first.soc_percent) || 0;
      const lastVal = parseFloat(last.soc_percent) || 0;
      const change = lastVal - firstVal;
      const pct = firstVal !== 0 ? (change / firstVal) * 100 : 0;

      let statusText = '➖ Stable';
      let color = '#6b7f6b';
      if (change > 0.5) { statusText = '✅ Increasing'; color = '#1a5d3a'; }
      else if (change < -0.5) { statusText = '⚠️ Decreasing'; color = '#d32f2f'; }

      if (div) {
        div.style.display = 'block';
        div.innerHTML = `
          <div class="bg-gray-100 p-3 rounded-lg">
            <div class="grid grid-cols-2 gap-1 text-sm">
              <div>First: <strong>${firstVal.toFixed(2)}%</strong></div>
              <div>Latest: <strong style="color:${color}">${lastVal.toFixed(2)}%</strong></div>
              <div>Change: <strong style="color:${change >= 0 ? '#1a5d3a' : '#d32f2f'}">${change > 0 ? '+' : ''}${change.toFixed(2)}%</strong></div>
              <div>Percent: <strong>${pct.toFixed(2)}%</strong></div>
            </div>
            <div class="mt-1 font-medium" style="color:${color}">${statusText}</div>
          </div>
          <div class="trend-list">
            ${data.map(p => `
              <div class="trend-item">
                <span>${new Date(p.date).toLocaleDateString()}</span>
                <span><strong>${parseFloat(p.soc_percent).toFixed(2)}%</strong></span>
                <span class="text-gray-500">${parseFloat(p.carbon_credits).toFixed(2)} tCO₂/ha</span>
              </div>
            `).join('')}
          </div>
          <div class="text-right text-xs text-gray-500 mt-1">${data.length} predictions</div>
        `;
      }
    } catch (e) {
      console.error('Trend error:', e);
      if (div) div.innerHTML = `<span class="text-red-600">Error: ${e.message}</span>`;
    } finally {
      btn.textContent = 'Show Trend →';
      btn.disabled = false;
    }
  });
} else {
  console.error('Trend button not found!');
}

// ============================================================
//  PAYMENT
// ============================================================

window.createPayment = async function(plan) {
  console.log('Payment create:', plan);
  const div = $('paymentResult');
  if (!div) {
    console.error('paymentResult element not found!');
    return;
  }
  div.innerHTML = '<span class="text-gray-500">⏳ Creating...</span>';
  try {
    const data = await createPaymentAPI(plan, token);
    console.log('Payment data:', data);
    div.innerHTML = `
      <div class="bg-yellow-50 p-3 rounded-lg text-sm mt-2">
        <p>💸 Send <strong>${data.amount} USDT</strong> (TRC20) to:</p>
        <code class="block bg-white p-2 rounded text-xs break-all my-1">${data.wallet_address}</code>
        <p>Payment ID: <strong>${data.payment_id}</strong></p>
        <button onclick="window.verifyPayment('${data.payment_id}')" class="bg-green-600 text-white px-3 py-1 rounded text-xs mt-1">✅ Verify</button>
        <button onclick="window.checkPaymentStatus('${data.payment_id}')" class="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs mt-1 ml-1">🔍 Status</button>
      </div>
    `;
  } catch (e) {
    console.error('Payment error:', e);
    div.innerHTML = `<span class="text-red-600">❌ ${e.message}</span>`;
  }
};

window.verifyPayment = async function(paymentId) {
  console.log('Verify payment:', paymentId);
  const txHash = prompt('Enter transaction hash (TXID):');
  if (!txHash) return;
  const div = $('paymentResult');
  if (!div) return;
  div.innerHTML = '<span class="text-gray-500">⏳ Verifying...</span>';
  try {
    const data = await verifyPaymentAPI(paymentId, txHash, token);
    console.log('Verify response:', data);
    div.innerHTML = `<div class="bg-green-100 p-3 rounded-lg text-green-800">✅ ${data.message}</div>`;
    setTimeout(() => location.reload(), 2000);
  } catch (e) {
    console.error('Verify error:', e);
    div.innerHTML = `<span class="text-red-600">❌ ${e.message}</span>`;
  }
};

window.checkPaymentStatus = async function(paymentId) {
  console.log('Check status:', paymentId);
  const div = $('paymentResult');
  if (!div) return;
  div.innerHTML = '<span class="text-gray-500">⏳ Checking...</span>';
  try {
    const data = await getPaymentStatusAPI(paymentId, token);
    console.log('Status data:', data);
    div.innerHTML = `
      <div class="bg-gray-100 p-3 rounded-lg text-sm mt-2">
        <div>Status: <strong>${data.status.toUpperCase()}</strong></div>
        <div>Plan: <strong>${data.plan}</strong></div>
        <div>Amount: <strong>${data.amount} USDT</strong></div>
      </div>
    `;
  } catch (e) {
    console.error('Status error:', e);
    div.innerHTML = `<span class="text-red-600">❌ ${e.message}</span>`;
  }
};

// ============================================================
//  LOGOUT & INIT
// ============================================================

const logoutBtn = $('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    console.log('Logout clicked');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });
} else {
  console.error('Logout button not found!');
}

loadProfile();
loadHistory();