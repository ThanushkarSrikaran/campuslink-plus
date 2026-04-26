import nodemailer from "nodemailer";

export interface AppointmentConfirmationPayload {
  studentEmail: string;
  studentName: string;
  mentorEmail: string;
  mentorName: string;
  moduleCode: string;
  date: string;
  time: string;
  meetingLink: string;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(
  to: string,
  name: string,
  otp: string
) {
  await transporter.sendMail({
    from: `"CampusLink+" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Verify your CampusLink+ account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f0f0f; color: #ffffff; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #3b82f6; font-size: 28px; margin: 0;">🎓 CampusLink+</h1>
        </div>
        <h2 style="font-size: 20px; margin-bottom: 8px;">Hi ${name}! 👋</h2>
        <p style="color: #9ca3af; margin-bottom: 24px;">
          Thanks for registering. Use the OTP below to verify your email address.
        </p>
        <div style="background: #1f2937; border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px 0;">Your verification code</p>
          <p style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #3b82f6; margin: 0;">${otp}</p>
        </div>
        <p style="color: #9ca3af; font-size: 14px;">
          This code expires in <strong style="color: #ffffff;">10 minutes</strong>.
          If you did not register, please ignore this email.
        </p>
        <hr style="border: 1px solid #1f2937; margin: 24px 0;" />
        <p style="color: #4b5563; font-size: 12px; text-align: center;">
          CampusLink+ — Your University Resource Hub
        </p>
      </div>
    `,
  });
}

export async function sendAppointmentConfirmationEmail(p: AppointmentConfirmationPayload) {
  const buildHtml = (recipientName: string, role: "student" | "mentor") => `
    <div style="font-family:Arial,sans-serif;max-width:540px;margin:0 auto;background:#06020f;color:#fff;padding:40px;border-radius:16px;border:1px solid rgba(139,92,246,0.3);">
      <div style="text-align:center;margin-bottom:28px;">
        <h1 style="color:#a78bfa;font-size:26px;margin:0;">🎓 CampusLink+</h1>
        <p style="color:#4b5563;font-size:11px;font-family:monospace;letter-spacing:3px;margin:6px 0 0;">MISSION CONFIRMED</p>
      </div>

      <h2 style="font-size:20px;margin-bottom:8px;">Hi ${recipientName}! 🚀</h2>
      <p style="color:#9ca3af;margin-bottom:24px;">
        ${role === "student"
          ? `Your session request has been <strong style="color:#34d399;">accepted</strong> by <strong style="color:#fff;">${p.mentorName}</strong>. Your mission is a go!`
          : `You've confirmed a session with <strong style="color:#fff;">${p.studentName}</strong>. Both parties have been notified.`
        }
      </p>

      <div style="background:#12052a;border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:24px;margin-bottom:20px;">
        <p style="color:#7c3aed;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px;">// session_details</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid rgba(139,92,246,0.15);">
            <td style="color:#6b7280;font-size:13px;padding:8px 0;">Module</td>
            <td style="color:#fff;font-weight:bold;font-family:monospace;text-align:right;padding:8px 0;">${p.moduleCode}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(139,92,246,0.15);">
            <td style="color:#6b7280;font-size:13px;padding:8px 0;">${role === "student" ? "Mentor" : "Student"}</td>
            <td style="color:#fff;font-weight:bold;text-align:right;padding:8px 0;">${role === "student" ? p.mentorName : p.studentName}</td>
          </tr>
          <tr style="border-bottom:1px solid rgba(139,92,246,0.15);">
            <td style="color:#6b7280;font-size:13px;padding:8px 0;">Date</td>
            <td style="color:#a78bfa;font-weight:bold;text-align:right;padding:8px 0;">${p.date}</td>
          </tr>
          <tr>
            <td style="color:#6b7280;font-size:13px;padding:8px 0;">Time</td>
            <td style="color:#a78bfa;font-weight:bold;text-align:right;padding:8px 0;">${p.time}</td>
          </tr>
        </table>
      </div>

      <div style="background:#061a10;border:1px solid rgba(52,211,153,0.3);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <p style="color:#34d399;font-size:10px;font-family:monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 14px;">// google_meet_link</p>
        <a href="${p.meetingLink}"
           style="display:inline-block;background:linear-gradient(135deg,#059669,#10b981);color:#fff;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">
          🎥 Join Google Meet
        </a>
        <p style="color:#374151;font-size:11px;margin:12px 0 0;word-break:break-all;">${p.meetingLink}</p>
      </div>

      <p style="color:#374151;font-size:12px;text-align:center;margin:0;">
        Keep this link safe — it's your gateway to the session.<br/>
        CampusLink+ · University Mentorship Platform
      </p>
    </div>
  `;

  await Promise.all([
    transporter.sendMail({
      from: `"CampusLink+" <${process.env.GMAIL_USER}>`,
      to: p.studentEmail,
      subject: `✅ Session Confirmed — ${p.moduleCode} on ${p.date} at ${p.time}`,
      html: buildHtml(p.studentName, "student"),
    }),
    transporter.sendMail({
      from: `"CampusLink+" <${process.env.GMAIL_USER}>`,
      to: p.mentorEmail,
      subject: `✅ Session Confirmed — ${p.moduleCode} on ${p.date} at ${p.time}`,
      html: buildHtml(p.mentorName, "mentor"),
    }),
  ]);
}