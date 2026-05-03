import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  setDoc,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: string;
  senderName?: string;
  senderPhotoUrl?: string;
}

export interface Friend {
  uid: string;
  name: string;
  photoUrl?: string;
  age?: number;
  gender?: string;
  location?: string;
}

@Injectable({ providedIn: 'root' })
export class FriendService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  private get currentUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  async syncUserProfile(name: string, photoUrl: string, age: number, gender: string, location: string): Promise<void> {
    if (!this.currentUid) return;
    await setDoc(doc(this.firestore, 'users', this.currentUid), {
      uid: this.currentUid,
      name,
      photoUrl,
      age,
      gender,
      location,
      lastActive: serverTimestamp(),
    }, { merge: true });
  }

  async sendFriendRequest(toUid: string): Promise<void> {
    if (!this.currentUid) throw new Error('Not logged in');
    if (toUid === this.currentUid) throw new Error('Cannot add yourself');

    const q = query(
      collection(this.firestore, 'friend_requests'),
      where('fromUid', '==', this.currentUid),
      where('toUid', '==', toUid)
    );
    const existing = await getDocs(q);
    if (!existing.empty) throw new Error('Friend request already sent');

    await addDoc(collection(this.firestore, 'friend_requests'), {
      fromUid: this.currentUid,
      toUid: toUid,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
  }

  async acceptFriendRequest(requestId: string, fromUid: string): Promise<void> {
    if (!this.currentUid) throw new Error('Not logged in');

    // Update request status
    await updateDoc(doc(this.firestore, 'friend_requests', requestId), {
      status: 'accepted',
      updatedAt: serverTimestamp(),
    });

    // Add each user to the other's friends array
    await setDoc(doc(this.firestore, 'users', this.currentUid), {
      uid: this.currentUid,
      friends: arrayUnion(fromUid),
    }, { merge: true });

    await setDoc(doc(this.firestore, 'users', fromUid), {
      uid: fromUid,
      friends: arrayUnion(this.currentUid),
    }, { merge: true });
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'friend_requests', requestId), {
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });
  }

  getFriends(): Observable<Friend[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        return new Observable<Friend[]>((subscriber) => {
          const userDocRef = doc(this.firestore, 'users', user.uid);
          const unsub = onSnapshot(userDocRef, async (snapshot) => {
            if (!snapshot.exists()) {
              subscriber.next([]);
              return;
            }
            const friendUids: string[] = snapshot.data()?.['friends'] ?? [];
            if (friendUids.length === 0) {
              subscriber.next([]);
              return;
            }

            const friends: Friend[] = [];
            for (const uid of friendUids) {
              try {
                const friendDoc = await getDoc(doc(this.firestore, 'users', uid));
                if (friendDoc.exists()) {
                  const data = friendDoc.data();
                  friends.push({
                    uid: friendDoc.id,
                    name: data?.['name'] ?? 'Unknown',
                    photoUrl: data?.['photoUrl'],
                    age: data?.['age'],
                    gender: data?.['gender'],
                    location: data?.['location'],
                  });
                }
              } catch (e) {
                console.error(`Error fetching friend ${uid}:`, e);
              }
            }
            subscriber.next(friends);
          });
          return () => unsub();
        });
      })
    );
  }

  getPendingRequests(): Observable<FriendRequest[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        return new Observable<FriendRequest[]>((subscriber) => {
          const q = query(
            collection(this.firestore, 'friend_requests'),
            where('toUid', '==', user.uid),
            where('status', '==', 'pending')
          );

          const unsub = onSnapshot(q, async (snapshot) => {
            const requests: FriendRequest[] = [];
            for (const docSnap of snapshot.docs) {
              const data = docSnap.data();
              const req: FriendRequest = {
                id: docSnap.id,
                fromUid: data['fromUid'],
                toUid: data['toUid'],
                status: data['status'],
              };

              // Fetch sender info
              try {
                const userDoc = await getDoc(doc(this.firestore, 'users', data['fromUid']));
                if (userDoc.exists()) {
                  req.senderName = userDoc.data()?.['name'] ?? 'Unknown';
                  req.senderPhotoUrl = userDoc.data()?.['photoUrl'];
                }
              } catch (e) {
                console.error('Error fetching sender info:', e);
              }
              requests.push(req);
            }
            subscriber.next(requests);
          });
          return () => unsub();
        });
      })
    );
  }

  /** Look up a user by their UID */
  async findUserByUid(uid: string): Promise<Friend | null> {
    try {
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (!userDoc.exists()) return null;
      const data = userDoc.data();
      return {
        uid: userDoc.id,
        name: data?.['name'] ?? 'Unknown',
        photoUrl: data?.['photoUrl'],
        age: data?.['age'],
        gender: data?.['gender'],
        location: data?.['location'],
      };
    } catch {
      return null;
    }
  }
}
