import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jsPDF from 'jspdf';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      company,
      projectNotes,
      packageTitle,
      packagePrice,
      service,
      invoiceId,
      date,
    } = body;

    const senderEmail = process.env.EMAIL_USER?.trim() || '';
    const senderPass = process.env.EMAIL_PASS?.replace(/\s+/g, '') || '';
    const ownerEmail = (process.env.OWNER_EMAIL || senderEmail).trim();
    const clientEmail = email?.trim();

    if (!clientEmail) {
      return NextResponse.json({ success: false, message: 'Client email is required' }, { status: 400 });
    }

    // --- 1. In-Memory PDF Receipt Generation ---
    const doc = new jsPDF();

    doc.setFillColor(6, 3, 10);
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('OFFICIAL INVOICE & RECEIPT', 20, 24);

    doc.setFontSize(9);
    doc.setTextColor(192, 132, 252);
    doc.text(`INVOICE: ${invoiceId}`, 20, 34);
    doc.text(
      `DATE: ${new Date(date || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
      145,
      34
    );

    doc.setTextColor(20, 20, 20);
    doc.setFontSize(13);
    doc.text('Client Information', 20, 60);

    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text(`Client Name: ${fullName}`, 20, 70);
    doc.text(`Email Address: ${clientEmail}`, 20, 78);
    doc.text(`Contact: ${phone}`, 20, 86);
    doc.text(`Brand / Studio: ${company || 'Direct Client'}`, 20, 94);

    if (projectNotes) {
      doc.text(`Project Brief: ${projectNotes.slice(0, 80)}`, 20, 102);
    }

    doc.setFillColor(243, 232, 255);
    doc.rect(20, 112, 170, 10, 'F');
    doc.setTextColor(88, 28, 135);
    doc.setFontSize(10);
    doc.text('Package Description', 25, 119);
    doc.text('Service Track', 105, 119);
    doc.text('Amount Paid', 155, 119);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text(packageTitle, 25, 132);
    doc.text(service, 105, 132);
    doc.text(packagePrice, 155, 132);

    doc.setDrawColor(220, 220, 220);
    doc.line(20, 142, 190, 142);

    doc.setFontSize(13);
    doc.setTextColor(6, 3, 10);
    doc.text(`Total Paid: ${packagePrice}`, 140, 157);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('Production pipeline has been initialized.', 20, 185);
    doc.text('All video revisions and raw access credits are active immediately.', 20, 192);

    const pdfBase64 = doc.output('datauristring').split(',')[1];

    // --- 2. Transporter Config ---
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: senderEmail,
        pass: senderPass,
      },
    });

    // --- 3. Client Confirmation Email ---
    const clientMailOptions = {
      from: `"Digitalix Studio" <${senderEmail}>`,
      replyTo: senderEmail,
      to: clientEmail,
      subject: `Subscription Confirmed: ${packageTitle} [${invoiceId}]`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #06030a; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto;">
          <h1 style="color: #c084fc; font-size: 22px; margin-bottom: 8px;">Subscription Confirmed!</h1>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Hi <strong>${fullName}</strong>,<br><br>
            Thank you for subscribing! We have received your order for <strong>${packageTitle}</strong> (${packagePrice}).
          </p>

          <div style="background-color: #120723; border: 1px solid #581c87; padding: 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Invoice:</strong> <span style="color: #c084fc;">${invoiceId}</span></p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Service Track:</strong> ${service}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Amount:</strong> <span style="color: #34d399;">${packagePrice}</span></p>
          </div>

          <p style="color: #94a3b8; font-size: 12px;">
            Attached is your official payment receipt PDF for your accounting records.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Receipt-${invoiceId}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    };

    // --- 4. Owner Lead Notification Email ---
    const ownerMailOptions = {
      from: `"Studio System" <${senderEmail}>`,
      to: ownerEmail,
      subject: `🚨 NEW ORDER: ${packageTitle} by ${fullName} (${packagePrice})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0d071a; color: #ffffff; padding: 25px; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #a855f7; border-bottom: 2px solid #3b0764; padding-bottom: 10px;">New Subscription Received!</h2>
          <p><strong>Invoice ID:</strong> ${invoiceId}</p>
          <p><strong>Amount:</strong> <span style="color: #4ade80; font-size: 16px; font-weight: bold;">${packagePrice}</span></p>
          <hr style="border-color: #3b0764;" />
          <h3 style="color: #e9d5ff;">Client Specs:</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Client Email:</strong> ${clientEmail}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Brand / Channel:</strong> ${company || 'N/A'}</p>
          <p><strong>Footage / Notes:</strong> ${projectNotes || 'None'}</p>
          <hr style="border-color: #3b0764;" />
          <p><strong>Package:</strong> ${packageTitle} (${service})</p>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceId}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    };

    await Promise.all([
      transporter.sendMail(clientMailOptions),
      transporter.sendMail(ownerMailOptions),
    ]);

    return NextResponse.json({
      success: true,
      invoiceId,
      message: 'Payment recorded and emails dispatched.',
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}