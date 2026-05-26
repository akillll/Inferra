const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const getMetrics =
  async () => {

    const response = await fetch(
      `${API}/metrics`
    );

    if (!response.ok) {
      throw new Error("Failed to load metrics");
    }

    return response.json();
  };
