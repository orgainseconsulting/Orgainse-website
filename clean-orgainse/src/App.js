import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Newsletter Form Component
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Successfully subscribed to newsletter!');
        setEmail('');
        setFirstName('');
      } else {
        setError(data.error || 'Subscription failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>AI Strategy Newsletter</h3>
      <p style={{ marginBottom: '2rem', textAlign: 'center', color: '#64748b' }}>
        Get weekly insights on AI project management and digital transformation.
      </p>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        
        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </button>
      </form>
    </div>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    service_type: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', company: '', phone: '', service_type: '', message: '' });
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Contact Us</h3>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@company.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Company</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Your company name"
          />
        </div>
        
        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your phone number"
          />
        </div>
        
        <div className="form-group">
          <label>Service Interest</label>
          <input
            type="text"
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            placeholder="AI Strategy, Digital Transformation, etc."
          />
        </div>
        
        <div className="form-group">
          <label>Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about your project or requirements..."
            rows="5"
            required
          ></textarea>
        </div>
        
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

// Home Page Component
const HomePage = () => (
  <div>
    <div className="hero">
      <div className="container">
        <h1>AI-Native Strategic Consulting</h1>
        <p>Transform your business with cutting-edge AI solutions and strategic guidance</p>
        <Link to="/contact" className="btn">Get Started Today</Link>
      </div>
    </div>
    
    <div className="section">
      <div className="container">
        <h2>Why Choose Orgainse?</h2>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">4.6★</div>
            <div className="stat-label">Client Satisfaction Rating</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">200+</div>
            <div className="stat-label">AI Projects Delivered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">95%</div>
            <div className="stat-label">Client Retention Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">50+</div>
            <div className="stat-label">Fortune 500 Clients</div>
          </div>
        </div>
        
        <NewsletterForm />
      </div>
    </div>
  </div>
);

// Contact Page Component
const ContactPage = () => (
  <div className="section">
    <div className="container">
      <h2>Contact Us</h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#64748b' }}>
        Ready to transform your business with AI? Let's discuss your project.
      </p>
      <ContactForm />
    </div>
  </div>
);

// Services Page Component
const ServicesPage = () => (
  <div className="section">
    <div className="container">
      <h2>Our Services</h2>
      <div className="stats">
        <div className="stat-card">
          <h3>AI Strategy</h3>
          <p>Comprehensive AI roadmaps and implementation strategies for your business transformation.</p>
        </div>
        <div className="stat-card">
          <h3>Digital Transformation</h3>
          <p>End-to-end digital transformation consulting with focus on AI integration.</p>
        </div>
        <div className="stat-card">
          <h3>Process Automation</h3>
          <p>Intelligent automation solutions to streamline operations and boost efficiency.</p>
        </div>
        <div className="stat-card">
          <h3>Data Analytics</h3>
          <p>Advanced analytics and machine learning solutions for data-driven insights.</p>
        </div>
      </div>
    </div>
  </div>
);

// About Page Component
const AboutPage = () => (
  <div className="section">
    <div className="container">
      <h2>About Orgainse</h2>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#64748b' }}>
          We are a leading AI-native consulting firm specializing in strategic business transformation 
          through artificial intelligence and digital innovation.
        </p>
        <p style={{ marginBottom: '2rem' }}>
          Our team of experts combines deep technical expertise with strategic business acumen to 
          deliver transformative solutions that drive real business value.
        </p>
        <div className="stats">
          <div className="stat-card">
            <div className="stat-value">10+</div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">25+</div>
            <div className="stat-label">Industry Experts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">15+</div>
            <div className="stat-label">Countries Served</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Header Navigation Component
const Header = () => (
  <header style={{ 
    background: 'white', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
    position: 'sticky', 
    top: 0, 
    zIndex: 1000 
  }}>
    <div className="container" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 20px' 
    }}>
      <Link to="/" style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        color: '#E07A5F', 
        textDecoration: 'none' 
      }}>
        Orgainse
      </Link>
      
      <nav>
        <Link to="/" style={{ margin: '0 1rem', textDecoration: 'none', color: '#374151' }}>Home</Link>
        <Link to="/about" style={{ margin: '0 1rem', textDecoration: 'none', color: '#374151' }}>About</Link>
        <Link to="/services" style={{ margin: '0 1rem', textDecoration: 'none', color: '#374151' }}>Services</Link>
        <Link to="/contact" style={{ margin: '0 1rem', textDecoration: 'none', color: '#374151' }}>Contact</Link>
      </nav>
    </div>
  </header>
);

// Footer Component
const Footer = () => (
  <footer style={{ background: '#2d3748', color: 'white', padding: '2rem 0', marginTop: '4rem' }}>
    <div className="container" style={{ textAlign: 'center' }}>
      <p>&copy; 2025 Orgainse Consulting. All rights reserved.</p>
      <p style={{ marginTop: '0.5rem', opacity: 0.8 }}>
        AI-Native Strategic Consulting Services
      </p>
    </div>
  </footer>
);

// Main App Component
const App = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;