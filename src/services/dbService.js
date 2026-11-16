/**
 * JAMB Practice Platform Database Service
 * Connects frontend state directly to the server-side SQLite persistent database (/api/*)
 * with transparent offline/localStorage caching.
 */

export async function apiGetCandidates() {
  try {
    const res = await fetch('/api/candidates');
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      method: 'DELETE'
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
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch('/api/admins');
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
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Database network connection error.' };
  }
}

export async function apiUpdateAdminPassword(email, newPassword) {
  try {
    const res = await fetch('/api/admins/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    return res.ok;
  } catch (err) {
    console.warn('API update admin password failed:', err);
    return false;
  }
}
