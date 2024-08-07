import React, { useState } from 'react';
import FormField from '../components/FormField';


export default function Forgot() {
  const [formState, setFormState] = useState({
    token: "",
    email: "",
    emailRecoveryFirst: ""
  });

  const [loading, setLoading] = useState(false); // Introduce loading state

  const handleChange = (name, value) => {
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestToken = async (e) => {
    setLoading(true)
    e.preventDefault();
    try {
      console.log('Email to send:', formState.emailRecoveryFirst);
        const response = await fetch('https://api.vtscases.com/resetPasswordToken', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'email': formState.emailRecoveryFirst,
        },
        body: JSON.stringify({}),
      });

      if (response.status === 200) {
        setLoading(false)
        alert('security key  was sent to your email');
        window.location.reload(); 
      } else {
        
        const data = await response.text();
        setLoading(false)
        alert(data || 'An error occurred');
      }
    } catch (error) {
      setLoading(false)
      alert('An error occurred: ' + error.message);
    }
  };


  const handleResetPassword = async (e) => {
    setLoading(true)
    e.preventDefault();
    try {
      console.log('Email to reset:', formState.email);
      const response = await fetch('https://api.vtscases.com/resetPassword', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'token': formState.token,
          'email': formState.email,
        },
        body: JSON.stringify({}),
      });

      if (response.status === 200) {
        alert('Temporary password sent yo you mail. Log in with the temporary password and update it in profile section');
        setLoading(false)
        window.location.href = '/login'; // Navigate to the login page after alert
      } else {
        const data = await response.text();
        setLoading(false)
        alert(data || 'An error occurred');
      }
    } catch (error) {
      setLoading(false)
      alert('An error occurred: ' + error.message);
    }
  };

  return (

    <div>   
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7185928504834368"
     crossorigin="anonymous"></script>
       {loading && <div className="loading-icon"><i className="fas fa-spinner fa-spin"></i></div>}
      <div>
        <h2>Security key generator</h2>
        <div>Security key will be sent to registered email.</div>
        <form onSubmit={handleRequestToken}>
          <FormField
            label="Email"
            name="emailRecoveryFirst"
            value={formState.emailRecoveryFirst}
            onChange={(value) => handleChange('emailRecoveryFirst', value)}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
      <div>
        <h2>Temporary Password</h2>
        <p>Temporary password will be sent to your mail.</p>
        <form onSubmit={handleResetPassword}>
          <FormField
            label="Email"
            name="email"
            value={formState.email}
            onChange={(value) => handleChange('email', value)}
          />
          <p>Enter security key sent to your mail</p>
          <FormField
            label="Token"
            name="token"
            value={formState.token}
            onChange={(value) => handleChange('token', value)}
          />
          <button type="submit">Reset Password</button>
        </form>

      </div>
    </div>
  );
}
