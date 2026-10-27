# Muhyo Tech — Zero-Risk Structured Media Backup & Migration Registry

## 📂 Folder Structure
Har image ko uski asli Entity, Database **_id**, aur **Slug/Title** ke sath organize kiya gaya hai:

- **`blogs/[_id]__[slug]/`**:
  - `cover__[original_name].png`: Har blog ki exact cover image.
  - `info.json`: Blog ka title, ID, slug aur original Cloudinary URL.
- **`projects/[_id]__[slug]/`**:
  - `thumbnail__[name].png`: Project ka main thumbnail.
  - `gallery_01__[name].png` ... `gallery_15__[name].png`: Har project ke specific screenshots.
  - `info.json`: Project ID, Title aur Gallery details.
- **`services/[_id]__[slug]/`**:
  - Har service ka banner / icon aur info.json.
- **`heros/[_id]/`**:
  - Home page hero banner aur visual graphics.
- **`static_code_assets/`**:
  - Codebase files (`src/lib/data.js`, `BlogPostDetail.jsx`) mein hardcoded images.
- **`about/`**:
  - `about-portrait-new.jpg`: About page par founder ki main picture (178 KB).
  - `about-preview.png`: About page ka social preview / OpenGraph banner (720 KB).
  - `info.json`: Details explaining why it is stored locally in `public/` and never was on Cloudinary.
- **`migration_registry.json`**:
  - Tamam 174 Cloudinary assets ka 100% cryptographic 1-to-1 database mapping registry.

---

## 🛡️ Zero-Risk Guarantee (Kese Kaam Karta Hai?)
Jab naya Cloudinary account connect hoga:
1. Koi insan haath se images ko copy-paste **nahi** karega.
2. Script `migration_registry.json` se har image ko naye Cloudinary account par upload karega.
3. Naya URL milte hi script direct MongoDB query chalayega:
   ```javascript
   await db.collection(item.collection).updateOne(
     { _id: new ObjectId(item.documentId) },
     { $set: { [item.field]: newSecureUrl } }
   );
   ```
4. Choonke update **Database `_id`** match karke hota hai, is liye **0% chance** hai ke Blog A ki picture Blog B par jaye ya Home ki About par!
