import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Registered successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (err) {
      setMessage('Server error - please try again later');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Sign Up Below:</h2>
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
          />
          <button type="submit">Register</button>
        </form>
        {message && <p className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</p>}
      </div>
    </div>
  );
}

export default Signup;