'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const selectedInstructors = selectedIds
    .map((id) => instructors.find((instructor) => instructor.id === id))
    .filter((instructor): instructor is CourseInstructorOption => Boolean(instructor))

  const toggleInstructor = (instructorId: string) => {
    onChange(
      selectedIds.includes(instructorId)
        ? selectedIds.filter((id) => id !== instructorId)
        : [...selectedIds, instructorId],
    )
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="instructor"
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            className={cn('w-full justify-between font-normal', invalid && 'border-destructive')}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedIds.length === 0
                ? 'Selecione os instrutores'
                : `${selectedIds.length} ${selectedIds.length === 1 ? 'instrutor selecionado' : 'instrutores selecionados'}`}
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
                {instructors.map((instructor) => (
                  <CommandItem
                    key={instructor.id}
                    value={`${instructor.name} ${instructor.username || ''}`}
                    onSelect={() => toggleInstructor(instructor.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'size-4',
                        selectedIds.includes(instructor.id) ? 'opacity-100' : 'opacity-0',
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
        <div className="flex flex-wrap gap-2" aria-label="Instrutores selecionados">
          {selectedInstructors.map((instructor, index) => (
            <Badge key={instructor.id} variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1">
              <span>{instructor.name}{index === 0 ? ' (principal)' : ''}</span>
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
  )
}