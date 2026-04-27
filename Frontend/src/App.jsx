import { Link, Navigate, Route, Routes, useNavigate, useSearchParams } from "react-router-dom";
import "./App.css";
import logo from "./logo.png";
import googleLogo from "./assets/google-logo.svg";
import { API_BASE_URL } from "./config/constants";
import DrivePage from "./pages/DrivePage";
import { getStoredValidToken, isJwtValid, persistToken } from "./utils/auth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/login" element={<Navigate to="/signin" replace />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/drive" element={<DrivePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const incomingToken = searchParams.get("token") || "";

  if (isJwtValid(incomingToken)) {
    persistToken(incomingToken);
    return <Navigate to="/drive" replace />;
  }

  return <Navigate to="/signin" replace />;
}

function LandingPage() {
  const navigate = useNavigate();

  if (getStoredValidToken()) {
    return <Navigate to="/drive" replace />;
  }

  const handleGetStarted = () => {
    if (getStoredValidToken()) {
      navigate("/drive");
      return;
    }
    navigate("/signin");
  };

  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <div className="brand">
          <img src={logo} alt="MyFileDrive logo" />
          <span>MyFileDrive</span>
        </div>
        <div className="landing-actions">
          <Link className="btn btn-light" to="/signup">
            Sign up
          </Link>
          <button type="button" className="btn btn-primary" onClick={handleGetStarted}>
            Get Started
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <h1>Say goodbye to file silos and content chaos</h1>
          <p>
            Move your files into one secure workspace. Collaborate in real-time, organize content fast,
            and access everything from anywhere.
          </p>
          <div className="hero-buttons">
            <Link className="btn btn-light" to="/signup">
              Get Started
            </Link>
            <button type="button" className="btn btn-primary" onClick={handleGetStarted}>
              Sign in
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="bubble bubble-a" />
          <div className="bubble bubble-b" />
          <div className="search-card">
            <div className="search-row">Search your drive</div>
            <ul>
              <li>Project Plan.pdf</li>
              <li>Design Assets</li>
              <li>Invoice April.xlsx</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="storage-section">
        <h2>Cloud storage made easy</h2>
        <p>Simple and scalable file storage for individuals and teams.</p>
        <div className="storage-grid">
          <article>
            <h3>Storage that grows with you</h3>
            <p>Scale from personal projects to large team repositories without changing workflows.</p>
          </article>
          <article>
            <h3>Search and find faster</h3>
            <p>Find files quickly with metadata-based listing and structured folders.</p>
          </article>
          <article>
            <h3>Secure by default</h3>
            <p>JWT-based access and protected APIs keep your content private.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

function SignInPage() {
  if (getStoredValidToken()) {
    return <Navigate to="/drive" replace />;
  }

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <main className="login">
      <div className="login-card">
        <img className="login-logo" src={logo} alt="MyFileDrive logo" />
        <h2>Sign in to MyFileDrive</h2>
        <p>Continue securely with your Google account.</p>
        <div className="login-actions">
          <button type="button" className="google-button" onClick={handleGoogleSignIn}>
            <img src={googleLogo} alt="Google logo" />
            Continue with Google
          </button>
          <Link to="/signup">Need an account? Sign up</Link>
        </div>
      </div>
    </main>
  );
}

function SignupPage() {
  if (getStoredValidToken()) {
    return <Navigate to="/drive" replace />;
  }

  return (
    <main className="login">
      <div className="login-card">
        <img className="login-logo" src={logo} alt="MyFileDrive logo" />
        <h2>Create your account</h2>
        <p>Sign up with Google, then you will be redirected back to your Drive.</p>
        <div className="login-actions">
          <a className="btn btn-primary" href={`${API_BASE_URL}/auth/google`}>
            Continue with Google
          </a>
          <Link to="/signin">Already have an account? Sign in</Link>
        </div>
      </div>
    </main>
  );
}

export default App;
