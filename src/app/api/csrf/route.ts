import { setCsrfCookie } from './server'

export async function GET() {
  const token = await setCsrfCookie();
  return Response.json({ token });
}
