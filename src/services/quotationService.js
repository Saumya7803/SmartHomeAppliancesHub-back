import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import { env } from "../config/env.js";

let cachedTransporter = null;
let cachedDeliveryMode = "json_transport";

function formatInr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function buildTransporter() {
  const hasSmtp =
    Boolean(env.mail.smtpHost) &&
    Number(env.mail.smtpPort) > 0 &&
    Boolean(env.mail.smtpUser) &&
    Boolean(env.mail.smtpPass);

  if (hasSmtp) {
    cachedDeliveryMode = "smtp";
    return nodemailer.createTransport({
      host: env.mail.smtpHost,
      port: Number(env.mail.smtpPort),
      secure: Boolean(env.mail.smtpSecure),
      auth: {
        user: env.mail.smtpUser,
        pass: env.mail.smtpPass,
      },
    });
  }

  cachedDeliveryMode = "json_transport";
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

function getTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = buildTransporter();
  }
  return cachedTransporter;
}

export function getEmailDeliveryMode() {
  if (!cachedTransporter) {
    getTransporter();
  }
  return cachedDeliveryMode;
}

export function buildQuotationSubject(quotation) {
  return `Quotation ${quotation.quotation_number} from SmartHome Automation`;
}

export function buildQuotationEmailText(quotation) {
  return [
    `Dear ${quotation.customer_name},`,
    "",
    "Please find your quotation details below:",
    `Quotation ID: ${quotation.quotation_number}`,
    `Product: ${quotation.product_name}`,
    `Quantity: ${quotation.quantity}`,
    `Unit Price: ${formatInr(quotation.unit_price)}`,
    `Discount: ${Number(quotation.discount_percent || 0).toFixed(2)}%`,
    `Total Amount: ${formatInr(quotation.total_amount)}`,
    `Valid Until: ${formatDate(quotation.valid_until)}`,
    "",
    "A PDF copy is attached.",
    "",
    "Regards,",
    "SmartHome Sales Team",
  ].join("\n");
}

export function buildQuotationEmailHtml(quotation) {
  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937;">
      <p>Dear ${quotation.customer_name},</p>
      <p>Please find your quotation details below:</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 560px;">
        <tbody>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Quotation ID</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${quotation.quotation_number}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Product</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${quotation.product_name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Quantity</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${quotation.quantity}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Unit Price</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formatInr(quotation.unit_price)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Discount</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${Number(quotation.discount_percent || 0).toFixed(2)}%</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Total Amount</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formatInr(quotation.total_amount)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #e5e7eb;">Valid Until</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${formatDate(quotation.valid_until)}</td></tr>
        </tbody>
      </table>
      <p>A PDF copy is attached.</p>
      <p>Regards,<br/>SmartHome Sales Team</p>
    </div>
  `;
}

export function buildQuotationPdfBuffer(quotation) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text("SmartHome Automation", { align: "left" });
    doc.fontSize(11).fillColor("#4b5563").text("Business Quotation");
    doc.moveDown();

    doc.fillColor("#111827").fontSize(12).text(`Quotation ID: ${quotation.quotation_number}`);
    doc.text(`Date: ${formatDate(quotation.created_at || new Date())}`);
    doc.text(`Valid Until: ${formatDate(quotation.valid_until)}`);
    doc.moveDown();

    doc.fontSize(12).text("Customer Details", { underline: true });
    doc.fontSize(11).text(`Name: ${quotation.customer_name}`);
    doc.text(`Email: ${quotation.customer_email}`);
    doc.text(`Phone: ${quotation.customer_phone || "-"}`);
    doc.moveDown();

    doc.fontSize(12).text("Product Details", { underline: true });
    doc.fontSize(11).text(`Product: ${quotation.product_name}`);
    doc.text(`Quantity: ${quotation.quantity}`);
    doc.text(`Unit Price: ${formatInr(quotation.unit_price)}`);
    doc.text(`Subtotal: ${formatInr(quotation.subtotal_amount)}`);
    doc.text(`Discount (${Number(quotation.discount_percent || 0).toFixed(2)}%): ${formatInr(quotation.discount_amount)}`);
    doc.fontSize(13).fillColor("#1d4ed8").text(`Total: ${formatInr(quotation.total_amount)}`);
    doc.fillColor("#111827");

    if (quotation.notes) {
      doc.moveDown();
      doc.fontSize(12).text("Notes", { underline: true });
      doc.fontSize(11).text(String(quotation.notes));
    }

    doc.moveDown();
    doc.fontSize(10).fillColor("#6b7280").text(
      "This quotation is system-generated and valid until the date shown above."
    );

    doc.end();
  });
}

export async function sendQuotationEmail({
  quotation,
  pdfBuffer,
  subject,
  customText = "",
  customHtml = "",
}) {
  const transporter = getTransporter();
  const safeSubject = subject || buildQuotationSubject(quotation);
  const defaultText = buildQuotationEmailText(quotation);
  const defaultHtml = buildQuotationEmailHtml(quotation);

  const info = await transporter.sendMail({
    from: `"${env.mail.fromName}" <${env.mail.fromEmail}>`,
    to: quotation.customer_email,
    replyTo: env.mail.replyTo || undefined,
    subject: safeSubject,
    text: customText || defaultText,
    html: customHtml || defaultHtml,
    attachments: [
      {
        filename: `${quotation.quotation_number}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return {
    messageId: info.messageId || null,
    deliveryMode: getEmailDeliveryMode(),
    preview: typeof info.message === "string" ? info.message : null,
    subject: safeSubject,
    bodyText: customText || defaultText,
  };
}
