import * as Application from 'expo-application';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider as FirebaseEmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import { firebaseAuth, firestore, isFirebaseReady } from '@/config/firebase';

export type UserData = {
  name?: string;
  phone?: string;
  college?: string;
  city?: string;
  cnic?: string;
  virified?: boolean;
  expiryDate?: Date | string | Timestamp | { toDate: () => Date };
  email?: string;
};

type CodeStatusResponse = {
  success: boolean;
  message: string;
  status?: string;
};

type DeviceExclusivityResult = {
  canLogin: boolean;
  reason: string;
  currentDeviceId?: string;
};

type AuthUser = {
  uid: string;
  email?: string | null;
  emailVerified?: boolean;
  sendEmailVerification?: () => Promise<void>;
  reauthenticateWithCredential?: (credential: ReturnType<typeof FirebaseEmailAuthProvider.credential>) => Promise<void>;
  delete?: () => Promise<void>;
};

type AuthError = {
  code: string;
  message: string;
};

type StoreUserAuth = {
  uid: string;
  email?: string | null;
};

function assertFirebaseReady(): void {
  if (!isFirebaseReady || !firebaseAuth || !firestore) {
    throw new Error('Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* values to your .env file.');
  }
}

async function getDeviceId(): Promise<string> {
  if (Platform.OS === 'android') {
    return Application.getAndroidId() || 'unknown-android-device';
  }

  const iosId = await Application.getIosIdForVendorAsync();
  return iosId ?? 'unknown-ios-device';
}

function mapAuthUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    sendEmailVerification: () => sendEmailVerification(user),
    reauthenticateWithCredential: async (credential) => {
      await reauthenticateWithCredential(user, credential);
    },
    delete: () => deleteUser(user),
  };
}

export const EmailAuthProvider = {
  credential: (email: string, password: string) => FirebaseEmailAuthProvider.credential(email, password),
};

function createUnavailableAuthMethod(methodName: string) {
  return async () => {
    throw new Error(
      `Firebase is not configured (${methodName}). Copy .env.example to .env and add your Firebase web config.`,
    );
  };
}

export const auth = () => {
  if (!isFirebaseReady || !firebaseAuth) {
    return {
      currentUser: null,
      signInWithEmailAndPassword: createUnavailableAuthMethod('signInWithEmailAndPassword'),
      createUserWithEmailAndPassword: createUnavailableAuthMethod('createUserWithEmailAndPassword'),
      sendPasswordResetEmail: createUnavailableAuthMethod('sendPasswordResetEmail'),
      signOut: createUnavailableAuthMethod('signOut'),
    };
  }

  const authInstance = firebaseAuth;

  return {
    get currentUser() {
      return mapAuthUser(authInstance.currentUser);
    },
    signInWithEmailAndPassword: async (email: string, password: string) => {
      const credential = await signInWithEmailAndPassword(authInstance, email, password);
      return { user: mapAuthUser(credential.user)! };
    },
    createUserWithEmailAndPassword: async (email: string, password: string) => {
      const credential = await createUserWithEmailAndPassword(authInstance, email, password);
      return { user: mapAuthUser(credential.user)! };
    },
    sendPasswordResetEmail: async (email: string) => {
      await sendPasswordResetEmail(authInstance, email);
    },
    signOut: async () => {
      await signOut(authInstance);
    },
  };
};

export async function checkDeviceExclusivity(uid: string): Promise<DeviceExclusivityResult> {
  try {
    assertFirebaseReady();

    const userRef = doc(firestore!, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return { canLogin: true, reason: 'New user' };
    }

    const userData = userDoc.data();
    const deviceId = await getDeviceId();

    if (!userData || typeof userData.currentDeviceId !== 'string') {
      return { canLogin: true, reason: 'No device registered' };
    }

    if (userData.currentDeviceId === deviceId) {
      return { canLogin: true, reason: 'Same device' };
    }

    return {
      canLogin: false,
      reason: 'Device already logged in elsewhere',
      currentDeviceId: userData.currentDeviceId,
    };
  } catch (error) {
    console.error('Error checking device exclusivity:', error);
    return { canLogin: true, reason: 'Error occurred, allowing login' };
  }
}

