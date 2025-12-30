import prisma from '../lib/prisma'

async function verifyAndFixEventRegistrations() {
  console.log('🔍 Verificando consistência de inscrições...\n')

  try {
    // Get all events
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        bookedSlots: true,
        totalSlots: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    })

    console.log(`Encontrados ${events.length} eventos\n`)

    let inconsistenciesFound = 0
    const fixes: { eventId: string; title: string; oldValue: number; newValue: number }[] = []

    for (const event of events) {
      const actualCount = event._count.registrations
      const storedCount = event.bookedSlots

      if (actualCount !== storedCount) {
        inconsistenciesFound++
        console.log(`❌ INCONSISTÊNCIA ENCONTRADA:`)
        console.log(`   Evento: ${event.title}`)
        console.log(`   bookedSlots no DB: ${storedCount}`)
        console.log(`   Registros reais: ${actualCount}`)
        console.log(`   Limite total: ${event.totalSlots}`)
        console.log('')

        fixes.push({
          eventId: event.id,
          title: event.title,
          oldValue: storedCount,
          newValue: actualCount,
        })
      } else {
        console.log(`✅ ${event.title}: ${actualCount}/${event.totalSlots} (correto)`)
      }
    }

    if (inconsistenciesFound > 0) {
      console.log(`\n🔧 Corrigindo ${inconsistenciesFound} inconsistências...\n`)

      for (const fix of fixes) {
        await prisma.event.update({
          where: { id: fix.eventId },
          data: { bookedSlots: fix.newValue },
        })
        console.log(`✅ Corrigido: ${fix.title} (${fix.oldValue} → ${fix.newValue})`)
      }

      console.log('\n✨ Todas as inconsistências foram corrigidas!')
    } else {
      console.log('\n✨ Nenhuma inconsistência encontrada! Tudo está correto.')
    }
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAndFixEventRegistrations()
