import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, createErrorResponse } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User, Certificate } from '@/lib/models';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { recordAdminAction } from '@/lib/admin-logger';
import crypto from 'node:crypto';

/**
 * GET /api/certificate?userId=...&achievement=...
 * Generates and streams a styled PDF certificate.
 */
export async function GET(request: NextRequest) {
    try {
        const ip = getClientIp(request);
        if (rateLimit(ip, 'certificate', { limit: 10, windowMs: 60_000 })) {
            return createErrorResponse('Too many requests. Please wait a moment.', 429);
        }

        const auth = await authenticateRequest(request);
        if (!auth) {
            return createErrorResponse('Unauthorized', 401);
        }

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');

        if (!targetUserId) {
            return createErrorResponse('User ID is required', 400);
        }

        // Allow if admin OR if it's the user's own ID
        const isSelf = auth.id === targetUserId;
        const isAdmin = auth.role === 'admin';

        if (!isAdmin && !isSelf) {
            return createErrorResponse('Unauthorized — You can only access your own credentials.', 403);
        }

        await connectDB();
        const user = await User.findById(targetUserId);
        if (!user) return createErrorResponse('User not found', 404);

        // Record admin action if it's an admin generating
        if (isAdmin && !isSelf) {
            await recordAdminAction(
                request,
                auth,
                'GENERATE_CERTIFICATE',
                'User',
                targetUserId,
                { username: user.username, achievement: searchParams.get('achievement') }
            );
        }



        const recipientName = searchParams.get('name')?.trim() || user.username;
        const achievement = searchParams.get('achievement')?.trim() || `Completing Cybersecurity Challenges with ${user.points} Points`;

        // Try to handle certificate persistence
        let certId = '';
        let issuedDate = '';

        const existingCert = await Certificate.findOne({ userId: user._id, achievement });

        if (existingCert) {
            certId = existingCert.certId;
            issuedDate = existingCert.issuedAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } else if (isAdmin) {
            // Only admin can create new certificate records
            certId = crypto.randomUUID().split('-')[0].toUpperCase();
            await Certificate.create({
                userId: user._id,
                recipientName,
                achievement,
                certId,
            });
            issuedDate = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } else {
            return createErrorResponse('No valid certificate found for this achievement. Ask an admin to generate one.', 404);
        }

        // ── Notification Logic ──
        const shouldNotifyUser = searchParams.get('notify') === 'true';
        if (shouldNotifyUser && isAdmin) {
            const { Message, Admin: AdminModel } = await import('@/lib/models');
            const currentAdmin = await AdminModel.findOne({ email: auth.email });

            if (currentAdmin) {
                await Message.create({
                    sender: currentAdmin._id,
                    senderModel: 'Admin',
                    recipient: user._id,
                    recipientModel: 'User',
                    content: `Congratulations! Your certificate for "${achievement}" has been generated. You can now download it directly from your Profile Achievements. [Download Link](/api/certificate?userId=${user._id}&achievement=${encodeURIComponent(achievement)})`,
                    isRead: false,
                    isSaved: false
                });
            }
        }

        const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([841.89, 595.28]);
        const { width, height } = page.getSize();

        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

        // ── Background & Styling ──
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.05, 0.07, 0.14) });

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

        // Corner accents
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

        // ── Logo & Title ──
        const logoSize = 18;
        page.drawText('HACK', { x: width / 2 - 60, y: height - 100, size: logoSize, font: helveticaBold, color: rgb(0.33, 0.69, 0.99) });
        page.drawText('XTRAS', { x: width / 2 - 10, y: height - 100, size: logoSize, font: helveticaBold, color: rgb(0.95, 0.95, 0.95) });

        const titleText = 'CERTIFICATE OF ACHIEVEMENT';
        const titleSize = 28;
        const titleWidth = helveticaBold.widthOfTextAtSize(titleText, titleSize);
        page.drawText(titleText, { x: (width - titleWidth) / 2, y: height - 155, size: titleSize, font: helveticaBold, color: rgb(0.95, 0.95, 0.95) });

        // Divider
        page.drawLine({ start: { x: width / 2 - 150, y: height - 170 }, end: { x: width / 2 + 150, y: height - 170 }, thickness: 0.8, color: rgb(0.33, 0.69, 0.99), opacity: 0.6 });

        // Content
        const subSize = 14;
        const certText = 'This certifies that';
        const certWidth = timesRomanItalic.widthOfTextAtSize(certText, subSize);
        page.drawText(certText, { x: (width - certWidth) / 2, y: height - 205, size: subSize, font: timesRomanItalic, color: rgb(0.7, 0.75, 0.85) });

        // Name
        const nameSize = 42;
        const nameWidth = helveticaBold.widthOfTextAtSize(recipientName, nameSize);
        page.drawText(recipientName, { x: (width - nameWidth) / 2, y: height - 260, size: nameSize, font: helveticaBold, color: rgb(0.33, 0.69, 0.99) });

        const compText = 'has successfully completed';
        const compWidth = timesRomanItalic.widthOfTextAtSize(compText, subSize);
        page.drawText(compText, { x: (width - compWidth) / 2, y: height - 295, size: subSize, font: timesRomanItalic, color: rgb(0.7, 0.75, 0.85) });

        // Achievement Text
        const achSize = 16;
        const maxAchWidth = width - 240;
        const words = achievement.split(' ');
        const lines: string[] = [];
        let curr = '';
        for (const w of words) {
            const test = curr ? `${curr} ${w}` : w;
            if (helvetica.widthOfTextAtSize(test, achSize) > maxAchWidth) { lines.push(curr); curr = w; }
            else curr = test;
        }
        if (curr) lines.push(curr);

        let achY = height - 330;
        for (const l of lines) {
            const lw = helvetica.widthOfTextAtSize(l, achSize);
            page.drawText(l, { x: (width - lw) / 2, y: achY, size: achSize, font: helvetica, color: rgb(0.95, 0.95, 0.95) });
            achY -= 24;
        }

        // ── Unique Signature Area ──
        const footerY = margin + 50;
        const sigX = width - margin - 200;

        // "Authorized by" label
        page.drawText('Authorized by', {
            x: sigX,
            y: footerY + 65,
            size: 8,
            font: helvetica,
            color: rgb(0.5, 0.55, 0.65),
            opacity: 0.8
        });

        // Stylized handwritten signature
        page.drawText('HackXtras Command', {
            x: sigX,
            y: footerY + 40,
            size: 22,
            font: timesRomanItalic,
            color: rgb(0.33, 0.69, 0.99)
        });

        // Cryptographic unique signature (The "Magic" part)
        const uniqueSig = `SIGN_VERIFIED_${crypto.createHash('md5').update(certId + user._id).digest('hex').substring(0, 16).toUpperCase()}`;
        page.drawText(uniqueSig, {
            x: sigX,
            y: footerY + 25,
            size: 7,
            font: helvetica,
            color: rgb(0.33, 0.69, 0.99),
            opacity: 0.5
        });

        // Underline for signature
        page.drawLine({
            start: { x: sigX, y: footerY + 35 },
            end: { x: width - margin - 40, y: footerY + 35 },
            thickness: 0.5,
            color: rgb(0.33, 0.69, 0.99),
            opacity: 0.3
        });

        // ── Secondary Info ──
        // Date
        page.drawText('Date of Issue', { x: margin + 60, y: footerY + 18, size: 9, font: helvetica, color: rgb(0.5, 0.55, 0.65) });
        page.drawText(issuedDate, { x: margin + 60, y: footerY, size: 11, font: helveticaBold, color: rgb(0.85, 0.88, 0.95) });

        // Cert ID
        const cidLabel = `CERT ID: ${certId}`;
        const cidWidth = helvetica.widthOfTextAtSize(cidLabel, 9);
        page.drawText('Zero-Trust ID', { x: (width - cidWidth) / 2, y: footerY + 18, size: 9, font: helvetica, color: rgb(0.5, 0.55, 0.65) });
        page.drawText(cidLabel, { x: (width - cidWidth) / 2, y: footerY, size: 9, font: helvetica, color: rgb(0.5, 0.55, 0.65) });

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
        return createErrorResponse('Failed to generate credential', 500);
    }
}
