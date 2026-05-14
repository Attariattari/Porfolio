
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually load env for this script
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

async function checkSiteConfig() {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");
    
    // We need to define the schema manually or use the model if we can
    const SiteConfigSchema = new mongoose.Schema({
        superAdminEmail: String,
        adminName: String,
    }, { collection: 'siteconfigs' }); // Ensure collection name matches
    
    const SiteConfig = mongoose.models.SiteConfig || mongoose.model('SiteConfig', SiteConfigSchema);
    
    const config = await SiteConfig.findOne();
    console.log("Current SiteConfig in DB:");
    console.log(JSON.stringify(config, null, 2));
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

checkSiteConfig();
