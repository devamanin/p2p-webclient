import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyATTNNybwuqPITnjhQKYAPZFhUAChzJsv8',
  appId: '1:447644321546:web:c73f469d23145fb6745cf3',
  messagingSenderId: '447644321546',
  projectId: 'p2pconnect-98640',
  authDomain: 'p2pconnect-98640.firebaseapp.com',
  storageBucket: 'p2pconnect-98640.firebasestorage.app',
  measurementId: 'G-L2CEVX2TYD',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ]
};
