'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { replaceCoursePrimaryInstructor } from '@/lib/course-instructors'

export type CourseInstructorOption = {
  id: string
  name: string
  username?: string
}

type CourseInstructorSelectorProps = {
  instructors: CourseInstructorOption[]
  selectedIds: string[]
  onChange: (instructorIds: string[]) => void
  disabled?: boolean
  invalid?: boolean
}

export function CourseInstructorSelector({
  instructors,
  selectedIds,
  onChange,
  disabled = false,
  invalid = false,
}: CourseInstructorSelectorProps) {
  const [open, setOpen] = useState(false)
  const primaryInstructorId = selectedIds[0]
  const participantIds = selectedIds.slice(1)
  const availableParticipants = instructors.filter((instructor) => instructor.id !== primaryInstructorId)
  const selectedInstructors = participantIds
    .map((id) => instructors.find((instructor) => instructor.id === id))
    .filter((instructor): instructor is CourseInstructorOption => Boolean(instructor))

  const toggleInstructor = (instructorId: string) => {
    if (!primaryInstructorId || instructorId === primaryInstructorId) return
    onChange(
      participantIds.includes(instructorId)
        ? selectedIds.filter((id) => id !== instructorId)
        : [...selectedIds, instructorId],
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="instructor">
          Instrutor principal <span className="text-destructive">*</span>
        </Label>
        <Select
          value={primaryInstructorId || ''}
          onValueChange={(id) => onChange(replaceCoursePrimaryInstructor(selectedIds, id))}
          disabled={disabled}
        >
          <SelectTrigger id="instructor" className="w-full" aria-invalid={invalid}>
            <SelectValue placeholder="Selecione o instrutor principal" />
          </SelectTrigger>
          <SelectContent>
            {instructors.map((instructor) => (
              <SelectItem key={instructor.id} value={instructor.id}>
                {instructor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="special-participants">Participação especial</Label>
        <p id="special-participants-description" className="text-sm text-muted-foreground">
          Selecione outros instrutores para participar do curso. Opcional.
        </p>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="special-participants"
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-describedby="special-participants-description"
              className="w-full justify-between font-normal"
              disabled={disabled || !primaryInstructorId}
            >
              <span className="truncate">
                {participantIds.length === 0
                  ? 'Adicionar participação especial'
                  : `${participantIds.length} ${participantIds.length === 1 ? 'participante selecionado' : 'participantes selecionados'}`}
              </span>
              <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar instrutor..." />
              <CommandList>
                <CommandEmpty>Nenhum instrutor encontrado</CommandEmpty>
                <CommandGroup>
                  {availableParticipants.map((instructor) => (
                    <CommandItem
                      key={instructor.id}
                      value={`${instructor.name} ${instructor.username || ''}`}
                      onSelect={() => toggleInstructor(instructor.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'size-4',
                          participantIds.includes(instructor.id) ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{instructor.name}</span>
                      {instructor.username && (
                        <span className="truncate text-xs text-muted-foreground">
                          @{instructor.username}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedInstructors.length > 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Participações especiais selecionadas">
            {selectedInstructors.map((instructor) => (
              <Badge key={instructor.id} variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1">
                <span>{instructor.name}</span>
                <button
                  type="button"
                  onClick={() => toggleInstructor(instructor.id)}
                  className="rounded-sm p-0.5 hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Remover ${instructor.name}`}
                  title={`Remover ${instructor.name}`}
                  disabled={disabled}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}