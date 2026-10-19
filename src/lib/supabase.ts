import { createClient, SupabaseClient } from '@supabase/supabase-js';

let runtimeUrl = '';
let runtimeKey = '';

export const setRuntimeSupabaseCredentials = (url?: string, key?: string) => {
  if (url && typeof url === 'string') {
    runtimeUrl = url.trim();
    try {
      if (typeof window !== 'undefined' && runtimeUrl) {
        localStorage.setItem('cbt_supabase_url', runtimeUrl);
      }
    } catch (e) {}
  }
  if (key && typeof key === 'string') {
    runtimeKey = key.trim();
    try {
      if (typeof window !== 'undefined' && runtimeKey) {
        localStorage.setItem('cbt_supabase_key', runtimeKey);
      }
    } catch (e) {}
  }
};

export const getSupabaseCredentials = () => {
  const metaEnv = (import.meta as any)?.env || {};

  // Check URL params if present in browser
  let paramUrl = '';
  let paramKey = '';
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const qUrl = searchParams.get('supa_url') || searchParams.get('supabase_url');
      const qKey = searchParams.get('supa_key') || searchParams.get('supabase_key');
      if (qUrl) {
        paramUrl = qUrl.trim();
        try { localStorage.setItem('cbt_supabase_url', paramUrl); } catch (e) {}
      }
      if (qKey) {
        paramKey = qKey.trim();
        try { localStorage.setItem('cbt_supabase_key', paramKey); } catch (e) {}
      }
    } catch (e) {}
  }

  const url = (
    runtimeUrl ||
    paramUrl ||
    (typeof window !== 'undefined' ? localStorage.getItem('cbt_supabase_url') || '' : '') ||
    metaEnv.VITE_SUPABASE_URL ||
    ''
  ).trim();

  const key = (
    runtimeKey ||
    paramKey ||
    (typeof window !== 'undefined' ? localStorage.getItem('cbt_supabase_key') || '' : '') ||
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  return { url, key };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
      url.startsWith('http') &&
      !url.includes('your-project.supabase.co') &&
      key &&
      key.length > 20 &&
      key !== 'your-anon-key-here'
  );
};

let cachedInstanceUrl = '';
let cachedInstanceKey = '';
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (!supabaseInstance || cachedInstanceUrl !== url || cachedInstanceKey !== key) {
    cachedInstanceUrl = url;
    cachedInstanceKey = key;
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

