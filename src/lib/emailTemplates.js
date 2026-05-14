import { SITE_URL } from "./config";

const BRAND_ACCENT = "#0ea5e9"; 
const BRAND_DARK = "#0a0f1c"; 
const BRAND_GRAY = "#64748b";
const BRAND_CARD_BG = "#ffffff";
const BRAND_BODY_BG = "#f1f5f9";

/**
 * Global Wrapper Template
 */
const GlobalLayout = ({ title, preheader, contentHtml, unsubscribeEmail = null }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
        
        body { 
            margin: 0; 
            padding: 0; 
            background-color: ${BRAND_BODY_BG}; 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        table { border-spacing: 0; }
        td { padding: 0; }
        img { border: 0; max-width: 100%; height: auto; display: block; }
        
        .wrapper { 
            width: 100%; 
            table-layout: fixed; 
            background-color: ${BRAND_BODY_BG}; 
            padding-bottom: 60px; 
            padding-top: 40px;
        }

        .main { 
            background-color: ${BRAND_CARD_BG}; 
            margin: 0 auto; 
            width: 100%; 
            max-width: 600px; 
            border-spacing: 0; 
            color: ${BRAND_DARK}; 
            border-radius: 24px; 
            overflow: hidden; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.05);
            border: 1px solid rgba(0,0,0,0.05);
        }

        .header { 
            background-color: ${BRAND_DARK}; 
            color: #ffffff; 
            padding: 40px 20px; 
            text-align: center; 
        }

        .logo { 
            font-size: 24px; 
            font-weight: 800; 
            letter-spacing: -0.05em; 
            text-transform: uppercase; 
            font-style: italic; 
        }
        .logo span { color: ${BRAND_ACCENT}; }

        .content { 
            padding: 48px 40px; 
        }

        .h1 { 
            font-size: 28px; 
            font-weight: 800; 
            margin: 0 0 24px 0; 
            letter-spacing: -0.03em; 
            color: ${BRAND_DARK};
            line-height: 1.2;
        }

        .p { 
            font-size: 16px; 
            line-height: 1.7; 
            color: #475569; 
            margin: 0 0 24px 0; 
        }

        .cta-button { 
            background-color: ${BRAND_ACCENT}; 
            color: #ffffff !important; 
            padding: 18px 36px; 
            text-decoration: none; 
            border-radius: 12px; 
            font-size: 14px; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: 0.1em; 
            display: inline-block;
            box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
        }

        .footer { 
            text-align: center; 
            padding: 40px 20px; 
            font-size: 12px; 
            color: #94a3b8; 
            line-height: 1.6;
        }
        
        .footer b { color: ${BRAND_DARK}; }

        .hero-img {
            width: 100%;
            height: auto;
            border-radius: 16px;
            margin-bottom: 32px;
            object-fit: cover;
        }

        .bullet-list {
            margin: 0 0 32px 0;
            padding: 0;
            list-style: none;
        }
        
        .bullet-item {
            margin-bottom: 12px;
            padding-left: 24px;
            position: relative;
            font-size: 15px;
            color: #475569;
        }

        .bullet-item::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: ${BRAND_ACCENT};
            font-weight: 800;
        }

        @media screen and (max-width: 600px) {
            .content { padding: 32px 24px; }
            .h1 { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">${preheader}</div>
    <div class="wrapper">
        <table class="main" align="center">
            <tr>
                <td class="header">
                    <div class="logo">MUHYO <span>TECH</span></div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    ${contentHtml}
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p><b>Muhyo Tech Intelligence Network</b></p>
                    <p>Innovating Digital Ecosystems with Precision.</p>
                    <p style="margin-top: 24px;">You are receiving this because you subscribed to updates at <a href="${SITE_URL}" style="color: ${BRAND_ACCENT}; text-decoration: none;">muhyo-tech.vercel.app</a></p>
                    ${unsubscribeEmail ? `
                        <p><a href="${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}" style="color: ${BRAND_ACCENT}; text-decoration: underline;">Unsubscribe from this list</a></p>
                    ` : ''}
                    <p style="margin-top: 32px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;">© ${new Date().getFullYear()} MUHYO TECH — ALL RIGHTS RESERVED</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
`;

/**
 * Generate Identity Template (Auth, Registration, Success)
 */
export const generateIdentityTemplate = ({ userName, type, actionData, ctaUrl }) => {
    let title = "";
    let preheader = "";
    let icon = "🛡️";
    let message = "";
    let ctaLabel = "Proceed to Muhyo Tech";
    let highlightBoxHtml = "";

    switch (type) {
        case "VERIFICATION":
            title = "Identity Challenge";
            preheader = "Verify your authority node to continue.";
            message = `Greetings <b>${userName}</b>. A security handshake has been initiated for your account. Please use the authority code below to verify your session.`;
            ctaLabel = "Verify Node";
            highlightBoxHtml = `
                <div style="background-color: #f8fafc; border: 2px dashed ${BRAND_ACCENT}; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: ${BRAND_GRAY}; margin-bottom: 8px;">AUTHORITY CODE</div>
                    <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.3em; color: ${BRAND_DARK};">${actionData.code}</div>
                    <div style="font-size: 11px; color: ${BRAND_GRAY}; margin-top: 8px;">Expired in 5 minutes. Use promptly.</div>
                </div>
            `;
            break;
            
        case "APPROVED":
            title = "Access Authorized";
            preheader = "Your administrative clearance has been granted.";
            message = `Welcome to the Muhyo Tech Control Center, <b>${userName}</b>. Your credentials have been validated and full administrative authority is now active.`;
            ctaLabel = "Mount Dashboard";
            highlightBoxHtml = `
                <div style="background-color: #f0fdf9; border: 1px solid #14b8a6; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
                    <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #134e4a; margin-bottom: 8px;">SECURE PASSKEY</div>
                    <div style="font-size: 20px; font-weight: 800; letter-spacing: 0.1em; color: #0f766e; font-family: monospace;">${actionData.passkey}</div>
                    <div style="font-size: 11px; color: #115e59; margin-top: 8px;">Save this record. Keys are not cached after initial deployment.</div>
                </div>
            `;
            break;

        case "DENIED":
            title = "Access Rejected";
            preheader = "Your request for authority has been declined.";
            message = `Greetings <b>${userName}</b>. Following a comprehensive review, your request for administrative authority has been declined by the Super Admin node.`;
            ctaLabel = "Retry Authorization";
            icon = "🚫";
            break;

        case "REMOVED":
            title = "Access Revoked";
            preheader = "Your account has been deleted from Muhyo Tech.";
            message = `Security Alert: Your administrative authority associated with <b>${userName}</b> has been revoked. All active sessions have been terminated.`;
            ctaLabel = "Contact Muhyo Tech Security";
            icon = "⚠️";
            break;
    }

    const contentHtml = `
        <div class="h1">${icon} ${title}</div>
        <p class="p">${message}</p>
        ${highlightBoxHtml}
        <div style="text-align: center;">
            <a href="${ctaUrl}" class="cta-button">${ctaLabel}</a>
        </div>
    `;

    return GlobalLayout({ title, preheader, contentHtml });
};

/**
 * Generate Booking Lifecycle Template
 */
export const generateBookingTemplate = ({ userName, status, service, date, time, meetingLink, rejectionReason, customMessage }) => {
    let title = "";
    let preheader = "";
    let icon = "🗓️";
    let message = "";
    let ctaLabel = "View Booking";
    let ctaUrl = `${SITE_URL}/projects`; // Generic funnel
    let detailsHtml = "";

    const serviceName = service ? service.replace(/-/g, " ").toUpperCase() : "CONSULTATION";

    switch (status) {
        case "confirmed":
            title = "Mission Confirmed";
            preheader = "Your strategy session has been scheduled.";
            icon = "✅";
            message = `Excellent, <b>${userName}</b>. Your strategy call regarding <b>${serviceName}</b> has been confirmed. We have calibrated our timeline for your session.`;
            ctaLabel = "Join Session";
            ctaUrl = meetingLink || "#";
            detailsHtml = `
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                    <div style="display: table; width: 100%;">
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding-bottom: 16px;">
                                <div style="font-size: 10px; font-weight: 800; color: ${BRAND_GRAY}; text-transform: uppercase;">DATE</div>
                                <div style="font-size: 16px; font-weight: 800;">${date}</div>
                            </div>
                            <div style="display: table-cell; padding-bottom: 16px;">
                                <div style="font-size: 10px; font-weight: 800; color: ${BRAND_GRAY}; text-transform: uppercase;">TIME</div>
                                <div style="font-size: 16px; font-weight: 800;">${time}</div>
                            </div>
                        </div>
                    </div>
                    <div style="font-size: 12px; color: ${BRAND_GRAY};">
                        Meeting sequence will initiate via the provided link at the scheduled time.
                    </div>
                </div>
            `;
            break;

        case "rejected":
            title = "Schedule Adjustment";
            preheader = "We are unable to proceed with your request.";
            icon = "ℹ️";
            message = `Greetings <b>${userName}</b>. Thank you for your interest in our solutions. Unfortunately, we cannot accommodate your request for <b>${serviceName}</b> at this time.`;
            if (rejectionReason) {
                detailsHtml = `<p class="p" style="font-style: italic; border-left: 4px solid #fca5a5; padding-left: 16px;">Reason: ${rejectionReason}</p>`;
            }
            ctaLabel = "Explore Archive";
            break;

        case "manual":
            title = "Booking Intelligence";
            preheader = "An update regarding your scheduled session.";
            message = customMessage || `Hello <b>${userName}</b>, we have an intelligence update regarding your booking for ${serviceName}.`;
            break;
            
        default: // Confirmation of request
            title = "Request Received";
            preheader = "We have logged your booking inquiry.";
            message = `Hi <b>${userName}</b>. Your strategy call request for <b>${serviceName}</b> has been logged in our system. A senior engineer will review the parameters and confirm within 24 hours.`;
            detailsHtml = `
                 <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: ${BRAND_DARK}; text-transform: uppercase;">Awaiting Validation By Admin Node</p>
                </div>
            `;
            break;
    }

    const contentHtml = `
        <div class="h1">${icon} ${title}</div>
        <p class="p">${message}</p>
        ${detailsHtml}
        <div style="text-align: center;">
            <a href="${ctaUrl}" class="cta-button">${ctaLabel}</a>
        </div>
    `;

    return GlobalLayout({ title, preheader, contentHtml });
};

/**
 * Generate Contact Reply Template
 */
export const generateContactReplyTemplate = ({ userName, originalMessage, adminReply, subject }) => {
    const title = "Direct Transmission";
    const preheader = "Response to your inquiry from Muhyo Tech Headquarters.";

    const contentHtml = `
        <div class="h1">💬 Response Received</div>
        <p class="p">Greetings <b>${userName}</b>. We have processed your inquiry regarding <b>"${subject || 'General Solutions'}"</b>. Our response has been detailed below.</p>
        
        <div style="background-color: #f1f5f9; border-left: 4px solid ${BRAND_ACCENT}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${BRAND_GRAY}; margin-bottom: 8px;">YOUR MESSAGE</div>
            <div style="font-size: 14px; color: ${BRAND_DARK};">${originalMessage}</div>
        </div>

        <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #0369a1; margin-bottom: 8px;">OFFICIAL RESPONSE</div>
            <div style="font-size: 16px; line-height: 1.6; color: ${BRAND_DARK}; font-weight: 600;">${adminReply}</div>
        </div>

        <p class="p" style="font-size: 14px; color: ${BRAND_GRAY}; text-align: center;">
            If you require further elaboration, please reply directly or mount a new inquiry.
        </p>
    `;

    return GlobalLayout({ title, preheader, contentHtml });
};

/**
 * Generate High-End Newsletter Template (Blog, Service, Project)
 */
export const generateNewsletterTemplate = ({ type, data, email }) => {
    const siteUrl = SITE_URL;
    let title = "";
    let subheader = "";
    let heroImage = data.image || data.imageUrl || data.coverImage || data.banner || data.thumbnail || data.icon || ""; 
    let contentHtml = "";
    let ctaLabel = "View Now";
    let ctaUrl = siteUrl;
    let preheader = "";

    switch (type) {
        case 'blog':
            title = data.title;
            preheader = data.summary || "New Intelligence report released.";
            ctaLabel = "Read Full Report";
            ctaUrl = data.slug ? `${siteUrl}/blog/${data.slug}` : `${siteUrl}/blog`;
            contentHtml = `
                <div class="h1">${title}</div>
                <p class="p">${data.summary || data.description || ""}</p>
                <div style="margin-top: 8px; font-size: 12px; font-weight: 800; color: ${BRAND_ACCENT}; text-transform: uppercase; letter-spacing: 0.1em;">Archive Entry | ${new Date().toLocaleDateString()}</div>
            `;
            break;

        case 'service':
            title = data.title;
            preheader = data.description || "Unlocking new digital capabilities.";
            ctaLabel = "Explore Capability";
            ctaUrl = data.slug ? `${siteUrl}/services/${data.slug}` : `${siteUrl}/services`;
            
            // Generate bullet points for services if detailed list exists
            const features = data.features || ["High Performance Implementation", "Bespoke Design Systems", "Scalable Infrastructure"];
            const bulletHtml = features.map(f => `<li class="bullet-item">${f}</li>`).join("");

            contentHtml = `
                <div style="font-size: 12px; font-weight: 800; color: ${BRAND_ACCENT}; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 12px;">New Capability Unlock</div>
                <div class="h1">${title}</div>
                <p class="p">${data.description || "Experience the next level of digital engineering with our expanded service catalog."}</p>
                <div style="margin: 32px 0;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${BRAND_DARK}; margin-bottom: 16px; letter-spacing: 0.05em;">Key Advantages:</div>
                    <ul class="bullet-list">
                        ${bulletHtml}
                    </ul>
                </div>
            `;
            break;

        case 'project':
            title = data.title;
            preheader = data.description || "Pushing the boundaries of innovation.";
            ctaLabel = "View Case Study";
            ctaUrl = data.slug ? `${siteUrl}/projects/${data.slug}` : `${siteUrl}/projects`;
            contentHtml = `
                <div style="font-size: 12px; font-weight: 800; color: ${BRAND_ACCENT}; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 12px;">Project Deployment Success</div>
                <div class="h1">${title}</div>
                <p class="p">${data.description || "We have successfully deployed a new high-fidelity digital project. Discover the methodology and results behind the build."}</p>
            `;
            break;

        case 'manual':
            title = data.subject || "Special Transmission";
            preheader = data.message || "Important update from Muhyo Tech.";
            ctaLabel = data.ctaText || "Take Action";
            ctaUrl = data.link || siteUrl;
            contentHtml = `
                <div class="h1">${title}</div>
                <div class="p" style="white-space: pre-wrap;">${data.message}</div>
            `;
            break;

        case 'welcome':
            title = "Muhyo Tech Connectivity Established";
            preheader = "You are now part of the Muhyo Tech Intelligence Network.";
            ctaLabel = "Explore Archive";
            ctaUrl = `${siteUrl}/blog`;
            contentHtml = `
                <div class="h1">Access Granted.</div>
                <p class="p">Welcome to the <b>Muhyo Tech Intelligence Network</b>. You have successfully synchronized with our transmission frequency.</p>
                <p class="p">Expect high-fidelity updates on software architecture, premium design systems, and digital strategy directly in your primary node.</p>
            `;
            break;
    }

    const fullContentHtml = `
        ${heroImage ? `<img src="${heroImage}" alt="${title}" class="hero-img">` : ''}
        ${contentHtml}
        <div style="text-align: center; margin-top: 40px;">
            <a href="${ctaUrl}" class="cta-button">${ctaLabel}</a>
        </div>
    `;

    return GlobalLayout({ 
        title: title, 
        preheader: preheader, 
        contentHtml: fullContentHtml, 
        unsubscribeEmail: email 
    });
};

// Legacy support alias
export const generateEmailTemplate = generateIdentityTemplate;
export const generateBookingActionEmail = generateBookingTemplate;
export const generateBookingConfirmationEmail = (data) => generateBookingTemplate({...data, status: 'request'});
export const generateContactReplyEmail = generateContactReplyTemplate;