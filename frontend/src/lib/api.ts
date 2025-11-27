const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

export const authApi = {
  login: (email: string, phone: string) =>
    fetchApi<{ success: boolean; token: string; customer: Customer }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, phone }),
    }),

  logout: () =>
    fetchApi<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),

  me: () =>
    fetchApi<{ customer: Customer }>('/api/auth/me'),
};

export const jobsApi = {
  getAll: () =>
    fetchApi<{ jobs: Job[] }>('/api/jobs'),

  getById: (uuid: string) =>
    fetchApi<{ job: Job }>(`/api/jobs/${uuid}`),

  getAttachments: (uuid: string) =>
    fetchApi<{ attachments: Attachment[] }>(`/api/jobs/${uuid}/attachments`),

  getMessages: (uuid: string) =>
    fetchApi<{ messages: Message[] }>(`/api/jobs/${uuid}/messages`),

  sendMessage: (uuid: string, content: string) =>
    fetchApi<{ message: Message }>(`/api/jobs/${uuid}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getActivities: (uuid: string) =>
    fetchApi<{ activities: JobActivity[] }>(`/api/jobs/${uuid}/activities`),
};

export interface Customer {
  id: string;
  email: string;
  name: string;
  companyUuid: string;
}

export interface Job {
  uuid: string;
  company_uuid: string;
  job_address: string;
  status: string;
  job_description: string;
  generated_job_id: string;
  date: string;
  total_invoice_amount: number;
  work_done_description: string;
  category_uuid: string;
}

export interface Attachment {
  uuid: string;
  related_object_uuid: string;
  file_type: string;
  attachment_name: string;
  attachment_source: string;
  created_date: string;
  file_url?: string;
}

export interface Message {
  id: string;
  job_uuid: string;
  customer_id: string;
  content: string;
  sender_type: 'customer' | 'staff';
  created_at: string;
}

export interface JobActivity {
  uuid: string;
  job_uuid: string;
  activity_was_scheduled: number;
  start_date: string;
  end_date: string;
  staff_uuid: string;
}
