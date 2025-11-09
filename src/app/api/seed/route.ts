import { NextResponse } from 'next/server'
import seedDatabase from '@/seed/seed-data'

export async function GET() {
  try {
    await seedDatabase()
    return NextResponse.json({ message: 'Seed completed successfully' })
  } catch (error) {
    console.error('Seed route error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}