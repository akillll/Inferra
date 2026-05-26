const API = "http://localhost:8000";

export const getMetrics =
  async () => {

    const response = await fetch(
      `${API}/metrics`
    );

    return response.json();
  };