export async function registerDevice(uid: string): Promise<boolean> {
  try {
    assertFirebaseReady();

    const deviceId = await getDeviceId();
    const userRef = doc(firestore!, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists() || !userDoc.data()?.currentDeviceId) {
      await setDoc(
        userRef,
        {
          currentDeviceId: deviceId,
          lastDeviceLogin: serverTimestamp(),
          platform: Platform.OS,
        },
        { merge: true },
      );
    }

    return true;
  } catch (error) {
    console.error('Error registering device:', error);
    return false;
  }
}

export async function logoutAndClearDevice(uid: string): Promise<boolean> {
  try {
    assertFirebaseReady();

    await updateDoc(doc(firestore!, 'users', uid), {
      currentDeviceId: null,
      lastDeviceLogin: null,
      deviceInfo: null,
    });

    return true;
  } catch (error) {
    console.error('Error logging out and clearing device:', error);
    return false;
  }
}

export async function storeUserData(
  user: StoreUserAuth,
  verified: boolean,
  phone: string,
  college: string,
  city: string,
  name: string,
  cnic: string,
  expiryDate: Date | null,
): Promise<boolean> {
  try {
    assertFirebaseReady();

    await setDoc(doc(firestore!, 'users', user.uid), {
      email: user.email,
      virified: verified,
      name,
      phone,
      college,
      city,
      cnic,
      expiryDate,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
}

export async function updateUserData(
  userId: string,
  fieldName: string,
  fieldValue: unknown,
): Promise<boolean> {
  try {
    assertFirebaseReady();

    await updateDoc(doc(firestore!, 'users', userId), {
      [fieldName]: fieldValue,
    });

    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
}

export async function updateUserVerification(
  userId: string,
  verified: boolean,
  verifiedAt: Date,
  expiryDate: Date,
): Promise<boolean> {
  try {
    assertFirebaseReady();

    await updateDoc(doc(firestore!, 'users', userId), {
      virified: verified,
      verifiedAt: Timestamp.fromDate(verifiedAt),
      expiryDate: Timestamp.fromDate(expiryDate),
    });

    return true;
  } catch (error) {
    console.error('Error updating user verification:', error);
    return false;
  }
}

export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    assertFirebaseReady();

    const userDoc = await getDoc(doc(firestore!, 'users', uid));

    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data() as UserData;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function isProfileComplete(uid: string): Promise<boolean> {
  try {
    const userData = await getUserData(uid);

    return Boolean(
      userData?.name && userData.phone && userData.college && userData.city && userData.cnic,
    );
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
}

export async function checkCodeStatus(code: string): Promise<CodeStatusResponse> {
  try {
    assertFirebaseReady();

    if (!code || typeof code !== 'string') {
      return {
        success: false,
        message: 'Invalid code provided',
        status: 'invalid',
      };
    }

    const codesSnapshot = await getDocs(
      query(collection(firestore!, 'codes'), where('code', '==', code), limit(1)),
    );

    if (codesSnapshot.empty) {
      return {
        success: false,
        message: 'Code not found',
        status: 'not_found',
      };
    }

    const codeDoc = codesSnapshot.docs[0];
    const codeData = codeDoc.data();

    if (codeData.used === true) {
      return {
        success: false,
        message: 'Code is already used',
        status: 'used',
      };
    }

    return {
      success: true,
      message: 'Code is active',
      status: 'active',
    };
  } catch (error) {
    console.error('Error checking code status:', error);
    return {
      success: false,
      message: 'Error checking code status',
      status: 'error',
    };
  }
}

export async function markCodeAsUsed(code: string): Promise<void> {
  const codeStatus = await checkCodeStatus(code);

  if (!codeStatus.success) {
    throw new Error(codeStatus.message);
  }

  assertFirebaseReady();

  const codesSnapshot = await getDocs(
    query(collection(firestore!, 'codes'), where('code', '==', code), limit(1)),
  );

  if (codesSnapshot.empty) {
    throw new Error('Code not found');
  }

  const codeDoc = codesSnapshot.docs[0];
  await updateDoc(codeDoc.ref, {
    used: true,
    usedAt: serverTimestamp(),
  });
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as AuthError).code === 'string'
  );
}
