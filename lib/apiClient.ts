// API client using Next.js API routes with PostgreSQL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api';

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  category?: 'events' | 'programs' | 'achievements' | 'all';
  status: 'draft' | 'published';
  publishedAt?: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type StaticPage = {
  id: string;
  title: string;
  slug: string;
  type: 'default' | 'home' | 'about' | 'contact' | 'custom';
  status: 'draft' | 'published';
  showInMenu: boolean;
  menuLabel?: string;
  order?: number;
  seoTitle?: string;
  seoDescription?: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  status: 'ongoing' | 'completed' | 'upcoming';
  category?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  showOnHome?: boolean;
  priority?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  type: 'board' | 'staff';
  order?: number;
  bio?: string;
};

export type LicenseItem = {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
};

export type PolicyItem = {
  id: string;
  title: string;
  description?: string;
  fileUrl?: string;
};

export type OrgStructureItem = {
	id: string;
	title: string;
	description: string;
};

export type OrgStructure = {
	items: OrgStructureItem[];
};

export type AssociationMember = {
	id: string;
	name: string;
	position: string;
	category: 'chairman' | 'member';
	email?: string;
	joinDate?: string;
	membershipNumber?: string;
	photo_url?: string;
};

export type DonationType =
  | 'product'
  | 'zakat'
  | 'sadaqa'
  | 'support'
  | 'waqf'
  | 'giftWaqf';

export type DonationProduct = {
  id: string;
  title: string;
  description: string;
  donationType: DonationType;
  suggestedAmount?: number;
  minAmount?: number;
  isActive: boolean;
  order?: number;
  // لاحقاً يمكنك إضافة imageUrl بعد ربط الرفع بالـAPI
};

export type Donation = {
  id: string;
  donationType: DonationType;
  productId?: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  status: 'success' | 'pending' | 'cancelled';
  createdAt: string;
  notes?: string;
};

export type Donor = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalDonated?: number;
  donationsCount?: number;
};

export type NewsCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProjectCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon_name?: string;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};


// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export const api = {
  // News API - Connected to PostgreSQL via API routes
  async listNews(params?: { page?: number; limit?: number }): Promise<PaginatedResult<NewsItem>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/news${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب الأخبار');
    const data = await response.json();

    if (Array.isArray(data)) {
      const items = data as NewsItem[];
      const fallbackLimit = items.length || 10;
      const limit = params?.limit !== undefined ? params.limit : fallbackLimit;
      return {
        items,
        total: items.length,
        page: 1,
        limit,
      };
    }

    return data as PaginatedResult<NewsItem>;
  },
  
  async getNews(id: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/news/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب الخبر');
    return response.json();
  },
  
  async createNews(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء الخبر');
    }
    return response.json();
  },
  
  async updateNews(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/news/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث الخبر');
    }
    return response.json();
  },
  
