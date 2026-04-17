export const processPayment = async (productId) => {
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

  return response.json();
};

export const verifySession = async (sessionId) => {
  if (!sessionId) {
    throw new Error("Invalid session ID");
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

  return response.json();
};
