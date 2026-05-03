import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {
  private _nameSubject = new BehaviorSubject<string>(localStorage.getItem('name') || 'User');
  private _targetGenderSubject = new BehaviorSubject<string>(localStorage.getItem('targetGender') || 'Any Gender');
  private _myGenderSubject = new BehaviorSubject<string>(localStorage.getItem('myGender') || 'Male');
  private _ageSubject = new BehaviorSubject<number>(parseInt(localStorage.getItem('age') || '18'));
  private _coinsSubject = new BehaviorSubject<number>(parseInt(localStorage.getItem('coins') || '200'));
  private _detectedLocationSubject = new BehaviorSubject<string>(localStorage.getItem('detectedLocation') || 'Global');
  private _interestsSubject = new BehaviorSubject<string[]>(JSON.parse(localStorage.getItem('interests') || '["Gaming", "Movies", "Fitness"]'));
  private _locationsSubject = new BehaviorSubject<string[]>(JSON.parse(localStorage.getItem('locations') || '["Global"]'));
  
  private getInitialProfilePic(): string | null {
    const p = localStorage.getItem('profilePicture');
    return (p === 'null' || p === 'undefined' || !p) ? null : p;
  }
  private _profilePictureSubject = new BehaviorSubject<string | null>(this.getInitialProfilePic());

  public name$ = this._nameSubject.asObservable();
  public targetGender$ = this._targetGenderSubject.asObservable();
  public myGender$ = this._myGenderSubject.asObservable();
  public age$ = this._ageSubject.asObservable();
  public coins$ = this._coinsSubject.asObservable();
  public detectedLocation$ = this._detectedLocationSubject.asObservable();
  public interests$ = this._interestsSubject.asObservable();
  public locations$ = this._locationsSubject.asObservable();
  public profilePicture$ = this._profilePictureSubject.asObservable();

  get name() { return this._nameSubject.value; }
  get targetGender() { return this._targetGenderSubject.value; }
  get myGender() { return this._myGenderSubject.value; }
  get age() { return this._ageSubject.value; }
  get coins() { return this._coinsSubject.value; }
  get detectedLocation() { return this._detectedLocationSubject.value; }
  get interests() { return this._interestsSubject.value; }
  get locations() { return this._locationsSubject.value; }
  get profilePicture() { return this._profilePictureSubject.value; }

  setName(value: string) {
    this._nameSubject.next(value);
    localStorage.setItem('name', value);
  }

  setTargetGender(value: string) {
    this._targetGenderSubject.next(value);
    localStorage.setItem('targetGender', value);
  }

  setMyGender(value: string) {
    this._myGenderSubject.next(value);
    localStorage.setItem('myGender', value);
  }

  setAge(value: number | string) {
    let numericValue: number;
    if (typeof value === 'string') {
      numericValue = parseInt(value, 10);
    } else {
      numericValue = value;
    }

    if (!isNaN(numericValue)) {
      this._ageSubject.next(numericValue);
      localStorage.setItem('age', numericValue.toString());
    }
  }

  addCoins(amount: number) {
    const newVal = this.coins + amount;
    this._coinsSubject.next(newVal);
    localStorage.setItem('coins', newVal.toString());
  }

  spendCoins(amount: number): boolean {
    if (this.coins >= amount) {
      const newVal = this.coins - amount;
      this._coinsSubject.next(newVal);
      localStorage.setItem('coins', newVal.toString());
      return true;
    }
    return false;
  }

  setDetectedLocation(value: string) {
    this._detectedLocationSubject.next(value);
    localStorage.setItem('detectedLocation', value);
  }

  setInterests(value: string[]) {
    this._interestsSubject.next(value);
    localStorage.setItem('interests', JSON.stringify(value));
  }

  setLocations(value: string[]) {
    this._locationsSubject.next(value);
    localStorage.setItem('locations', JSON.stringify(value));
  }

  setProfilePicture(value: string | null) {
    if (value) {
      this._profilePictureSubject.next(value);
      localStorage.setItem('profilePicture', value);
    } else {
      this._profilePictureSubject.next(null);
      localStorage.removeItem('profilePicture');
    }
  }
}
