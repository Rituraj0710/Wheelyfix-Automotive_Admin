import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react'

export default function FooterBar() {
  const logoSrc = `${import.meta.env.BASE_URL}images/wheelyfix-logo.png`
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <img src={logoSrc} alt="Wheelyfix" className="brand-logo" />
            <motion.h3 
              className="footer-title"
              whileHover={{ color: '#3b82f6' }}
              transition={{ duration: 0.3 }}
            >
              Wheelyfix Automotive
            </motion.h3>
          </div>
          <p className="footer-description">
            Your trusted partner for automotive excellence. We provide comprehensive 
            vehicle services with cutting-edge technology and expert technicians.
          </p>
          <div className="footer-contact">
            <motion.div 
              className="contact-item"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Phone className="contact-icon" />
              <span>+91 98765 43210</span>
            </motion.div>
            <motion.div 
              className="contact-item"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Mail className="contact-icon" />
              <span>info@wheelyfix.com</span>
            </motion.div>
            <motion.div 
              className="contact-item"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <MapPin className="contact-icon" />
              <span>Mumbai, Maharashtra, India</span>
            </motion.div>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Quick Links</h4>
          <motion.ul className="footer-links">
            {['Dashboard', 'Users', 'Services', 'Bookings', 'Payments', 'Analytics'].map((link, index) => (
              <motion.li 
                key={link}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <motion.a 
                  href="#"
                  whileHover={{ color: '#3b82f6', x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {link}
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Connect With Us</h4>
          <div className="social-links">
            {[
              { icon: Facebook, name: 'Facebook', color: '#1877f2' },
              { icon: Twitter, name: 'Twitter', color: '#1da1f2' },
              { icon: Instagram, name: 'Instagram', color: '#e4405f' },
              { icon: Linkedin, name: 'LinkedIn', color: '#0077b5' },
              { icon: Github, name: 'GitHub', color: '#333' }
            ].map((social, index) => (
              <motion.a
                key={social.name}
                href="#"
                className="social-link"
                style={{ '--social-color': social.color } as any}
                whileHover={{ 
                  scale: 1.2, 
                  rotate: 5,
                  backgroundColor: social.color,
                  color: 'white'
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <social.icon className="social-icon" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <motion.div 
        className="footer-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="footer-bottom-content">
          <p>© {new Date().getFullYear()} Wheelyfix Automotive. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </motion.div>
    </motion.footer>
  )
}


