export interface PostReadyEmailParams {
  userName?: string;
  postType: string;
  tone: string;
  hook: string;
  body: string;
  cta?: string;
  hashtags?: string[];
  mentions?: string[];
  appUrl?: string;
}

export function renderPostReadyTemplate(params: PostReadyEmailParams): string {
  const userName = escapeHtml(params.userName || 'Creator');
  const postType = escapeHtml(params.postType || 'POST');
  const tone = escapeHtml(params.tone || 'PROFESSIONAL');
  const hook = escapeHtml(params.hook || '');
  const body = formatBodyHtml(params.body || '');
  const cta = params.cta ? escapeHtml(params.cta) : '';
  const hashtags = Array.isArray(params.hashtags) ? params.hashtags.map(escapeHtml) : [];
  const mentions = Array.isArray(params.mentions) ? params.mentions.map(escapeHtml) : [];
  const appUrl = params.appUrl || 'http://localhost:5173';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Dastaan Post is Ready</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
    .container { max-width: 600px; margin: 40px auto; background-color: #111827; border-radius: 16px; border: 1px solid #1f2937; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; }
    .header p { margin: 6px 0 0 0; font-size: 14px; color: #e0e7ff; }
    .content { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #f9fafb; margin: 0 0 16px 0; }
    .intro { font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0; }
    .post-card { background-color: #1f2937; border-radius: 14px; padding: 24px; border: 1px solid #374151; margin-bottom: 28px; }
    .meta-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
    .pill { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .pill-type { background-color: #4f46e520; color: #818cf8; border: 1px solid #4f46e540; }
    .pill-tone { background-color: #8b5cf620; color: #a78bfa; border: 1px solid #8b5cf640; }
    .post-hook { font-size: 16px; font-weight: 700; color: #ffffff; line-height: 1.5; margin-bottom: 16px; }
    .post-body { font-size: 14px; color: #d1d5db; line-height: 1.7; margin-bottom: 16px; }
    .post-cta { font-size: 14px; font-weight: 600; color: #818cf8; line-height: 1.5; margin-bottom: 16px; }
    .tags { font-family: monospace; font-size: 13px; color: #60a5fa; margin-top: 12px; line-height: 1.6; }
    .mentions { font-family: monospace; font-size: 13px; color: #9ca3af; margin-top: 6px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 14px; text-align: center; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); }
    .footer { padding: 24px 32px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #1f2937; background-color: #0d121f; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dastaan</h1>
      <p>Your AI-Crafted Post Is Ready</p>
    </div>
    <div class="content">
      <h2 class="greeting">Hi ${userName},</h2>
      <p class="intro">
        Here is the latest version of your post generated with Dastaan. You can review the formatted content below or jump back into Dastaan to make edits and refine.
      </p>

      <div class="post-card">
        <div class="meta-bar">
          <span class="pill pill-type">${postType}</span>
          <span class="pill pill-tone">${tone}</span>
        </div>

        ${hook ? `<div class="post-hook">${hook}</div>` : ''}
        
        ${body ? `<div class="post-body">${body}</div>` : ''}

        ${cta ? `<div class="post-cta">${cta}</div>` : ''}

        ${hashtags.length > 0 ? `<div class="tags">${hashtags.join(' ')}</div>` : ''}

        ${mentions.length > 0 ? `<div class="mentions">${mentions.join(' ')}</div>` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${appUrl}" class="btn" target="_blank">Open in Dastaan Editor</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Dastaan - AI Content & Publishing Assistant.<br>
      This transactional email was sent to your registered account.
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

function formatBodyHtml(text: string): string {
  if (!text) return '';
  return escapeHtml(text).replace(/\r?\n/g, '<br />');
}
