'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/ui/user-avatar'
import { StatusBadge } from '@/components/common/badges/status-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EditUserModal } from './edit-user-modal'
import { DeleteUserModal } from './delete-user-modal'
import {
  IconMail,
  IconPhone,
  IconCalendar,
  IconMapPin,
  IconBriefcase,
  IconWorld,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconClock,
  IconUser,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'

interface UserDetailsModalProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated?: () => void
}

interface UserDetails {
  id: string
  fullName: string | null
  displayName: string | null
  email: string
  avatar: string | null
  phone: string | null
  bio: string | null
  title: string | null
  company: string | null
  website: string | null
  linkedin: string | null
  twitter: string | null
  dateOfBirth: string | null
  language: string
  timezone: string
  emailNotifications: boolean
  marketingEmails: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  status: string
  role: string
  // Stats
  rating: number | null
  reviewsCount: number
  studentsCount: number
  coursesCount: number
}

export function UserDetailsModal({ userId, open, onOpenChange, onUserUpdated }: UserDetailsModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails()
    } else {
      setUser(null)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, open])

  const fetchUserDetails = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)
    try {
      console.log('Fetching user details for ID:', userId)
      const response = await fetch(`/api/users/${userId}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to fetch user details')
      }
      
      const data = await response.json()
      console.log('User details received:', data)
      setUser(data)
    } catch (error) {
      console.error('Error fetching user details:', error)
      setError(error instanceof Error ? error.message : 'Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações completas do perfil do usuário
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar os detalhes do usuário
            </p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start gap-4">
              <UserAvatar
                name={user.displayName || user.fullName || user.email}
                avatar={user.avatar}
                className="h-16 w-16"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold">
                    {user.displayName || user.fullName || 'Sem nome'}
                  </h3>
                  <StatusBadge
                    value={user.status}
                    labels={{
                      active: 'Ativo',
                      draft: 'Pendente',
                      inactive: 'Inativo',
                      suspended: 'Suspenso',
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  @{user.displayName || user.fullName?.split(' ')[0] || 'user'}
                </p>
                <Badge variant="outline">{user.role}</Badge>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Biografia</h4>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              </>
            )}

            {/* Contact Information */}
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3">Informações de Contato</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem icon={IconMail} label="Email" value={user.email} />
                <InfoItem
                  icon={IconPhone}
                  label="Telefone"
                  value={user.phone || 'Não informado'}
                />
                <InfoItem
                  icon={IconCalendar}
                  label="Data de Nascimento"
                  value={formatDate(user.dateOfBirth)}
                />
                <InfoItem
                  icon={IconMapPin}
                  label="Fuso Horário"
                  value={user.timezone}
                />
              </div>
            </div>

            {/* Professional Information */}
            {(user.title || user.company || user.website) && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Informações Profissionais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {user.title && (
                      <InfoItem icon={IconBriefcase} label="Cargo" value={user.title} />
                    )}
                    {user.company && (
                      <InfoItem icon={IconUser} label="Empresa" value={user.company} />
                    )}
                    {user.website && (
                      <InfoItem
                        icon={IconWorld}
                        label="Website"
                        value={user.website}
                        isLink
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Social Media */}
            {(user.linkedin || user.twitter) && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Redes Sociais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {user.linkedin && (
                      <InfoItem
                        icon={IconBrandLinkedin}
                        label="LinkedIn"
                        value={user.linkedin}
                        isLink
                      />
                    )}
                    {user.twitter && (
                      <InfoItem
                        icon={IconBrandTwitter}
                        label="Twitter"
                        value={user.twitter}
                        isLink
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Stats (for instructors) */}
            {user.coursesCount > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Estatísticas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatItem label="Cursos" value={user.coursesCount} />
                    <StatItem label="Alunos" value={user.studentsCount} />
                    <StatItem label="Avaliações" value={user.reviewsCount} />
                    <StatItem
                      label="Nota"
                      value={user.rating ? user.rating.toFixed(1) : 'N/A'}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Account Information */}
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3">Informações da Conta</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem
                  icon={IconCalendar}
                  label="Membro desde"
                  value={formatDate(user.createdAt)}
                />
                <InfoItem
                  icon={IconClock}
                  label="Último acesso"
                  value={formatDateTime(user.lastLoginAt)}
                />
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Notificações por email</span>
                  <Badge variant={user.emailNotifications ? 'default' : 'secondary'}>
                    {user.emailNotifications ? 'Ativado' : 'Desativado'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Emails de marketing</span>
                  <Badge variant={user.marketingEmails ? 'default' : 'secondary'}>
                    {user.marketingEmails ? 'Ativado' : 'Desativado'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum usuário selecionado
          </div>
        )}

        {user && (
          <DialogFooter className="flex-row justify-between">
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                setDeleteModalOpen(true)
              }}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Excluir Usuário
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => {
                setEditModalOpen(true)
              }}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Editar Usuário
            </Button>
          </DialogFooter>
        )}
      </DialogContent>

      {/* Edit User Modal */}
      <EditUserModal
        userId={userId}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={() => {
          // Refresh user details after successful edit
          fetchUserDetails()
          onUserUpdated?.()
        }}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        userId={userId}
        userName={user?.fullName || user?.displayName || user?.email || null}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onSuccess={() => {
          // Close details modal and refresh parent
          onOpenChange(false)
          onUserUpdated?.()
        }}
      />
    </Dialog>
  )
}

// Helper Components
interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  isLink?: boolean
}

function InfoItem({ icon: Icon, label, value, isLink }: InfoItemProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink && value !== 'Não informado' ? (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline truncate block"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium truncate">{value}</p>
        )}
      </div>
    </div>
  )
}

interface StatItemProps {
  label: string
  value: number | string
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="text-center p-3 bg-muted rounded-lg">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
