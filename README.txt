ALVO CUSTOMS WEBSITE — SETUP

This is a rebuilt multi-page frontend using your existing Firebase project:
alvocustoms-c4952
Owner/admin: alvo.customs@gmail.com

FILES
index.html          Home page
products.html       Product collection + category filters
product.html        Product detail page + autoplay muted video
custom.html         Custom label enquiry form
projects.html       Inspiration / portfolio page
contact.html        Contact form
account.html        Google login + Mobile OTP + customer orders
admin.html          Owner-only product, video, orders and enquiries manager
app.js              Page logic and Firebase operations
rest.js             Existing Firebase project configuration and SDK imports
fx.js               Shared helpers
style.css           Responsive premium ivory / burgundy / muted gold design
FIREBASE_RULES.txt  Firestore and Storage security rules + Auth checklist

DEPLOY
1. Keep all files in the same root folder in your GitHub repository.
2. Upload/replace the site files in the existing Vercel-connected repository.
3. Do NOT create a new Firebase project.
4. Apply Firestore and Storage rules from FIREBASE_RULES.txt in Firebase Console.
5. Enable Google and Phone sign-in in Firebase Authentication.
6. Add your Vercel domain to Firebase Authentication authorized domains.

IMPORTANT
- Existing Firebase config values were carried forward from your earlier setup. Firebase web apiKey is a public client identifier, not an admin secret.
- Product collection used: products. Fields used: name, price, description, image, video, category, size, details, active.
- Orders collection used: orders. Enquiries collection used: enquiries.
- Existing old products with active=true remain visible. Admin must be signed into the owner Google account.
- Order submit creates an order request, not a payment or confirmed purchase. Payment gateway is not connected.
- The price is displayed as indicative unless your admin product details explicitly state exactly what GST/transport includes. Avoid claiming GST/transport included unless confirmed in your actual quotation.
- Product video autoplay is muted because mobile browsers generally block autoplay with sound.
- Firebase Phone OTP can be subject to Firebase project billing / SMS quotas / country restrictions.
- Test on a staging deployment or backup before replacing the live website. This rebuild cannot inspect or migrate undocumented legacy collection schemas automatically.
