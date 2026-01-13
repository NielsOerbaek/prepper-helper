import { APP_URL } from "./resend";

function getAppName(language: "da" | "en"): string {
  return language === "da" ? "Prepperhjælper" : "Prepper Helper";
}

const baseStyles = `
  body {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #FAFAF8;
    color: #000000;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background-color: #FAFAF8;
    padding: 32px;
    border: 3px solid #000000;
    box-shadow: 6px 6px 0px 0px #000000;
  }
  .logo {
    text-align: center;
    margin-bottom: 24px;
  }
  .logo img {
    width: 64px;
    height: 64px;
    border: 2px solid #000000;
    box-shadow: 4px 4px 0px 0px #000000;
  }
  .logo-text {
    font-size: 24px;
    font-weight: bold;
    color: #000000;
    margin-top: 12px;
  }
  h1 {
    color: #000000;
    font-size: 24px;
    margin: 0 0 16px 0;
    text-align: center;
    font-weight: bold;
  }
  p {
    color: #000000;
    font-size: 16px;
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
  .highlight {
    color: #F97316;
    font-weight: 700;
  }
  .button {
    display: inline-block;
    background-color: #F97316;
    color: #000000 !important;
    text-decoration: none;
    padding: 14px 28px;
    font-weight: 700;
    font-size: 16px;
    margin: 24px 0;
    border: 3px solid #000000;
    box-shadow: 4px 4px 0px 0px #000000;
  }
  .button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px 0px #000000;
  }
  .button-container {
    text-align: center;
  }
  .footer {
    text-align: center;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 2px solid #000000;
  }
  .footer p {
    color: #666666;
    font-size: 14px;
    margin: 0;
  }
  .link {
    color: #F97316;
    text-decoration: none;
    font-weight: 600;
  }
  .expiry-note {
    background-color: #FEF3C7;
    border: 2px solid #000000;
    border-left: 6px solid #F97316;
    padding: 12px 16px;
    margin: 16px 0;
  }
  .expiry-note p {
    color: #000000;
    font-size: 14px;
    margin: 0;
  }
  ul {
    color: #000000;
    line-height: 1.8;
  }
`;

function emailLayout(content: string, language: "da" | "en"): string {
  const appName = getAppName(language);
  const footerText = language === "da"
    ? `Denne email blev sendt af ${appName}`
    : `This email was sent by ${appName}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <img src="${APP_URL}/icon.png" alt="${appName}" />
        <div class="logo-text">${appName}</div>
      </div>
      ${content}
    </div>
    <div class="footer">
      <p>${footerText}</p>
      <p><a href="${APP_URL}" class="link">${APP_URL}</a></p>
    </div>
  </div>
</body>
</html>
`;
}

export interface InvitationEmailData {
  stashName: string;
  inviterName: string;
  inviterEmail: string;
  invitationId: string;
  expiresAt: Date;
  language: "da" | "en";
}

