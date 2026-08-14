export function renderTestEmailTemplate(params: { recipient: string; appUrl?: string }): string {
  const appUrl = params.appUrl || 'http://localhost:5173';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dastaan - Resend Email Integration Test</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .container { max-width: 600px; margin: 40px auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
    .header p { margin: 6px 0 0 0; font-size: 14px; color: #e0e7ff; }
    .content { padding: 32px; }
    .status-card { background-color: #0f172a; border-radius: 12px; padding: 20px; border: 1px solid #334155; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; background-color: #10b98120; color: #34d399; border: 1px solid #10b98140; margin-bottom: 12px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
    .info-label { color: #94a3b8; }
    .info-val { color: #f1f5f9; font-weight: 600; font-family: monospace; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; text-align: center; margin-top: 8px; }
    .footer { padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; background-color: #162032; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dastaan</h1>
      <p>AI Social Publishing Assistant</p>
    </div>
    <div class="content">
      <div class="status-card">
        <span class="badge">Integration Successful</span>
        <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #ffffff;">Resend Email Service is Connected!</h2>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #94a3b8; line-height: 1.5;">
          This test email confirms that transactional email delivery is configured and working properly with the official Resend SDK.
        </p>
        <div class="info-row">
          <span class="info-label">Recipient:</span>
          <span class="info-val">${escapeHtml(params.recipient)}</span>
        </div>
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Timestamp:</span>
          <span class="info-val">${new Date().toUTCString()}</span>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${appUrl}" class="btn" target="_blank">Open Dastaan App</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Dastaan. Built with NestJS & Resend.
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
