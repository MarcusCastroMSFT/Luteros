import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth-helpers'
import { ContactInbox } from './contact-inbox'

export default async function ContactInboxPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login?redirectTo=/admin/contact')
  if (user.role !== 'ADMIN') redirect('/admin')
  return <ContactInbox />
}
