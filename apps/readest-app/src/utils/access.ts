import type { NextApiRequest, NextApiResponse } from 'next';
import { jwtDecode } from 'jwt-decode';
import { supabase } from '@/utils/supabase';
import { UserPlan } from '@/types/quota';
import { DEFAULT_DAILY_TRANSLATION_QUOTA, DEFAULT_STORAGE_QUOTA } from '@/services/constants';
import { isWebAppPlatform } from '@/services/environment';
import { getDailyUsage } from '@/services/translators/utils';
import { getStorageFixedQuota, getTranslationFixedQuota } from '@/utils/runtimeConfig';

interface Token {
  plan: UserPlan;
  storage_usage_bytes: number;
  storage_purchased_bytes: number;
  [key: string]: string | number;
}

export const getSubscriptionPlan = (token: string): UserPlan => {
  const data = jwtDecode<Token>(token) || {};
  return data['plan'] || 'free';
};

export const getUserProfilePlan = (token: string): UserPlan => {
  const data = jwtDecode<Token>(token) || {};
  let plan = data['plan'] || 'free';
  if (plan === 'free') {
    const purchasedQuota = data['storage_purchased_bytes'] || 0;
    if (purchasedQuota > 0) {
      plan = 'purchase';
    }
  }
  return plan;
};

export const STORAGE_QUOTA_GRACE_BYTES = 10 * 1024 * 1024; // 10 MB grace

export const getStoragePlanData = (token: string) => {
  const data = jwtDecode<Token>(token) || {};
  const plan = data['plan'] || 'free';
  const usage = data['storage_usage_bytes'] || 0;
  const purchasedQuota = data['storage_purchased_bytes'] || 0;
  const fixedQuota = parseInt(getStorageFixedQuota() || '0');
  const planQuota = fixedQuota || DEFAULT_STORAGE_QUOTA[plan] || DEFAULT_STORAGE_QUOTA['free'];
  const quota = planQuota + purchasedQuota;

  return {
    plan,
    usage,
    quota,
  };
};

export const getTranslationPlanData = (token: string) => {
  const data = jwtDecode<Token>(token) || {};
  const plan: UserPlan = data['plan'] || 'free';
  const usage = getDailyUsage() || 0;
  const quota = DEFAULT_DAILY_TRANSLATION_QUOTA[plan];

  return {
    plan,
    usage,
    quota,
  };
};

export const getDailyTranslationPlanData = (token: string) => {
  const data = jwtDecode<Token>(token) || {};
  const plan = data['plan'] || 'free';
  const fixedQuota = parseInt(getTranslationFixedQuota() || '0');
  const quota =
    fixedQuota || DEFAULT_DAILY_TRANSLATION_QUOTA[plan] || DEFAULT_DAILY_TRANSLATION_QUOTA['free'];

  return {
    plan,
    quota,
  };
};

export const getAccessToken = async (): Promise<string | null> => {
  if (isWebAppPlatform() && typeof window !== 'undefined') {
    const { getSupabaseBrowserClient } = await import('@/utils/supabase/client');
    const client = getSupabaseBrowserClient();
    const { data } = await client.auth.getSession();
    return data?.session?.access_token ?? localStorage.getItem('token') ?? null;
  }
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
};

export const getUserID = async (): Promise<string | null> => {
  if (isWebAppPlatform() && typeof window !== 'undefined') {
    const { getSupabaseBrowserClient } = await import('@/utils/supabase/client');
    const client = getSupabaseBrowserClient();
    const { data } = await client.auth.getSession();
    return data?.session?.user?.id ?? null;
  }
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id ?? null;
};

export const validateUserAndToken = async (authHeader: string | null | undefined) => {
  if (!authHeader) return {};

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) return {};
  return { user, token };
};

export const validateUserAndTokenFromPages = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { getSupabasePagesClient } = await import('@/utils/supabase/pages');
  const supabasePages = getSupabasePagesClient(req, res);
  const { data: { user }, error } = await supabasePages.auth.getUser();

  if (!error && user) {
    const { data: { session } } = await supabasePages.auth.getSession();
    if (session?.access_token) {
      return { user, token: session.access_token };
    }
  }

  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return validateUserAndToken(typeof authHeader === 'string' ? authHeader : authHeader[0]);
  }

  return {};
};

export const validateUserAndTokenFromAppRoute = async (request: Request) => {
  const { getSupabaseRequestClient } = await import('@/utils/supabase/request');
  const supabaseServer = getSupabaseRequestClient(request);
  const { data: { user }, error } = await supabaseServer.auth.getUser();

  if (!error && user) {
    const { data: { session } } = await supabaseServer.auth.getSession();
    if (session?.access_token) {
      return { user, token: session.access_token };
    }
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    return validateUserAndToken(authHeader);
  }

  return {};
};
