importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);


const firebaseConfig = {
  apiKey: "AIzaSyDBWiHKQ3GCFKq3A-KSe1MQez_AXgnTcaA",
  authDomain: "qmcenter-6d747.firebaseapp.com",
  projectId: "qmcenter-6d747",
  storageBucket: "qmcenter-6d747.firebasestorage.app",
  messagingSenderId: "987885549368",
  appId: "1:987885549368:web:e2e7063e80757c2499b3cd",
  measurementId: "G-N2Z8W8R9KX",
};

firebase.initializeApp(firebaseConfig); 
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});