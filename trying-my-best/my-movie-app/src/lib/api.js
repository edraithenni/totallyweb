const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function api(url, method = 'GET', body = null) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  console.log('🔄 API Call:', { url: fullUrl, method, body });

  const opts = { 
    method, 
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // важно для cookies/sessions
  };
  
  if (body) {
    opts.body = JSON.stringify(body);
  }
  
  try {
    const res = await fetch(fullUrl, opts);
    console.log('📡 Response status:', res.status);
    
    const data = await res.json().catch(async () => {
      // Если JSON парсинг fails, попробуем получить текст
      const text = await res.text();
      return { error: text || 'Unknown error' };
    });
    
    console.log('📦 Response data:', data);
    
    if (!res.ok) {
      throw new Error(data.error || data.message || `HTTP error! status: ${res.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
}

export async function checkAuth() {
  try {
    return await api('/api/users/me');
  } catch (error) {
    throw new Error('Not authenticated');
  }
}