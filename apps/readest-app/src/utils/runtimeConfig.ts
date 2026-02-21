declare global {
  interface Window {
    __READEST_CONFIG__?: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
      API_BASE_URL?: string;
      OBJECT_STORAGE_TYPE?: string;
      STORAGE_FIXED_QUOTA?: string;
      TRANSLATION_FIXED_QUOTA?: string;
    };
  }
}

const getConfigValue = (
  runtimeKey: keyof NonNullable<Window['__READEST_CONFIG__']>,
  nextPublicEnvKey: string,
  serverEnvKey?: string,
): string => {
  if (typeof window === 'undefined') {
    return (
      (serverEnvKey ? process.env[serverEnvKey] : '') ||
      process.env[nextPublicEnvKey] ||
      ''
    );
  }
  return (
    window.__READEST_CONFIG__?.[runtimeKey] ||
    process.env[nextPublicEnvKey] ||
    ''
  );
};

export const getSupabaseUrl = (): string => {
  const url = getConfigValue('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  if (url) return url;
  try {
    return atob(process.env['NEXT_PUBLIC_DEFAULT_SUPABASE_URL_BASE64']!);
  } catch {
    return '';
  }
};

export const getSupabaseAnonKey = (): string => {
  const key = getConfigValue('SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY');
  if (key) return key;
  try {
    return atob(process.env['NEXT_PUBLIC_DEFAULT_SUPABASE_KEY_BASE64']!);
  } catch {
    return '';
  }
};

export const getApiBaseUrl = (): string =>
  getConfigValue('API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL');

export const getObjectStorageType = (): string =>
  getConfigValue('OBJECT_STORAGE_TYPE', 'NEXT_PUBLIC_OBJECT_STORAGE_TYPE');

export const getStorageFixedQuota = (): string =>
  getConfigValue('STORAGE_FIXED_QUOTA', 'NEXT_PUBLIC_STORAGE_FIXED_QUOTA');

export const getTranslationFixedQuota = (): string =>
  getConfigValue('TRANSLATION_FIXED_QUOTA', 'NEXT_PUBLIC_TRANSLATION_FIXED_QUOTA');
