ALVO CUSTOMS — FULL WEBSITE PACKAGE

WEBSITE FILES
- index.html: homepage and opening animation
- products.html: searchable product catalogue
- product.html: product details and box-wise WhatsApp order request
- editions.html: business, wedding, hospitality, events and institution editions
- custom.html: custom branding enquiry form
- projects.html: project gallery and video showcase
- about.html: brand information
- contact.html: contact form and contact details
- admin.html: owner dashboard
- privacy.html / terms.html: starter policy pages
- assets/: all CSS and JavaScript files
- FIRESTORE_RULES.txt / STORAGE_RULES.txt: Firebase rules

BEFORE DEPLOYMENT
1. Verify assets/firebase.js values against Firebase Console > Project settings.
2. Replace WHATSAPP_NUMBER = "91XXXXXXXXXX" with the real ALVO WhatsApp number (91 + 10 digits, digits only).
3. Enable Google provider in Firebase Authentication.
4. Add the deployed Vercel domain to Firebase Authentication > Settings > Authorized domains.
5. Create/enable Firestore Database and Storage.
6. Paste FIRESTORE_RULES.txt into Firestore > Rules and publish.
7. Paste STORAGE_RULES.txt into Storage > Rules and publish.
8. Upload every file and folder in this package to the ROOT of the GitHub repository connected to Vercel.
9. Open the deployed site and test all pages, product enquiry, custom enquiry and admin dashboard.

ADMIN
- Open /admin.html and sign in using alvo.customs@gmail.com.
- Add products with name, size, bottles per box, price per box, minimum boxes, image URL and active status.
- Public catalogue shows only products with active=true.
- Product media and project content can be managed from their dashboard tabs.
- Product image, project image, video and thumbnail are currently added using publicly accessible URLs. This build does not yet provide direct file upload from the admin panel.

ORDER FLOW
- No customer login or registration.
- Customer selects product, box quantity and enters contact/delivery details.
- Website calculates estimated total using price per box.
- Request details are saved to Firestore when rules permit, then WhatsApp opens with a prefilled message.
- Customer must press Send in WhatsApp.
- This is NOT a confirmed order. ALVO must confirm stock, final pricing, delivery and terms manually.

IMPORTANT LIMITATIONS / SECURITY
- This package is a complete first website build, but it has not been connected to or tested against your live Firebase/Vercel project.
- Existing Firestore collection names/data may differ. This code expects lowercase collections: products, orders, enquiries, media, projects.
- Public forms can be spammed. Add Firebase App Check / CAPTCHA and server-side validation before high-volume public launch.
- The rules restrict writes for catalogue/media/projects to the owner. Order and enquiry submissions are public by design; only owner can read them.
- Client-sent price is not payment proof. Verify all details manually.
- No payment gateway, delivery tracking, automated WhatsApp API, inventory system or direct admin file upload is included.
- Back up your existing website and Firebase rules before replacing anything.
- Privacy and Terms pages are starter text and should be reviewed for your real business practices.

This folder should be deployed as a whole; do not upload only selected files.
