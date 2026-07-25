"use client";

import { useNavigationDirection } from "@/hooks/use-navigation-direction";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBackward = useNavigationDirection();

  const slideVariants = {
    forward: {
      initial: { opacity: 0, x: 100 }, 
      animate: { opacity: 1, x: 0 },  
      exit: { opacity: 0, x: -100 }    
    },
    backward: {
      initial: { opacity: 0, x: -100 }, 
      animate: { opacity: 1, x: 0 },  
      exit: { opacity: 0, x: 100 }     
    }
  };

  const directionVariant = isBackward ? slideVariants.backward : slideVariants.forward;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={directionVariant}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="w-full h-full" 
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}