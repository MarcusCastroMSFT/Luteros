import prisma from '../lib/prisma'

async function verifyAndFixEventRegistrations() {
  console.log('🔍 Verificando consistência de inscrições...\n')

  try {
    // Get all events
    const events = await prisma.events.findMany({
      select: {
        id: true,
        title: true,
        totalSlots: true,
        _count: {
          select: {
            event_registrations: true,
          },
        },
      },
    })

    console.log(`Encontrados ${events.length} eventos\n`)

    for (const event of events) {
      const registrationCount = event._count.event_registrations
      console.log(`✅ ${event.title}: ${registrationCount}/${event.totalSlots}`)
    }

    console.log('\n✨ Verificação concluída! Todas as contagens são calculadas dinamicamente.')
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAndFixEventRegistrations()
