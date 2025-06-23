import firestore from '@react-native-firebase/firestore';

export const storeUserData = async (user, verified, phone, college, city, name, cnic) => {
  try {
    await firestore().collection('users').doc(user.uid).set({
      email: user.email,
      virified: verified,
      name: name,
      phone: phone,
      college: college,
      city: city,
      cnic: cnic,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    return true
  } catch (error) {
    console.error('Error storing user data:', error);
    return false
  }
};

export const updateUserData = async (userId, fieldName, fieldValue) => {
  try {
    const updateData = {};
    updateData[fieldName] = fieldValue;
    
    await firestore().collection('users').doc(userId).update(updateData);
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
};

export const getUserData = async (uid) => {
  try {
    const userDoc = await firestore()
      .collection('users')
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      console.log('No user found');
      return null;
    }

    return userDoc.data();
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const isProfileComplete = async (uid) => {
  try {
    const userData = await getUserData(uid);
    return !!(userData && 
      userData.name && 
      userData.phone && 
      userData.college && 
      userData.city && 
      userData.cnic);
  } catch (error) {
    console.error('Error checking profile completion:', error);
    return false;
  }
};