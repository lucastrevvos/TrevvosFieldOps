export interface ApiHealth {
  service: string;
  status: 'ok';
  timestamp: string;
}

export async function getApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  const response = await fetch('/api/health', { signal });

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }

  return response.json() as Promise<ApiHealth>;
}
