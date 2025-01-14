import React, {useState} from "react";
import axios from 'axios';
import Input from '../components/Input'; // Reusable Input component
import Button from '../components/Button'; // Reusable Button component
import styles from '../styles/LoginPage.module.css';


function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const response = await axios.post('http://localhost:8080/api/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            window.location.href = '/dashboard';
        }catch(error){
            console.log("Login failed", error);
            setError('Invalid email or password');
        }
    };

    return (
        <div className={styles.container}>
             <h1 className={styles.title}>Login</h1>

            <form className={styles.form}  onSubmit={handleLogin}>
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

                <Button type="submit" >Login</Button>
                {error && <p className={styles.error}>{error}</p>}

            </form>
        </div>
    )


}

export default LoginPage;