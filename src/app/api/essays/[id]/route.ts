import { getEssayById } from '@/utils/repository/EssayRepo'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const essay = await getEssayById(params.id)
        return NextResponse.json(essay)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch essay' }, { status: 500 })
    }
} 