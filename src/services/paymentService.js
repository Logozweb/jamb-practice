import { getAdminAuthHeaders } from './dbService';

// Dynamically load Paystack Inline JS script
export function loadPaystackScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.PaystackPop) return resolve(true);

    const existingScript = document.getElementById('paystack-inline-script');
    if (existingScript) {
      existingScript.onload = () => resolve(true);
      existingScript.onerror = () => resolve(false);
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Could not load Paystack inline script from CDN.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// Fetch public payment settings (enabled, fee in Naira, public key)
export async function fetchPublicPaymentSettings() {
  try {
    const res = await fetch('/api/payment/public-settings');
    if (res.ok) {
      const data = await res.json();
      return data.settings || { enabled: true, accessFeeNaira: 50, paystackPublicKey: '' };
    }
  } catch (e) {
    console.warn('Could not fetch public payment settings:', e);
  }
  return { enabled: true, accessFeeNaira: 50, paystackPublicKey: '' };
}

// Fetch full payment settings (Admin only)
export async function fetchAdminPaymentSettings() {
  try {
    const res = await fetch('/api/payment/settings', {
      headers: { ...getAdminAuthHeaders() }
    });
    if (res.ok) {
      const data = await res.json();
      return data.settings;
    }
  } catch (e) {
    console.warn('Could not fetch admin payment settings:', e);
  }
  return null;
}

// Save payment settings (Admin only)
export async function saveAdminPaymentSettings(settings) {
  try {
    const res = await fetch('/api/payment/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeaders()
      },
      body: JSON.stringify(settings)
    });
    if (res.ok) {
      const data = await res.json();
      return data.settings;
    }
  } catch (e) {
    console.warn('Could not save admin payment settings:', e);
  }
  return null;
}

// Fetch transaction log (Admin only)
export async function fetchPaymentTransactions() {
  try {
    const res = await fetch('/api/payment/transactions', {
      headers: { ...getAdminAuthHeaders() }
    });
    if (res.ok) {
      const data = await res.json();
      return data.payments || [];
    }
  } catch (e) {
    console.warn('Could not fetch payment transactions:', e);
  }
  return [];
}

// Verify transaction on backend server
export async function verifyPaymentWithServer(reference, candidateId) {
  try {
    const res = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, candidateId })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return {
      success: false,
      error: 'Network connection error while contacting verification server.'
    };
  }
}
