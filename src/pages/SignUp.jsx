import React,{useState} from 'react'
import { Link } from 'react-router-dom'
import { app } from '../firebase'
import { getAuth,createUserWithEmailAndPassword,GoogleAuthProvider,signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

// const navigate = useNavigate();
const auth = getAuth(app);
const gooleProvider = new GoogleAuthProvider()

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signupUser = () => {
    createUserWithEmailAndPassword(auth,email,password).then((value)=>console.log(value),alert("success"));
  }
  const signupwithGoogle = () => {
    signInWithPopup(auth, gooleProvider)
      .then((result) => {
        console.log('Google Sign-In Success:', result);
        navigate('/business-form');
      })
      .catch((error) => {
        console.error('Google Sign-In Error:', error);
        // Optionally handle error case
      });
  }
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row-reverse gap-20">
        {/* Info Section */}
        <div className="text-center lg:text-left max-w-md">
          <h1 className="text-5xl font-bold">Get Started Today!</h1>
          <p className="py-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="badge badge-primary">✓</div>
              <span>Upload and analyze multiple papers at once</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="badge badge-primary">✓</div>
              <span>Track your analysis history</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="badge badge-primary">✓</div>
              <span>Access premium prediction features</span>
            </div>
          </div>
        </div>

        {/* Sign Up Form Card */}
        <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
            <form>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input 
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email" 
                  placeholder="your@email.com" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input 
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password" 
                  placeholder="Create a password" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <input 
                  type="password" 
                  placeholder="Confirm your password" 
                  className="input input-bordered" 
                  required 
                />
              </div>
              <div className="form-control mt-8">
                <button className="btn btn-primary" onClick={signupUser}>Sign Up</button>
              </div>
              
              <div className="divider">OR</div>
              <button onClick={signupwithGoogle}>SignInwith Google</button>
              <div className="text-center">
                <p className="text-sm">Already have an account?
                  <Link to="/signin" className="btn btn-link text-primary -ml-3">Sign In</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
