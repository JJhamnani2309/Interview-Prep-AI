const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiCall = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('access_token');

    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };

    if (body) {
        const isFormData = body instanceof FormData;

        if (isFormData) {
            delete headers['Content-Type'];
            config.body = body;
        } else {
            config.body = JSON.stringify(body);
        }
    }

    const normalizedEndpoint = endpoint.endsWith('/') ? endpoint : endpoint + '/';
    const fullUrl = `${BASE_URL}${normalizedEndpoint}`;

    const response = await fetch(fullUrl, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessage = data.error || data.detail || 'API Error';
        throw new Error(errorMessage);
    }

    return data;
};
