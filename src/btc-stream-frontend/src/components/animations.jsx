import { motion } from 'framer-motion';

// Animation variants
export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Animated components
export const AnimatedCard = ({ children, className = '', ...props }) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    className={className}
    {...props}
  >
    {children}
  </motion.button>
);

export const AnimatedModal = ({ children, className = '', ...props }) => (
  <motion.div
    variants={scaleIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.2 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedPage = ({ children, className = '', ...props }) => (
  <motion.div
    variants={fadeIn}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.4 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedList = ({ children, className = '', ...props }) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const AnimatedListItem = ({ children, className = '', ...props }) => (
  <motion.div
    variants={staggerItem}
    transition={{ duration: 0.3 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export default {
  fadeIn,
  slideIn,
  scaleIn,
  staggerContainer,
  staggerItem,
  AnimatedCard,
  AnimatedButton,
  AnimatedModal,
  AnimatedPage,
  AnimatedList,
  AnimatedListItem,
};
