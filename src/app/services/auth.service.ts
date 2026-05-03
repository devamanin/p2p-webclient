import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User, deleteUser } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
  }

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    provider.addScope('https://www.googleapis.com/auth/user.gender.read');
    provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
    
    try {
      const result = await signInWithPopup(this.auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      return { user: result.user, token };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async deleteAccount() {
    try {
      if (this.auth.currentUser) {
        await deleteUser(this.auth.currentUser);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }
}
