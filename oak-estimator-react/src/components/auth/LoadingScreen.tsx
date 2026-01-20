import { Building2, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20">
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Building2 className="w-10 h-10 text-primary" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold mb-2">OAK Estimator</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </p>
        </div>
      </motion.div>
    </div>
  )
}
