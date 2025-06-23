


export const getDrugs = async() => {
    try {
        const response = await fetch('https://doctoroncallstp.com/wp-json/wp/v2/drug/?per_page=100');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data; 
      } catch (error) {
        console.error('Error fetching diseases:', error);
        
      }
}

export const getdrugsCatogery = async() => {
    try {
        const response = await fetch('https://doctoroncallstp.com/wp-json/wp/v2/drug_category');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        return data; 
      } catch (error) {
        console.error('Error fetching diseases:', error);
        
      }
}