export function invitationEmail(data: InvitationEmailData): { subject: string; html: string } {
  const { stashName, inviterName, inviterEmail, invitationId, expiresAt, language } = data;
  const appName = getAppName(language);
  const acceptUrl = `${APP_URL}/accept-invitation?id=${invitationId}`;
  const expiryDate = expiresAt.toLocaleDateString(language === "da" ? "da-DK" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (language === "da") {
    return {
      subject: `Du er blevet inviteret til "${stashName}" på ${appName}`,
      html: emailLayout(`
        <h1>Du er inviteret!</h1>
        <p><span class="highlight">${inviterName}</span> (${inviterEmail}) har inviteret dig til at deltage i deres forråd <span class="highlight">"${stashName}"</span> på ${appName}.</p>
        <p>Som medlem kan du se, tilføje og administrere varer i dette delte forråd.</p>
        <div class="button-container">
          <a href="${acceptUrl}" class="button">Accepter invitation</a>
        </div>
        <div class="expiry-note">
          <p>Denne invitation udløber den ${expiryDate}</p>
        </div>
        <p style="font-size: 14px; color: #666666;">Hvis du ikke forventede denne invitation, kan du ignorere denne email.</p>
      `, language),
    };
  }

  return {
    subject: `You've been invited to "${stashName}" on ${appName}`,
    html: emailLayout(`
      <h1>You're Invited!</h1>
      <p><span class="highlight">${inviterName}</span> (${inviterEmail}) has invited you to join their stash <span class="highlight">"${stashName}"</span> on ${appName}.</p>
      <p>As a member, you'll be able to view, add, and manage items in this shared stash.</p>
      <div class="button-container">
        <a href="${acceptUrl}" class="button">Accept Invitation</a>
      </div>
      <div class="expiry-note">
        <p>This invitation expires on ${expiryDate}</p>
      </div>
      <p style="font-size: 14px; color: #666666;">If you weren't expecting this invitation, you can safely ignore this email.</p>
    `, language),
  };
}

export interface PasswordResetEmailData {
  userName: string;
  resetToken: string;
  expiresAt: Date;
  language: "da" | "en";
}

export function passwordResetEmail(data: PasswordResetEmailData): { subject: string; html: string } {
  const { userName, resetToken, expiresAt, language } = data;
  const appName = getAppName(language);
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  const expiryTime = expiresAt.toLocaleTimeString(language === "da" ? "da-DK" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (language === "da") {
    return {
      subject: `Nulstil din adgangskode - ${appName}`,
      html: emailLayout(`
        <h1>Nulstil adgangskode</h1>
        <p>Hej <span class="highlight">${userName}</span>,</p>
        <p>Vi modtog en anmodning om at nulstille adgangskoden til din ${appName}-konto.</p>
        <div class="button-container">
          <a href="${resetUrl}" class="button">Nulstil adgangskode</a>
        </div>
        <div class="expiry-note">
          <p>Dette link udløber kl. ${expiryTime} (om 1 time)</p>
        </div>
        <p style="font-size: 14px; color: #666666;">Hvis du ikke anmodede om denne nulstilling, kan du ignorere denne email. Din adgangskode forbliver uændret.</p>
      `, language),
    };
  }

  return {
    subject: `Reset your password - ${appName}`,
    html: emailLayout(`
      <h1>Reset Password</h1>
      <p>Hi <span class="highlight">${userName}</span>,</p>
      <p>We received a request to reset the password for your ${appName} account.</p>
      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <div class="expiry-note">
        <p>This link expires at ${expiryTime} (in 1 hour)</p>
      </div>
      <p style="font-size: 14px; color: #666666;">If you didn't request this reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `, language),
  };
}

export interface WelcomeEmailData {
  userName: string;
  language: "da" | "en";
}

export function welcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  const { userName, language } = data;
  const appName = getAppName(language);

  if (language === "da") {
    return {
      subject: `Velkommen til ${appName}!`,
      html: emailLayout(`
        <h1>Velkommen!</h1>
        <p>Hej <span class="highlight">${userName}</span>,</p>
        <p>Tak fordi du tilmeldte dig ${appName}! Din konto er nu klar til brug.</p>
        <p>Med ${appName} kan du:</p>
        <ul style="color: #000000; line-height: 1.8;">
          <li>Holde styr på dit nødforråd</li>
          <li>Få advarsler når varer nærmer sig udløb</li>
          <li>Dele forråd med familie og venner</li>
          <li>Scanne produkter med AI-genkendelse</li>
        </ul>
        <div class="button-container">
          <a href="${APP_URL}" class="button">Kom i gang</a>
        </div>
      `, language),
    };
  }

  return {
    subject: `Welcome to ${appName}!`,
    html: emailLayout(`
      <h1>Welcome!</h1>
      <p>Hi <span class="highlight">${userName}</span>,</p>
      <p>Thank you for signing up for ${appName}! Your account is now ready to use.</p>
      <p>With ${appName} you can:</p>
      <ul style="color: #000000; line-height: 1.8;">
        <li>Keep track of your emergency supplies</li>
        <li>Get alerts when items are nearing expiration</li>
        <li>Share stashes with family and friends</li>
        <li>Scan products with AI recognition</li>
      </ul>
      <div class="button-container">
        <a href="${APP_URL}" class="button">Get Started</a>
      </div>
    `, language),
  };
}
