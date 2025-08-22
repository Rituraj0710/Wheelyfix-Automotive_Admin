import { motion } from 'framer-motion'

export default function HeaderBar({ title, right }: { title?: string; right?: React.ReactNode }) {
  return (
    <motion.div className="header" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .25 }}>
      <div style={{ fontWeight: 700 }}>{title || 'Admin'}</div>
      <div className="header-actions">{right}</div>
    </motion.div>
  )
}