deleteNews: async (id: string) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/news/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل حذف الخبر');
  }
  return response.json();
},
  async listPages(params?: { page?: number; limit?: number }): Promise<PaginatedResult<StaticPage>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/pages${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب الصفحات');
    const data = await response.json();

    if (Array.isArray(data)) {
      const items = data as StaticPage[];
      const fallbackLimit = items.length || 10;
      const limit = params?.limit !== undefined ? params.limit : fallbackLimit;
      return {
        items,
        total: items.length,
        page: 1,
        limit,
      };
    }

    return data as PaginatedResult<StaticPage>;
  },
  
  async getPage(id: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/pages/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب الصفحة');
    return response.json();
  },
  
  async createPage(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء الصفحة');
    }
    return response.json();
  },
  
  async updatePage(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/pages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث الصفحة');
    }
    return response.json();
  },
  
  async deletePage(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/pages/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف الصفحة');
    }
    return response.json();
  },
  async listProjects(params?: { page?: number; limit?: number }): Promise<PaginatedResult<Project>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/projects${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب المشاريع');
    const data = await response.json();

    // دعم الاستجابة القديمة (مصفوفة فقط) في حال لم تُفعّل الـ Pagination بعد
    if (Array.isArray(data)) {
      const items = data as Project[];
      const fallbackLimit = items.length || 10;
      const limit = params?.limit !== undefined ? params.limit : fallbackLimit;
      return {
        items,
        total: items.length,
        page: 1,
        limit,
      };
    }

    return data as PaginatedResult<Project>;
  },
  
  async getProject(id: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب المشروع');
    return response.json();
  },
  
  async createProject(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء المشروع');
    }
    return response.json();
  },
  
  async updateProject(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث المشروع');
    }
    return response.json();
  },
  
  async deleteProject(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف المشروع');
    }
    return response.json();
  },
  async listTeam(params?: { page?: number; limit?: number }): Promise<PaginatedResult<TeamMember>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/team${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب فريق العمل');
    const data = await response.json();

    if (Array.isArray(data)) {
      const items = data as TeamMember[];
      const fallbackLimit = items.length || 20;
      const limit = params?.limit !== undefined ? params.limit : fallbackLimit;
      return {
        items,
        total: items.length,
        page: 1,
        limit,
      };
    }

    return data as PaginatedResult<TeamMember>;
  },
  
  async getTeamMember(id: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/team/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب عضو الفريق');
    return response.json();
  },
  
  async createTeamMember(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء عضو الفريق');
    }
    return response.json();
  },
  
  async updateTeamMember(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/team/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث عضو الفريق');
    }
    return response.json();
  },
  
  async deleteTeamMember(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/team/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف عضو الفريق');
    }
    return response.json();
  },
  
  async getTeamPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/team-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة فريق العمل');
    return response.json();
  },
  
  async updateTeamPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/team-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة فريق العمل');
    }
    return response.json();
  },
  
  async getContactPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/contact-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة التواصل');
    return response.json();
  },
  
  async updateContactPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/contact-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة التواصل');
    }
    return response.json();
  },
  
  async getVolunteeringPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/volunteering-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة التطوع');
    return response.json();
  },
  
  async updateVolunteeringPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/volunteering-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة التطوع');
    }
    return response.json();
  },
  
  async getPoliciesPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/policies-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة السياسات');
    return response.json();
  },
  
  async updatePoliciesPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/policies-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg = (error && (error.error || error.message)) || 'فشل تحديث محتوى صفحة السياسات';
      const details = error && error.details ? `: ${error.details}` : '';
      throw new Error(msg + details);
    }
    return response.json();
  },
  
  async getFinancialStatementsPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/financial-statements-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة القوائم المالية');
    return response.json();
  },
  
  async updateFinancialStatementsPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/financial-statements-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة القوائم المالية');
    }
    return response.json();
  },
  
  async getMembershipPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/membership-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة العضوية');
    return response.json();
  },
  
  async updateMembershipPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/membership-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة العضوية');
    }
    return response.json();
  },
  async listLicenses(params?: { page?: number; limit?: number }): Promise<PaginatedResult<LicenseItem>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/licenses${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'فشل جلب التراخيص' }));
      throw new Error(error.error || 'فشل جلب التراخيص');
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      const items = data as LicenseItem[];
      const fallbackLimit = items.length || 20;
      return { items, total: items.length, page: 1, limit: fallbackLimit };
    }
    return data as PaginatedResult<LicenseItem>;
  },
  
  async getLicense(id: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/licenses/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب الترخيص');
    return response.json();
  },
  
  async createLicense(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/licenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء الترخيص');
    }
    return response.json();
  },
  
  async updateLicense(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/licenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث الترخيص');
    }
    return response.json();
  },
  
  async deleteLicense(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/licenses/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف الترخيص');
    }
    return response.json();
  },
  async listPolicies(params?: { page?: number; limit?: number }): Promise<PaginatedResult<PolicyItem>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/policies${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب السياسات');
    const data = await response.json();
    if (Array.isArray(data)) {
      const items = data as PolicyItem[];
      const fallbackLimit = items.length || 20;
      return { items, total: items.length, page: 1, limit: fallbackLimit };
    }
    return data as PaginatedResult<PolicyItem>;
  },
  
  async getPolicy(id: string): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/policies/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب السياسة');
    return response.json();
  },
  
  async createPolicy(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء السياسة');
    }
    return response.json();
  },
  
  async updatePolicy(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/policies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث السياسة');
    }
    return response.json();
  },
  
  async deletePolicy(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/policies/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف السياسة');
    }
    return response.json();
  },
	async getOrgStructure(): Promise<OrgStructure | null> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/org-structure`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب الهيكل التنظيمي');
    return response.json();
  },
  
  async saveOrgStructure(payload: OrgStructure) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/org-structure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حفظ الهيكل التنظيمي');
    }
    return response.json();
  },

  // Org Structure Page Content API
  async getOrgStructurePageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/org-structure-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة الهيكل التنظيمي');
    return response.json();
  },

  async updateOrgStructurePageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/org-structure-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة الهيكل التنظيمي');
    }
    return response.json();
  },
  async listAssociationMembers(params?: { page?: number; limit?: number }): Promise<PaginatedResult<AssociationMember>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/members${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب أعضاء الجمعية');
    const data = await response.json();

    if (Array.isArray(data)) {
      const items = data as AssociationMember[];
      const fallbackLimit = items.length || 20;
      const limit = params?.limit !== undefined ? params.limit : fallbackLimit;
      return {
        items,
        total: items.length,
        page: 1,
        limit,
      };
    }

    return data as PaginatedResult<AssociationMember>;
  },
  
  async getAssociationMember(id: string): Promise<AssociationMember> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/members/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب عضو الجمعية');
    return response.json();
  },
  
  async createAssociationMember(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء عضو الجمعية');
    }
    return response.json();
  },
  
  async updateAssociationMember(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث عضو الجمعية');
    }
    return response.json();
  },
  
  async deleteAssociationMember(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/members/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف عضو الجمعية');
    }
    return response.json();
  },



  // Donation products
  async listDonationProducts(): Promise<DonationProduct[]> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donations/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب منتجات التبرع');
    return response.json();
  },
  
  async getDonationProduct(id: string): Promise<DonationProduct> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donations/products/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب منتج التبرع');
    return response.json();
  },
  
  async createDonationProduct(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donations/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء منتج التبرع');
    }
    return response.json();
  },
  
  async updateDonationProduct(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donations/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث منتج التبرع');
    }
    return response.json();
  },
  
  async deleteDonationProduct(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donations/products/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف منتج التبرع');
    }
    return response.json();
  },

  // Donations
  async listDonations(params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResult<Donation>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/donations${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب التبرعات');
    const data = await response.json();

    if (Array.isArray(data)) {
      const items = data as Donation[];
      const fallbackLimit = items.length || 20;
      const limit = params?.limit !== undefined ? params.limit : fallbackLimit;
      return {
        items,
        total: items.length,
        page: 1,
        limit,
      };
    }

    return data as PaginatedResult<Donation>;
  },
  
  async getDonation(id: string): Promise<Donation> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donations/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب التبرع');
    return response.json();
  },

  async updateDonation(id: string, payload: { status?: string; notes?: string }): Promise<Donation> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث التبرع');
    }
    return response.json();
  },

  async deleteDonation(id: string): Promise<void> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donations/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف التبرع');
    }
    return response.json();
  },

  // Donors
  async listDonors(params?: { page?: number; limit?: number }): Promise<PaginatedResult<Donor>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/donors${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب المتبرعين');
    const data = await response.json();

    if (Array.isArray(data)) {
      const items = data as Donor[];
      const fallbackLimit = items.length || 20;
      const limit = params?.limit !== undefined ? params.limit : fallbackLimit;
      return {
        items,
        total: items.length,
        page: 1,
        limit,
      };
    }

    return data as PaginatedResult<Donor>;
  },
  
  async getDonor(id: string): Promise<Donor> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donors/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب المتبرع');
    return response.json();
  },

  async deleteDonor(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donors/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف المتبرع');
    }
    return response.json();
  },

  // Categories API
  async listCategories(): Promise<NewsCategory[]> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || 'فشل جلب التصنيفات');
    }
    return response.json();
  },

  async getCategory(id: string): Promise<NewsCategory> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب التصنيف');
    return response.json();
  },

  async createCategory(payload: Partial<NewsCategory>) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء التصنيف');
    }
    return response.json();
  },

  async updateCategory(id: string, payload: Partial<NewsCategory>) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث التصنيف');
    }
    return response.json();
  },

  async deleteCategory(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف التصنيف');
    }
    return response.json();
  },

  // Project Categories API
  async listProjectCategories(): Promise<ProjectCategory[]> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/project-categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || 'فشل جلب تصنيفات المشاريع');
    }
    return response.json();
  },

  async getProjectCategory(id: string): Promise<ProjectCategory> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/project-categories/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب التصنيف');
    return response.json();
  },

  async createProjectCategory(payload: Partial<ProjectCategory>) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/project-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء التصنيف');
    }
    return response.json();
  },

  async updateProjectCategory(id: string, payload: Partial<ProjectCategory>) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/project-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث التصنيف');
    }
    return response.json();
  },

  async deleteProjectCategory(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/project-categories/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف التصنيف');
    }
    return response.json();
  },

  // Homepage Content API
  async getHomepageContent() {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/homepage`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى الصفحة الرئيسية');
    return response.json();
  },

  async updateHomepageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/homepage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى الصفحة الرئيسية');
    }
    return response.json();
  },

  // About Page Sections API
  async getAboutSections() {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/about`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب أقسام صفحة "من نحن"');
    return response.json();
  },

  async updateAboutSections(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/about`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث أقسام صفحة "من نحن"');
    }
    return response.json();
  },

  // Strategic Framework Page Content API
  async getStrategicFrameworkPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/strategic-framework-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة الإطار الاستراتيجي');
    return response.json();
  },

  async updateStrategicFrameworkPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/strategic-framework-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة الإطار الاستراتيجي');
    }
    return response.json();
  },

  // General Assembly Page Content API
  async getGeneralAssemblyPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/general-assembly-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة الجمعية العمومية');
    return response.json();
  },

  async updateGeneralAssemblyPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/general-assembly-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة الجمعية العمومية');
    }
    return response.json();
  },

  // Management Board Page Content API
  async getManagementBoardPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/management-board-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة مجلس الإدارة');
    return response.json();
  },

  async updateManagementBoardPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/management-board-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة مجلس الإدارة');
    }
    return response.json();
  },

  // Programs Page Content API
  async getProgramsPageContent() {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/programs-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة البرامج والمشاريع');
    return response.json();
  },

  async updateProgramsPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/programs-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة البرامج والمشاريع');
    }
    return response.json();
  },

  // Committees Page Content API
  async getCommitteesPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/committees-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة اللجان');
    return response.json();
  },

  async updateCommitteesPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/committees-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة اللجان');
    }
    return response.json();
  },

  // Offices/Branches Page Content API
  async getOfficesBranchesPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/offices-branches-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة المكاتب والفروع');
    return response.json();
  },

  async updateOfficesBranchesPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/offices-branches-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة المكاتب والفروع');
    }
    return response.json();
  },

  // Annual Reports Page Content API
  async getAnnualReportsPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/annual-reports-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة التقارير السنوية');
    return response.json();
  },

  async updateAnnualReportsPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/annual-reports-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة التقارير السنوية');
    }
    return response.json();
  },

  // Jobs Page Content API
  async getJobsPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/jobs-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة الوظائف');
    return response.json();
  },

  async updateJobsPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/jobs-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة الوظائف');
    }
    return response.json();
  },

  // Partnership Page Content API
  async getPartnershipPageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/partnership-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة الشراكة');
    return response.json();
  },

  async updatePartnershipPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/partnership-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة الشراكة');
    }
    return response.json();
  },

  // Donate Page Content API
  async getDonatePageContent(): Promise<any> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donate-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة التبرع');
    return response.json();
  },

  async updateDonatePageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/donate-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة التبرع');
    }
    return response.json();
  },

  // Volunteering Applications API
  async listVolunteeringApplications(params?: { status?: string; page?: number; limit?: number }) {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE}/volunteering-applications?${queryParams.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب طلبات التطوع');
    return response.json();
  },

  async updateVolunteeringApplication(id: string, payload: { status: string; notes?: string }) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/volunteering-applications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id, ...payload }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث طلب التطوع');
    }
    return response.json();
  },

  async deleteVolunteeringApplication(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/volunteering-applications?id=${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف طلب التطوع');
    }
    return response.json();
  },

  // Membership Applications API
  async listMembershipApplications(status?: string) {
    const token = getAuthToken();
    const url = status 
      ? `${API_BASE}/membership-applications?status=${status}`
      : `${API_BASE}/membership-applications`;
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب طلبات العضوية');
    return response.json();
  },

  async updateMembershipApplication(id: string, payload: { status: string; notes?: string }) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/membership-applications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id, ...payload }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث طلب العضوية');
    }
    return response.json();
  },

  async deleteMembershipApplication(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/membership-applications?id=${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف طلب العضوية');
    }
    return response.json();
  },

  // Job Applications API
  async listJobApplications(status?: string, jobId?: string) {
    const token = getAuthToken();
    let url = `${API_BASE}/job-applications`;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (jobId) params.append('job_id', jobId);
    if (params.toString()) url += '?' + params.toString();
    
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب طلبات الوظائف');
    return response.json();
  },

  async updateJobApplication(id: string, payload: { status: string; notes?: string }) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/job-applications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث طلب الوظيفة');
    }
    return response.json();
  },

  async deleteJobApplication(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/job-applications/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف طلب الوظيفة');
    }
    return response.json();
  },

  // Partnership Requests API
  async listPartnershipRequests(status?: string) {
    const token = getAuthToken();
    const url = status 
      ? `${API_BASE}/partnership-requests?status=${status}`
      : `${API_BASE}/partnership-requests`;
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب طلبات الشراكة');
    return response.json();
  },

  async updatePartnershipRequest(id: string, payload: { status: string; notes?: string }) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/partnership-requests/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث طلب الشراكة');
    }
    return response.json();
  },

  async deletePartnershipRequest(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/partnership-requests/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف طلب الشراكة');
    }
    return response.json();
  },

  // Reports API
  async listReports(params?: { page?: number; limit?: number }): Promise<PaginatedResult<any>> {
    const token = getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const qs = searchParams.toString();

    const response = await fetch(`${API_BASE}/reports${qs ? `?${qs}` : ''}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب التقارير');
    const data = await response.json();
    if (Array.isArray(data)) {
      const items = data;
      const fallbackLimit = items.length || 20;
      return { items, total: items.length, page: 1, limit: fallbackLimit };
    }
    return data as PaginatedResult<any>;
  },

  async getReport(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/reports/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب التقرير');
    return response.json();
  },

  async createReport(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل إنشاء التقرير');
    }
    return response.json();
  },

  async updateReport(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث التقرير');
    }
    return response.json();
  },

  async deleteReport(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف التقرير');
    }
    return response.json();
  },

  async getReportsPageContent() {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/reports-page`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب محتوى صفحة التقارير');
    return response.json();
  },

  async updateReportsPageContent(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/reports-page`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث محتوى صفحة التقارير');
    }
    return response.json();
  },

  // Site Settings API
  async getSiteSettings() {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/settings`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب إعدادات الموقع');
    return response.json();
  },

  async updateSiteSettings(payload: { settings: any[] }) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث إعدادات الموقع');
    }
    return response.json();
  },

  // Search
  async search(query: string): Promise<any[]> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل البحث');
    }
    return response.json();
  },

  // Supervising Authorities API
  async listSupervisingAuthorities(): Promise<any[]> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/supervising-authorities`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('فشل جلب الجهات المشرفة');
    return response.json();
  },

  async createSupervisingAuthority(payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/supervising-authorities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'خطأ غير معروف' }));
      const errorMessage = errorData.error || `خطأ ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    return response.json();
  },

  async updateSupervisingAuthority(id: string, payload: any) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/supervising-authorities/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل تحديث الجهة المشرفة');
    }
    return response.json();
  },

  async deleteSupervisingAuthority(id: string) {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/supervising-authorities/${id}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل حذف الجهة المشرفة');
    }
    return response.json();
  },

  // Feedback Surveys API
  async listFeedbackSurveys(type?: string, limit?: number, offset?: number): Promise<{ surveys: any[]; total: number; limit: number; offset: number }> {
    const token = getAuthToken();
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await fetch(`${API_BASE}/feedback?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل جلب الاستبيانات');
    }
    return response.json();
  },
};
