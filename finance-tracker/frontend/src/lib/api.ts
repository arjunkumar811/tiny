import { auth } from "@/auth";

export async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await auth();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.accessToken}`,
    'x-organization-id': session.organizationId,
    ...options.headers,
  };

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
