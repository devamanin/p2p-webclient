import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ChatMessage {
  id: string;
  text?: string;
  senderId: string;
  timestamp: Date | null;
  type?: string;
  roomId?: string;
}

export interface ChatPreview {
  chatId: string;
  friendUid: string;
  friendName: string;
  friendPhotoUrl?: string;
  lastMessage: string;
  lastMessageTime: Date | null;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  private get currentUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  getChatId(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }

  async sendMessage(friendUid: string, text: string): Promise<void> {
    if (!this.currentUid) throw new Error('Not logged in');

    const chatId = this.getChatId(this.currentUid, friendUid);
    const chatRef = doc(this.firestore, 'chats', chatId);

    // Update chat metadata
    await setDoc(chatRef, {
      lastMessage: text,
      lastMessageTime: serverTimestamp(),
      participants: [this.currentUid, friendUid],
    }, { merge: true });

    // Add message
    await addDoc(collection(this.firestore, 'chats', chatId, 'messages'), {
      text,
      senderId: this.currentUid,
      timestamp: serverTimestamp(),
    });
  }

  getMessages(friendUid: string): Observable<ChatMessage[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        return new Observable<ChatMessage[]>((subscriber) => {
          const chatId = this.getChatId(user.uid, friendUid);
          const q = query(
            collection(this.firestore, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'desc')
          );

          const unsub = onSnapshot(q, (snapshot) => {
            const messages: ChatMessage[] = snapshot.docs.map((d) => {
              const data = d.data();
              const ts = data['timestamp'] as Timestamp | null;
              return {
                id: d.id,
                text: data['text'],
                senderId: data['senderId'],
                timestamp: ts ? ts.toDate() : null,
                type: data['type'],
                roomId: data['roomId'],
              };
            });
            subscriber.next(messages);
          });
          return () => unsub();
        });
      })
    );
  }

  getActiveChats(): Observable<ChatPreview[]> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([]);
        return new Observable<ChatPreview[]>((subscriber) => {
          const q = query(
            collection(this.firestore, 'chats'),
            where('participants', 'array-contains', user.uid)
          );

          const unsub = onSnapshot(q, async (snapshot) => {
            const chats: ChatPreview[] = [];

            for (const docSnap of snapshot.docs) {
              const data = docSnap.data();
              const participants: string[] = data['participants'] ?? [];
              const friendUid = participants.find((uid: string) => uid !== user.uid) ?? '';

              if (friendUid) {
                try {
                  const userDoc = await getDoc(doc(this.firestore, 'users', friendUid));
                  if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const ts = data['lastMessageTime'] as Timestamp | null;
                    chats.push({
                      chatId: docSnap.id,
                      friendUid,
                      friendName: userData?.['name'] ?? 'Unknown',
                      friendPhotoUrl: userData?.['photoUrl'],
                      lastMessage: data['lastMessage'] ?? '',
                      lastMessageTime: ts ? ts.toDate() : null,
                    });
                  }
                } catch (e) {
                  console.error('Error fetching chat user:', e);
                }
              }
            }

            // Sort by lastMessageTime desc
            chats.sort((a, b) => {
              if (!a.lastMessageTime && !b.lastMessageTime) return 0;
              if (!a.lastMessageTime) return 1;
              if (!b.lastMessageTime) return -1;
              return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
            });

            subscriber.next(chats);
          });
          return () => unsub();
        });
      })
    );
  }
}
