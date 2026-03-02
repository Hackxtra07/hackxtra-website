import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, createErrorResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { recordAdminAction } from '@/lib/admin-logger';

/**
 * GET /api/certificate?name=...&achievement=...
 * Generates and streams a styled PDF certificate for the authenticated user.
 */
export async function GET(request: NextRequest) {
    try {
        const ip = getClientIp(request);
        if (rateLimit(ip, 'certificate', { limit: 10, windowMs: 60_000 })) {
            return createErrorResponse('Too many requests. Please wait a moment.', 429);
        }

        const auth = await authenticateRequest(request);
        if (!auth || auth.role !== 'admin') {
            return createErrorResponse('Unauthorized — Admin access required.', 401);
        }

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');

        if (!targetUserId) {
            return createErrorResponse('User ID is required', 400);
        }

        await connectDB();
        const user = await User.findById(targetUserId);
        if (!user) return createErrorResponse('User not found', 404);

        // Record admin action
        await recordAdminAction(
            request,
            auth,
            'GENERATE_CERTIFICATE',
            'User',
            targetUserId,
            { username: user.username, achievement: searchParams.get('achievement') }
        );

        // Send notification message if not already sent for this specific session/request
        const shouldNotify = searchParams.get('notify') === 'true';
        if (shouldNotify) {
            const { Message, Admin: AdminModel } = await import('@/lib/models');
            const currentAdmin = await AdminModel.findOne({ email: auth.email });

            if (currentAdmin) {
                await Message.create({
                    sender: currentAdmin._id,
                    senderModel: 'Admin',
                    recipient: user._id,
                    recipientModel: 'User',
                    content: `Congratulations! Your certificate for "${searchParams.get('achievement') || 'Cybersecurity Excellence'}" has been generated. Please contact the admin to receive your official copy.`,
                    isRead: false,
                    isSaved: false
                });
            }
        }

        const recipientName = searchParams.get('name')?.trim() || user.username;
        const achievement = searchParams.get('achievement')?.trim() || `Completing Cybersecurity Challenges with ${user.points} Points`;
        const issuedDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const certId = crypto.randomUUID().split('-')[0].toUpperCase();

        const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

        const pdfDoc = await PDFDocument.create();
        // A4 landscape: 841.89 × 595.28 pts
        const page = pdfDoc.addPage([841.89, 595.28]);
        const { width, height } = page.getSize();

        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

        // ── Background ─────────────────────────────────────────────────
        // Deep navy background
        page.drawRectangle({
            x: 0, y: 0,
            width, height,
            color: rgb(0.05, 0.07, 0.14),
        });

        // Inner card (slightly lighter)
        const margin = 30;
        page.drawRectangle({
            x: margin, y: margin,
            width: width - margin * 2,
            height: height - margin * 2,
            color: rgb(0.08, 0.10, 0.19),
            borderColor: rgb(0.33, 0.69, 0.99),
            borderWidth: 1.5,
            opacity: 0.95,
        });

        // Top accent bar
        page.drawRectangle({
            x: margin, y: height - margin - 8,
            width: width - margin * 2,
            height: 8,
            color: rgb(0.33, 0.69, 0.99),
        });

        // Bottom accent bar
        page.drawRectangle({
            x: margin, y: margin,
            width: width - margin * 2,
            height: 8,
            color: rgb(0.33, 0.69, 0.99),
        });

        // Corner decorations (small squares)
        const cornerSize = 12;
        const cornerColor = rgb(0.33, 0.69, 0.99);
        const corners = [
            { x: margin, y: height - margin - cornerSize },
            { x: width - margin - cornerSize, y: height - margin - cornerSize },
            { x: margin, y: margin },
            { x: width - margin - cornerSize, y: margin },
        ];
        for (const c of corners) {
            page.drawRectangle({ x: c.x, y: c.y, width: cornerSize, height: cornerSize, color: cornerColor, opacity: 0.4 });
        }

        // ── Logo ──────────────────────────────────────────────────────
        const logoSize = 20;
        page.drawText('HACK', {
            x: width / 2 - 68,
            y: height - 100,
            size: logoSize,
            font: helveticaBold,
            color: rgb(0.33, 0.69, 0.99),
        });
        page.drawText('XTRAS', {
            x: width / 2 - 10,
            y: height - 100,
            size: logoSize,
            font: helveticaBold,
            color: rgb(0.95, 0.95, 0.95),
        });

        // ── "Certificate of Achievement" ──────────────────────────────
        const titleText = 'CERTIFICATE OF ACHIEVEMENT';
        const titleSize = 28;
        const titleWidth = helveticaBold.widthOfTextAtSize(titleText, titleSize);
        page.drawText(titleText, {
            x: (width - titleWidth) / 2,
            y: height - 155,
            size: titleSize,
            font: helveticaBold,
            color: rgb(0.95, 0.95, 0.95),
        });

        // Divider line under title
        page.drawLine({
            start: { x: width / 2 - 180, y: height - 170 },
            end: { x: width / 2 + 180, y: height - 170 },
            thickness: 0.8,
            color: rgb(0.33, 0.69, 0.99),
            opacity: 0.6,
        });

        // ── "This certifies that" ─────────────────────────────────────
        const subText = 'This certifies that';
        const subSize = 14;
        const subWidth = timesRomanItalic.widthOfTextAtSize(subText, subSize);
        page.drawText(subText, {
            x: (width - subWidth) / 2,
            y: height - 205,
            size: subSize,
            font: timesRomanItalic,
            color: rgb(0.7, 0.75, 0.85),
        });

        // ── Recipient Name ────────────────────────────────────────────
        const nameSize = 36;
        const nameWidth = helveticaBold.widthOfTextAtSize(recipientName, nameSize);
        page.drawText(recipientName, {
            x: (width - nameWidth) / 2,
            y: height - 255,
            size: nameSize,
            font: helveticaBold,
            color: rgb(0.33, 0.69, 0.99),
        });

        // Name underline
        page.drawLine({
            start: { x: (width - nameWidth) / 2 - 20, y: height - 263 },
            end: { x: (width + nameWidth) / 2 + 20, y: height - 263 },
            thickness: 0.5,
            color: rgb(0.33, 0.69, 0.99),
            opacity: 0.4,
        });

        // ── "has successfully completed" ──────────────────────────────
        const completedText = 'has successfully completed';
        const completedWidth = timesRomanItalic.widthOfTextAtSize(completedText, subSize);
        page.drawText(completedText, {
            x: (width - completedWidth) / 2,
            y: height - 292,
            size: subSize,
            font: timesRomanItalic,
            color: rgb(0.7, 0.75, 0.85),
        });

        // ── Achievement ───────────────────────────────────────────────
        // Wrap long achievement text across multiple lines if needed
        const achSize = 16;
        const maxAchWidth = width - 200;
        const words = achievement.split(' ');
        const achLines: string[] = [];
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (helvetica.widthOfTextAtSize(testLine, achSize) > maxAchWidth) {
                achLines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) achLines.push(currentLine);

        let achY = height - 325;
        for (const line of achLines) {
            const lw = helvetica.widthOfTextAtSize(line, achSize);
            page.drawText(line, {
                x: (width - lw) / 2,
                y: achY,
                size: achSize,
                font: helvetica,
                color: rgb(0.95, 0.95, 0.95),
            });
            achY -= 24;
        }

        // ── Footer: Date, Cert ID, Signature area ─────────────────────
        const footerY = margin + 55;

        // Date
        page.drawText('Date of Issue', {
            x: margin + 60,
            y: footerY + 18,
            size: 9,
            font: helvetica,
            color: rgb(0.5, 0.55, 0.65),
        });
        page.drawText(issuedDate, {
            x: margin + 60,
            y: footerY,
            size: 11,
            font: helveticaBold,
            color: rgb(0.85, 0.88, 0.95),
        });

        // Cert ID
        const certIdLabel = `CERT ID: ${certId}`;
        const certIdWidth = helvetica.widthOfTextAtSize(certIdLabel, 9);
        page.drawText('Certificate ID', {
            x: (width - certIdWidth) / 2,
            y: footerY + 18,
            size: 9,
            font: helvetica,
            color: rgb(0.5, 0.55, 0.65),
        });
        page.drawText(certIdLabel, {
            x: (width - certIdWidth) / 2,
            y: footerY,
            size: 9,
            font: helvetica,
            color: rgb(0.5, 0.55, 0.65),
        });

        // Authorized signature side
        page.drawText('Authorized by', {
            x: width - margin - 160,
            y: footerY + 18,
            size: 9,
            font: helvetica,
            color: rgb(0.5, 0.55, 0.65),
        });
        page.drawText('HackXtras Team', {
            x: width - margin - 160,
            y: footerY,
            size: 11,
            font: helveticaBold,
            color: rgb(0.85, 0.88, 0.95),
        });

        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        const safeFilename = recipientName.replace(/[^a-z0-9_\- ]/gi, '_');
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${safeFilename}-certificate.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Certificate generation error:', error);
        return createErrorResponse('Failed to generate certificate', 500);
    }
}
