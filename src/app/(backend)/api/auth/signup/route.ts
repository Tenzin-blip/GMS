import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

// helper to send email
async function sendEmail(to: string, subject: string, text: string) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })

    await transporter.sendMail({
        from: `"Gym System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html: `<p>${text}</p>`,
    })
}

export async function POST(req: NextRequest) {
    try {
        const { name, phoneNumber, email, dob, gender, plan } = await req.json()

        if (!name || !email) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // Generate a temporary random password (user won't know this)
        const tempPassword = crypto.randomBytes(32).toString('hex')

        // Create new user in Payload with temporary password
        const payloadRes = await fetch(`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password: tempPassword, // Temporary password required by Payload auth
                phoneNumber: phoneNumber || '000-0000000',
                dob: dob || '2000-01-01',
                gender: gender || 'other',
                plan: plan || 'monthly',
                OTP: otp,
                role: 'user',
            }),
        })

        if (!payloadRes.ok) {
            const err = await payloadRes.json()
            console.error('Payload error:', err)
            return NextResponse.json({
                message: 'Payload error',
                error: err,
                details: err.errors || err.message
            }, { status: 500 })
        }

        const newUser = await payloadRes.json()
        console.log('New user created:', newUser)

        // Send OTP email
        await sendEmail(email, 'Your Verification Code', `Your OTP is: ${otp}`)

        return NextResponse.json({
            message: 'User created, OTP sent!',
            userId: newUser.doc?.id || newUser.id
        })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json(
            { message: 'Something went wrong', error: err.message },
            { status: 500 },
        )
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json({ message: 'GET endpoint' }, { status: 200 })
}