import { Alert } from 'react-native'; 

export const checkCode = async (diseaseData) => {
    const baseUrl = 'https://api.doctoroncallstp.com/authenticate-code'; // Replace with your actual API endpoint

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: diseaseData }),
    };
  
    try {
      const response = await fetch(baseUrl, requestOptions);
  
      if (response.ok) {
        // Successful response (status code in the 200 range)
        const responseData = await response.json();
        console.log('Successful response:', responseData);
        return response.status; // Return the parsed response data
      } else {
        // Handle non-200 status codes (including 400 Bad Request)
        const errorData = await response.json(); // Might be an error object or message
        if (response.status === 400) {
          if (errorData.errors && errorData.errors.length > 0) {
            Alert.alert('Error', errorData.errors[0].message);
          }
        } else {
          console.error('API request failed:', response.status, errorData);
          // Handle other errors based on the status code and error data
          Alert.alert('Error', 'An error occurred. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error making API request:', error);
      Alert.alert('Error', 'Failed to communicate with the server. Please try again later.');
    }
};