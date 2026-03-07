import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Admin, User, Session } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET mismatch in env');
}

export function signToken(email: string, sessionId?: string): string {
  return jwt.sign({ email, sessionId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { email: string, sessionId?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { email: string, sessionId?: string };
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

import { rateLimit, getClientIp, getRateLimitRetryAfter } from '@/lib/rate-limit';

export async function authenticateRequest(request: NextRequest): Promise<any | null> {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload || !payload.email) return null;

  try {
    await connectDB();
    const currentIp = getClientIp(request);
    const currentUserAgent = request.headers.get('user-agent') || 'unknown';

    // Verify session if sessionId is present
    if (payload.sessionId) {
      const session = await Session.findOne({
        sessionId: payload.sessionId,
        isValid: true
      });

      if (!session || session.expiresAt < new Date()) {
        return null;
      }

      // ── Device Footprint Check ──────────────────────────────────────────
      // This prevents session hijacking by mismatching IP or User-Agent
      // NOTE: We allow IP change if the User-Agent matches (for mobile switches),
      // but if BOTH change, we invalidate. Actually, for high security, 
      // we should be strict or at least log it.
      if (session.userAgent && session.userAgent !== currentUserAgent) {
        console.warn(`Session footprint mismatch: ${session.userAgent} !== ${currentUserAgent}`);
        return null; // Force re-login
      }

      const TWO_MINUTES_AGO = new Date(Date.now() - 2 * 60 * 1000);
      if (!session.lastActive || session.lastActive < TWO_MINUTES_AGO) {
        await Session.updateOne(
          { _id: session._id },
          { $set: { lastActive: new Date(), ipAddress: currentIp } }
        );
      }
    }

    // Check Admin first
    const admin = await Admin.findOne({ email: payload.email });
    if (admin) {
      return { ...admin.toObject(), role: 'admin', _id: admin._id, sessionId: payload.sessionId };
    }

    // Check User
    const user = await User.findOne({ email: payload.email });
    if (user) {
      return { ...user.toObject(), role: 'user', _id: user._id, sessionId: payload.sessionId };
    }

    return null;
  } catch (error) {
    console.error('Auth verification failed', error);
    return null;
  }
}

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}
