import React, {useState} from 'react'
import axios from 'axios';
import Input from '../components/Input'; // Reusable Input component
import Button from '../components/Button'; // Reusable Button component
import styles from '../styles/SignupPage.module.css';

function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Disable button during submission
    setError(''); // Clear any previous error
    try {
        await axios.post('http://localhost:8080/api/auth/register', {email, password, name});
        alert("Sign up succesful. Now, please Login");
        window.location.href = '/';
    }catch(error){
        console.log("Sign Up Failed", error);
        setError('Signup failed. Please try again.'); // Set error message
    }finally {
      setIsSubmitting(false); // Re-enable button
    }
  };




  return (
    <div className={styles.container}>
         <h1 className={styles.title}>Signup</h1>
        <form className={styles.form} onSubmit={handleSignup}>
            <Input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              
            />
            <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
               
            />
            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              
            />
              <Button type="submit"disabled={isSubmitting} >
                {isSubmitting ? 'Signing up...' : 'Signup'}
              </Button>
              {error && <p className={styles.error}>{error}</p>}
            </form>
    </div>
  );
}

export default SignupPage;