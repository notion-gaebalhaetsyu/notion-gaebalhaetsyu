import { getCurrentUser } from '@/utils/firebase/server-auth';
import ResponsiveNav from './ResponsiveNav';

export default async function Sidebar() {
  const user = await getCurrentUser();
  const role = user?.role || 'general';

  return <ResponsiveNav user={user} role={role} />;
}


