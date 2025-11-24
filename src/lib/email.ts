import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Send email function
export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: 'Intentional <onboarding@resend.dev>', // Update with your verified domain
      to: [to],
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Daily check-in reminder
export async function sendDailyCheckInReminder(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 20px; margin-top: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌟 Time for Your Daily Check-In!</h1>
          </div>
          <div class="content">
            <p>Hi ${name}! 👋</p>
            <p>It's time to log your progress for today. Consistency is key to reaching your wellness goals!</p>
            <ul>
              <li>✅ Log your meals</li>
              <li>💧 Track your water intake</li>
              <li>📝 Update your journal</li>
              <li>😊 Record your mood</li>
            </ul>
            <a href="${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}" class="button">
              Go to Intentional
            </a>
          </div>
          <div class="footer">
            <p>You're doing great! Keep up the momentum.</p>
            <p><small>Manage your notification preferences in Settings</small></p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🌟 Daily Check-In Reminder - Intentional',
    html,
  });
}

// Weekly check-in reminder
export async function sendWeeklyCheckInReminder(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 20px; margin-top: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Check-In Time!</h1>
          </div>
          <div class="content">
            <p>Hi ${name}! 👋</p>
            <p>A week has passed - time to reflect on your progress and set new goals!</p>
            <p><strong>This week's focus:</strong></p>
            <ul>
              <li>⚖️ Log your weekly weigh-in</li>
              <li>📈 Review your progress</li>
              <li>🎯 Set goals for next week</li>
              <li>🏆 Celebrate your wins!</li>
            </ul>
            <a href="${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/weekly-checkin" class="button">
              Complete Weekly Check-In
            </a>
          </div>
          <div class="footer">
            <p>Every week is a fresh start. You've got this! 💪</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '📊 Weekly Check-In Reminder - Intentional',
    html,
  });
}

// Meal logging reminder
export async function sendMealReminderEmail(email: string, name: string, mealType: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 20px; margin-top: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Don't Forget to Log Your ${mealType}!</h1>
          </div>
          <div class="content">
            <p>Hi ${name}! 👋</p>
            <p>Quick reminder to log your ${mealType.toLowerCase()} to keep your nutrition tracking on point.</p>
            <p>📸 Take a quick photo and let our AI estimate the calories!</p>
            <a href="${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/log-meal" class="button">
              Log ${mealType}
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `🍽️ Time to log your ${mealType} - Intentional`,
    html,
  });
}

// Achievement unlocked email
export async function sendAchievementEmail(email: string, name: string, achievement: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 20px; margin-top: 20px; text-align: center; }
          .badge { font-size: 60px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Achievement Unlocked!</h1>
          </div>
          <div class="content">
            <div class="badge">🏆</div>
            <h2>${achievement}</h2>
            <p>Congratulations ${name}! You've earned a new achievement!</p>
            <p>Keep up the amazing work on your wellness journey!</p>
            <a href="${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/achievements" class="button">
              View All Achievements
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🎉 Achievement Unlocked! - Intentional',
    html,
  });
}

// Challenge invitation email
export async function sendChallengeInviteEmail(
  email: string,
  name: string,
  challengeName: string,
  inviterName: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 20px; margin-top: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💪 You've Been Challenged!</h1>
          </div>
          <div class="content">
            <p>Hi ${name}! 👋</p>
            <p><strong>${inviterName}</strong> has invited you to join the <strong>${challengeName}</strong> challenge!</p>
            <p>Join the community, stay accountable, and reach your goals together!</p>
            <a href="${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/community/challenges" class="button">
              Accept Challenge
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `💪 ${inviterName} challenged you to ${challengeName}!`,
    html,
  });
}
