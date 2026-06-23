/**
 * Sends a notification email when an issue's status is updated.
 * Automatically falls back to console logging if RESEND_API_KEY is not configured.
 */
export async function sendStatusChangeEmail(toEmail, toName, issueTitle, oldStatus, newStatus) {
  const apiKey = process.env.RESEND_API_KEY;
  const subject = `[CivicBridge] Report Update: ${issueTitle}`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">CivicBridge Update</h2>
      <p>Hi <strong>${toName}</strong>,</p>
      <p>The status of your reported issue "<strong>${issueTitle}</strong>" has been updated:</p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px;">Old Status: <span style="text-decoration: line-through; color: #6b7280;">${oldStatus}</span></p>
        <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #10b981;">New Status: ${newStatus}</p>
      </div>
      <p>Thank you for helping improve our community!</p>
      <hr style="border: 0; border-top: 1px border #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">This is an automated notification from CivicBridge.</p>
    </div>
  `;

  if (!apiKey) {
    console.log("\n=======================================================");
    console.log(`📬 [EMAIL SIMULATION]`);
    console.log(`TO: ${toEmail} (${toName})`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`STATUS CHANGED: ${oldStatus} ➡️ ${newStatus}`);
    console.log(`=======================================================\n`);
    return { simulated: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: "CivicBridge <onboarding@resend.dev>",
      to: toEmail,
      subject,
      html: htmlContent,
    });
    return result;
  } catch (err) {
    console.error("Resend email delivery failed:", err);
    return null;
  }
}
export async function sendAssigneeEmail(toEmail, toName, issueTitle, assigneeName, department) {
  const apiKey = process.env.RESEND_API_KEY;
  const subject = `[CivicBridge] Report Assigned: ${issueTitle}`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">CivicBridge Update</h2>
      <p>Hi <strong>${toName}</strong>,</p>
      <p>Your reported issue "<strong>${issueTitle}</strong>" has been assigned to a department:</p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #2563eb; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px;">Department: <strong>${department || "General"}</strong></p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Assigned Official: <strong>${assigneeName}</strong></p>
      </div>
      <p>The team will post updates as resolution progresses.</p>
      <hr style="border: 0; border-top: 1px border #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">This is an automated notification from CivicBridge.</p>
    </div>
  `;

  if (!apiKey) {
    console.log("\n=======================================================");
    console.log(`📬 [EMAIL SIMULATION]`);
    console.log(`TO: ${toEmail} (${toName})`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`ASSIGNED: ${assigneeName} (${department || "General"})`);
    console.log(`=======================================================\n`);
    return { simulated: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: "CivicBridge <onboarding@resend.dev>",
      to: toEmail,
      subject,
      html: htmlContent,
    });
    return result;
  } catch (err) {
    console.error("Resend email delivery failed:", err);
    return null;
  }
}
