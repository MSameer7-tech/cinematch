const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const homepageApi = {
  getHomepage: async (
    userId: string,
    timezone = 'UTC',
    locale = 'en-US',
    experimentGroup?: string,
    region: string = 'all',
    includeMature: boolean = true
  ): Promise<any> => {
    let url = `${API_BASE_URL}/homepage?user_id=${encodeURIComponent(userId)}&timezone=${encodeURIComponent(timezone)}&locale=${encodeURIComponent(locale)}&region=${encodeURIComponent(region)}&include_mature=${includeMature}`;
    if (experimentGroup) {
      url += `&experiment_group=${encodeURIComponent(experimentGroup)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Homepage Orchestrator Error: ${response.statusText}`);
    }
    return response.json();
  },

  getHomepageSection: async (
    sectionId: string,
    userId: string,
    page = 1,
    pageSize = 20,
    timezone = 'UTC',
    locale = 'en-US',
    experimentGroup?: string
  ): Promise<any> => {
    let url = `${API_BASE_URL}/homepage/sections/${encodeURIComponent(sectionId)}?user_id=${encodeURIComponent(userId)}&page=${page}&page_size=${pageSize}&timezone=${encodeURIComponent(timezone)}&locale=${encodeURIComponent(locale)}`;
    if (experimentGroup) {
      url += `&experiment_group=${encodeURIComponent(experimentGroup)}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Section Orchestrator Error: ${response.statusText}`);
    }
    return response.json();
  },
};
