import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { userId, password } = await req.json()

        if (!userId || !password) {
            return NextResponse.json({ message: 'Missing userId or password' }, { status: 400 })
        }

        if (password.length < 8) {
            return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })
        }

        // Update user's password
        const updateRes = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: password,
            }),
        })

        if (!updateRes.ok) {
            const err = await updateRes.json()
            console.error('Error updating password:', err)
            return NextResponse.json({
                message: 'Failed to set password',
                error: err,
                details: err.errors || err.message
            }, { status: 500 })
        }

        const updatedUser = await updateRes.json()

        return NextResponse.json({
            message: 'Password set successfully!',
            userId: updatedUser.doc?.id || updatedUser.id,
        })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json(
            { message: 'Something went wrong', error: err.message },
            { status: 500 },
        )
    }
}