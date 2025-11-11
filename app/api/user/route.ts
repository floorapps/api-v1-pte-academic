import { getUser, updateUser } from '@/lib/db/queries';

// Route handlers are server-only by default in Next.js
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    return Response.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updatedUser = await updateUser(body);
    return Response.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
