// Animaciones optimizadas para mejorar el engagement
import { Variants } from "framer-motion";

// Variantes de animación para entrada de elementos
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Efecto de entrada desde abajo - sutil
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Efecto para las tarjetas de música - escala y aparición
export const musicCardAnimation: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] // Personalizado para sentirse más natural
    }
  },
  hover: { 
    scale: 1.02, 
    boxShadow: "0 10px 30px -10px rgba(var(--accent-color-rgb), 0.3)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

// Animación para notificaciones que resalta y luego se normaliza
export const notificationPulse: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    borderColor: ["rgba(var(--accent-color-rgb), 0.6)", "rgba(var(--accent-color-rgb), 1)", "rgba(var(--accent-color-rgb), 0.6)"],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      times: [0, 0.5, 1]
    }
  }
};

// Animación para transición entre páginas
export const pageTransition: Variants = {
  initial: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

// Animación para resaltar acciones importantes
export const highlightAction: Variants = {
  initial: { backgroundColor: "rgba(var(--accent-color-rgb), 0)" },
  highlight: { 
    backgroundColor: ["rgba(var(--accent-color-rgb), 0)", "rgba(var(--accent-color-rgb), 0.15)", "rgba(var(--accent-color-rgb), 0)"],
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      repeat: 2,
      repeatType: "loop",
      times: [0, 0.5, 1]
    }
  }
};

// Efectos de glitch cyberpunk para eventos especiales
export const cyberpunkGlitch: Variants = {
  initial: { 
    x: 0,
    textShadow: "0 0 0 rgba(0, 255, 255, 0), 0 0 0 rgba(255, 0, 255, 0)"
  },
  glitch: {
    x: [0, -2, 0, 2, 0],
    textShadow: [
      "0 0 0 rgba(0, 255, 255, 0), 0 0 0 rgba(255, 0, 255, 0)",
      "-2px 0 0 rgba(0, 255, 255, 0.3), 2px 0 0 rgba(255, 0, 255, 0.3)",
      "0 0 0 rgba(0, 255, 255, 0), 0 0 0 rgba(255, 0, 255, 0)",
      "2px 0 0 rgba(0, 255, 255, 0.3), -2px 0 0 rgba(255, 0, 255, 0.3)",
      "0 0 0 rgba(0, 255, 255, 0), 0 0 0 rgba(255, 0, 255, 0)"
    ],
    transition: {
      duration: 0.5,
      repeat: 1,
      ease: "easeInOut",
      times: [0, 0.25, 0.5, 0.75, 1]
    }
  }
};

// Stagger de elementos para listas
export const staggerList = (delayFactor = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delayFactor
    }
  }
});

// Item individual dentro de una lista con stagger
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Diseño de scroll suave para listas y contenido
export const smoothScroll = {
  scrollBehavior: "smooth",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(var(--accent-color-rgb), 0.6)",
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: "rgba(var(--accent-color-rgb), 0.8)",
    }
  }
};

// Transición para secciones de formulario
export const formTransition: Variants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: { 
    opacity: 1,
    height: "auto",
    transition: {
      height: {
        duration: 0.4,
      },
      opacity: {
        duration: 0.3,
        delay: 0.1
      }
    }
  },
  exit: { 
    opacity: 0,
    height: 0,
    transition: {
      height: {
        duration: 0.3,
      },
      opacity: {
        duration: 0.2
      }
    }
  }
};

// Animación para botones flotantes de acción
export const floatingActionButton: Variants = {
  rest: { 
    scale: 1,
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
  },
  hover: { 
    scale: 1.05, 
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.95,
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.1
    }
  }
};

// Animación para feedback táctil en elementos interactivos
export const tactileFeedback: Variants = {
  tap: { 
    scale: 0.97,
    transition: {
      duration: 0.1
    }
  }
};