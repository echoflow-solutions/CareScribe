import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST() {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    // Update participants with health conditions
    const updates = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        conditions: ['Autism Spectrum Disorder', 'Sensory Processing Disorder', 'Anxiety']
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        conditions: ['Type 2 Diabetes', 'High Blood Pressure']
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        conditions: ['Depression', 'Post-Traumatic Stress Disorder']
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        conditions: ['Down Syndrome', 'Diabetes', 'High Cholesterol']
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        conditions: ['Alzheimer\'s Disease', 'Hypertension', 'Arthritis']
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        conditions: ['Epilepsy', 'Depression', 'Iron Deficiency Anemia']
      }
    ]

    // Execute updates
    for (const update of updates) {
      const { error } = await supabase
        .from('participants')
        .update({ conditions: update.conditions })
        .eq('id', update.id)

      if (error) {
        console.error(`Error updating participant ${update.id}:`, error)
      }
    }

    return NextResponse.json({ success: true, message: 'Health conditions updated successfully' })
  } catch (error) {
    console.error('Error updating conditions:', error)
    return NextResponse.json({ error: 'Failed to update conditions' }, { status: 500 })
  }
}