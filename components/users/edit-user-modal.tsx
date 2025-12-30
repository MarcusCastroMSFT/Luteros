'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/ui/user-avatar'
import { IconLoader2 } from '@tabler/icons-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EditUserModalProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface UserFormData {
  fullName: string
  displayName: string
  bio: string
  phone: string
  dateOfBirth: string
  title: string
  company: string
  website: string
  linkedin: string
  twitter: string
  instagram: string
  emailNotifications: boolean
  marketingEmails: boolean
  role: string
}

const userRoles = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'INSTRUCTOR', label: 'Instrutor' },
  { value: 'STUDENT', label: 'Estudante' },
]

export function EditUserModal({ userId, open, onOpenChange, onSuccess }: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<string>('STUDENT')
  
  const { register, handleSubmit, reset, setValue, formState: { errors, isDirty } } = useForm<UserFormData>()

  useEffect(() => {
    if (open && userId) {
      fetchUserData()
    } else {
      reset()
      setError(null)
    }
  }, [userId, open])

  const fetchUserData = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/users/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }
      
      const data = await response.json()
      
      // Populate form with existing data
      const userRole = data.role || 'STUDENT'
      setRole(userRole)
      reset({
        fullName: data.fullName || '',
        displayName: data.displayName || '',
        bio: data.bio || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        title: data.title || '',
        company: data.company || '',
        website: data.website || '',
        linkedin: data.linkedin || '',
        twitter: data.twitter || '',
        instagram: data.instagram || '',
        emailNotifications: data.emailNotifications ?? true,
        marketingEmails: data.marketingEmails ?? false,
        role: userRole,
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: UserFormData) => {
    if (!userId) return

    setSaving(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update user')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating user:', error)
      setError(error instanceof Error ? error.message : 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Atualize as informações do perfil do usuário
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informações Pessoais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="Nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de Exibição</Label>
                  <Input
                    id="displayName"
                    {...register('displayName')}
                    placeholder="Como deseja ser chamado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <textarea
                  id="bio"
                  {...register('bio')}
                  placeholder="Conte um pouco sobre você..."
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Função do Usuário</h3>
              
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    setRole(value)
                    setValue('role', value, { shouldDirty: true })
                  }}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((roleOption) => (
                      <SelectItem key={roleOption.value} value={roleOption.value}>
                        {roleOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  A função determina as permissões e acessos do usuário na plataforma.
                </p>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Informações Profissionais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Cargo</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Seu cargo atual"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    {...register('company')}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    {...register('website')}
                    placeholder="https://seusite.com"
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Redes Sociais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    {...register('linkedin')}
                    placeholder="linkedin.com/in/seu-perfil"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    {...register('twitter')}
                    placeholder="@seu_usuario"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...register('instagram')}
                    placeholder="@seu_usuario"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Preferências</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    {...register('emailNotifications')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="emailNotifications" className="font-normal cursor-pointer">
                    Receber notificações por email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="marketingEmails"
                    {...register('marketingEmails')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="marketingEmails" className="font-normal cursor-pointer">
                    Receber emails de marketing
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer" disabled={saving || !isDirty}>
                {saving && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
