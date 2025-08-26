import { motion } from 'framer-motion'
import { Settings, LogOut, Sun, Moon, Bell, User, Search } from 'lucide-react'

export default function HeaderBar({ title, right }: { title?: string; right?: React.ReactNode }) {
  const logoSrc = `${import.meta.env.BASE_URL}images/wheelyfix-logo.png`
  return (
    <motion.div 
      className="header" 
      initial={{ y: -20, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="header-left">
        {title && (
          <motion.div 
            className="page-title"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {title}
          </motion.div>
        )}
      </div>
      
      <div className="header-center">
        <motion.div 
          className="search-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Search className="search-icon" />
          <input 
            type="text" 
            placeholder="Search admin panel..." 
            className="search-input"
          />
        </motion.div>
      </div>

      <div className="header-right">
        <motion.div 
          className="header-actions"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.button 
            className="header-btn notification-btn"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Bell className="icon" />
            <span className="notification-badge">3</span>
          </motion.button>
          
          <motion.button 
            className="header-btn profile-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <User className="icon" />
            <span>Admin</span>
          </motion.button>
          
          {right}
        </motion.div>
      </div>
    </motion.div>
  )
}


