import apiClient from './client';

export const adminApi = {

    getDashboardStats: () => apiClient.get('/admin/dashboard'),


    getAllUsers: () => apiClient.get('/admin/users'),
    updateUser: (id: string, data: any) => apiClient.put(`/admin/users/${id}`, data),
    deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),


    getAllTechnicians: () => apiClient.get('/admin/technicians'),
    verifyTechnician: (id: string, status?: string, rejection_reason?: string) => apiClient.patch(`/admin/technicians/${id}/verify`, { status, rejection_reason }),
    getTechnicianPayouts: () => apiClient.get('/admin/technicians/payouts'),
    updateTechnician: (id: string, data: any) => apiClient.put(`/admin/technicians/${id}`, data),
    deleteTechnician: (id: string) => apiClient.delete(`/admin/technicians/${id}`),


    getAllServiceRequests: () => apiClient.get('/admin/requests'),
    deleteServiceRequest: (id: string) => apiClient.delete(`/admin/requests/${id}`),


    getAllAppliances: () => apiClient.get('/admin/appliances'),
    deleteAppliance: (id: string) => apiClient.delete(`/admin/appliances/${id}`),


    getReportData: (params: { type: string, startDate?: string, endDate?: string, status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiClient.get(`/admin/reports?${query}`);
    },

    getRevenueReport: (params: any) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/reports/revenue?${query}`);
    },

    getUserRosterReport: (params: any) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/reports/users?${query}`);
    },

    getTechnicianPerformanceReport: (params: any) => {
        const query = new URLSearchParams(params).toString();
        return apiClient.get(`/reports/technicians?${query}`);
    },


    login: (credentials: any) => apiClient.post('/auth/admin/login', credentials),
};
