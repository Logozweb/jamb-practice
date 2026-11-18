/**
 * JAMB Practice Platform Database Service
 * Connects frontend state directly to the server-side SQLite persistent database (/api/*)
 * with transparent offline/localStorage caching and secure Admin Bearer token authorization.
 */

export function getAdminToken() {
  try {
    return localStorage.getItem('jamb_admin_token') || sessionStorage.getItem('jamb_admin_token') || '';
  } catch {
    return '';
  }
}

export function getAdminAuthHeaders() {
  const token = getAdminToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function apiGetCandidates() {
  try {
    const res = await fetch('/api/candidates', {
      headers: { ...getAdminAuthHeaders() }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem('jamb_candidates_db', JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('API fetch candidates failed, using local cache:', err);
  }
  try {
    const cached = localStorage.getItem('jamb_candidates_db');
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export async function apiSaveCandidate(candidateData) {
  try {
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify(candidateData)
    });
    if (res.ok) {
      const saved = await res.json();
      return saved;
    }
  } catch (err) {
    console.warn('API save candidate failed:', err);
  }
  return null;
}

export async function apiUpdateCandidate(id, updates) {
  try {
    const res = await fetch(`/api/candidates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API update candidate failed:', err);
  }
  return null;
}

export async function apiDeleteCandidate(id) {
  try {
    const res = await fetch(`/api/candidates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { ...getAdminAuthHeaders() }
    });
    return res.ok;
  } catch (err) {
    console.warn('API delete candidate failed:', err);
    return false;
  }
}

export async function apiLoginCandidate(emailOrReg, password) {
  try {
    const res = await fetch('/api/auth/candidate/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrReg, password })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Database network error. Please try again.' };
  }
}

export async function apiSaveExamResult(result) {
  try {
    const res = await fetch('/api/exam-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API save result failed:', err);
  }
  return null;
}

export async function apiGetExamResults(candidateId = null) {
  try {
    const url = candidateId ? `/api/exam-results?candidateId=${encodeURIComponent(candidateId)}` : '/api/exam-results';
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API get exam results failed:', err);
  }
  return [];
}

export async function apiGetPlatformSettings() {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API get settings failed:', err);
  }
  return null;
}

export async function apiSavePlatformSettings(settings) {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (err) {
    console.warn('API save settings failed:', err);
    return false;
  }
}

export async function apiGetAdmins() {
  try {
    const res = await fetch('/api/admins', {
      headers: { ...getAdminAuthHeaders() }
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('API get admins failed:', err);
  }
  return [];
}

export async function apiLoginAdmin(email, password) {
  try {
    const res = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      try {
        localStorage.setItem('jamb_admin_token', data.token);
      } catch (e) {}
    }
    return data;
  } catch (err) {
    return { success: false, error: 'Database network connection error.' };
  }
}

export async function apiLogoutAdmin() {
  try {
    await fetch('/api/auth/admin/logout', {
      method: 'POST',
      headers: { ...getAdminAuthHeaders() }
    });
  } catch (e) {}
  try {
    localStorage.removeItem('jamb_admin_token');
  } catch (e) {}
}

export async function apiUpdateAdminPassword(email, newPassword) {
  try {
    const res = await fetch('/api/admins/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify({ email, newPassword })
    });
    return res.ok;
  } catch (err) {
    console.warn('API update admin password failed:', err);
    return false;
  }
}

// -------------------------------------------------------------
// Candidate Malpractice Appeals API
// -------------------------------------------------------------
export async function apiSubmitAppeal(candidateId, reason) {
  try {
    const res = await fetch('/api/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, reason })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Could not connect to server to submit appeal.' };
  }
}

export async function apiGetAppeals() {
  try {
    const res = await fetch('/api/appeals', {
      headers: { ...getAdminAuthHeaders() }
    });
    if (res.ok) {
      const data = await res.json();
      return data.appeals || [];
    }
  } catch (err) {
    console.warn('Failed fetching appeals:', err);
  }
  return [];
}

export async function apiResolveAppeal(appealId, action, adminNotes = '') {
  try {
    const res = await fetch('/api/appeals/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify({ appealId, action, adminNotes })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed communicating appeal resolution to server.' };
  }
}

// -------------------------------------------------------------
// Admin Direct Candidate Modification API
// -------------------------------------------------------------
export async function apiAdminUpdateCandidate(candidateId, updates) {
  try {
    const res = await fetch(`/api/candidates/${encodeURIComponent(candidateId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify(updates)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed connecting to server to update candidate.' };
  }
}

// -------------------------------------------------------------
// Candidate Help Desk & Support Ticket API
// -------------------------------------------------------------
export async function apiGetSupportTickets(candidateId = null) {
  try {
    const url = candidateId
      ? `/api/support/tickets?candidateId=${encodeURIComponent(candidateId)}`
      : '/api/support/tickets';
    const headers = candidateId ? {} : getAdminAuthHeaders();
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      return data.tickets || [];
    }
  } catch (err) {
    console.warn('Failed fetching support tickets:', err);
  }
  return [];
}

export async function apiSubmitSupportTicket({ candidateId, category, subject, message }) {
  try {
    const res = await fetch('/api/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, category, subject, message })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Could not connect to server to submit support request.' };
  }
}

export async function apiResolveSupportTicket({ ticketId, adminReply, status = 'resolved' }) {
  try {
    const res = await fetch('/api/support/tickets/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify({ ticketId, adminReply, status })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed communicating resolution to server.' };
  }
}
