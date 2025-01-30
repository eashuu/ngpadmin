import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { jwtDecode } from 'jwt-decode';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Swal from 'sweetalert2'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  async function handleSuccess(res) {
    try {
      const decodedToken = jwtDecode(res.credential); // Decode token
      const email = decodedToken.email; // Extract email (or other data you need)
      const photo = decodedToken.picture;
      console.log('Logged in as:', email); // You can store the email in state/context if needed

      const access_mail = ["nadincs77@gmail.com","eashwarvenkatesan@gmail.com","23cb033@drngpit.ac.in","23ad034@drngpit.ac.in","23cb003@drngpit.ac.in","23mba101@drngpit.ac.in","23mba013@drngpit.ac.in","sdc@drngpit.ac.in","sdc@drngpasc.ac.in"]
      // Update login status to true on successful login
      if (access_mail.includes(email)){
        setIsLoggedIn(true);
      }
      else{
        Swal.fire({
          title: "Admin not found",
          icon: "error"
        });
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  return (
    <div>
      <GoogleOAuthProvider clientId="554313071695-88jnv5oetp69fknghnocq7i8dogh28s6.apps.googleusercontent.com">
        {!isLoggedIn ? (
          // Show Google Login button if not logged in
          <div style={{height:"100vh", display:"flex"}} className='justify-center items-center'>
            <div>
              <p className='text-3xl font-bold'>Kanam25 Admin Dashboard</p>
              <div>
              <GoogleLogin onSuccess={handleSuccess} onError={(error) => console.error(error)} />
              </div>
            
            </div>

          </div>
          
        ) : (
          // Show Dashboard if logged in
          <Dashboard />
        )}
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
