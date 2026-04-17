export const processPayment = async (productId) => {
  if (!import.meta.env.VITE_PAYMENT_API_URL) {
    if (import.meta.env.PROD) {
      throw new Error('Simulation logic is not permitted in production environment.');
    }
    // Simulation logic for local development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ url: `/?session_id=AXM-${Math.random().toString(36).substring(7)}` });
      }, 1000);
    });
  }

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId })
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const data = await response.json();
  if (data.token) {
    sessionStorage.setItem('axim_access_token', data.token);
  }
  return data;
};

export const verifySession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Invalid session ID");
  }

  if (sessionId.startsWith('AXM-')) {
    if (import.meta.env.PROD) {
      throw new Error('Simulation logic is not permitted in production environment.');
    }
    // Simulation logic for local development
    return new Promise((resolve) => {
      setTimeout(() => {
        sessionStorage.setItem('axim_access_token', 'simulated_jwt_token');
        resolve({ isPaid: true, token: 'simulated_jwt_token' });
      }, 1000);
    });
  }

  const response = await fetch(`/api/verify-session?session_id=${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to verify session');
  }

  const data = await response.json();
  if (data.token) {
    sessionStorage.setItem('axim_access_token', data.token);
  }
  return data;
};

export const getValidAccessToken = () => {
  return sessionStorage.getItem('axim_access_token');
};
