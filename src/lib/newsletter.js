import { sendEmail } from './mailer';
import { Subscriber } from '@/models/Subscriber';
import dbConnect from './dbConnect';
import { generateNewsletterTemplate } from './emailTemplates';
import { SITE_URL } from './config';

export async function sendNewsletterEmail(type, data, isBulk = true) {
  const siteUrl = SITE_URL;
  
  let subject = '';
  switch (type) {
    case 'blog': subject = `[MUHYO] Intel: ${data.title}`; break;
    case 'service': subject = `[MUHYO] New Capability: ${data.title}`; break;
    case 'project': subject = `[MUHYO] Mission Success: ${data.title}`; break;
    case 'manual': subject = data.subject || '[MUHYO] Strategic Update'; break;
    case 'welcome': subject = 'Synchronized with MUHYO TECH Intelligence'; break;
    default: throw new Error('Invalid newsletter type');
  }

  const getFullTemplate = (email) => generateNewsletterTemplate({ type, data, email });

  if (isBulk) {
    await dbConnect();
    const activeSubscribers = await Subscriber.find({ 
      isActive: true
    });
    
    console.log(`[Newsletter] Found ${activeSubscribers.length} active subscribers for ${type} transmission.`);
    
    if (activeSubscribers.length === 0) {
      return { success: true, count: 0, message: "No active targets synchronized." };
    }
    
    // Batch sending to avoid spam issues
    const batchSize = 10;
    for (let i = 0; i < activeSubscribers.length; i += batchSize) {
      const batch = activeSubscribers.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (subscriber) => {
        await sendEmail({
          to: subscriber.email,
          subject,
          html: getFullTemplate(subscriber.email)
        });
        // Small delay between sends to be safe
        await new Promise(resolve => setTimeout(resolve, 100));
      }));
    }
    
    return { success: true, count: activeSubscribers.length };
  } else if (data.email) {
      // Single email (e.g. for testing)
      return await sendEmail({
        to: data.email,
        subject,
        html: getFullTemplate(data.email)
      });
  }
}
