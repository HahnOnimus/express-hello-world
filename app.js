const { https } = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function flattenObject(ob) {
    const toReturn = {};
  
    for (const i in ob) {
      if (!Object.prototype.hasOwnProperty.call(ob, i)) continue;
  
      if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i])) {
        const flatObject = flattenObject(ob[i]);
        for (const x in flatObject) {
          if (!Object.prototype.hasOwnProperty.call(flatObject, x)) continue;
  
          toReturn[x] = flatObject[x];
        }
      } else {
        toReturn[i] = ob[i];
      }
    }
    return toReturn;
  }

exports.createServer = https.onRequest(async (req, res) => {
  if (req.method === 'POST') {
    const requestBody = flattenObject(req.body);
    try {    
      const docRefOne = await db.collection('webhook_collection_safe').add(requestBody);
      const docRefTwo = await db.collection('webhook_collection').add(requestBody);

      res.json({ 
        success: true, 
        collectionOneId: docRefOne.id,
        collectionTwoId: docRefTwo.id
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
});
