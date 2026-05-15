// config/firebase.js
const admin = require('firebase-admin');

try {
  const serviceAccount = require('./defence-boarding-schools-firebase-adminsdk-dxkqq-0aa87f8454.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.warn("⚠️  Firebase Service Account Key not found. Firebase Admin features will be disabled.");
}

module.exports = admin;