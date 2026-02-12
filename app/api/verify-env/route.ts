import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS_LEN: process.env.SMTP_PASS?.length || 0,
        SMTP_HOST: process.env.SMTP_HOST
    });
}
