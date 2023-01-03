
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

export const useAnalytics = ()=>{
  const firebaseConfig = {
    apiKey: 'AIzaSyA15UjL8TFIHLWUk-S83KeuLRC_D7hvwUU',
    authDomain: 'mises-official-site.firebaseapp.com',
    projectId: 'mises-official-site',
    storageBucket: 'mises-official-site.appspot.com',
    messagingSenderId: '235777024442',
    appId: '1:235777024442:web:da94196c84a941fab07d83',
    measurementId: 'G-Y5Y02HDCC8'
  }
  const app = initializeApp(firebaseConfig)
  const analytics = getAnalytics(app)
  return analytics
}