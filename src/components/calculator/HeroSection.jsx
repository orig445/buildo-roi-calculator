import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-8 px-4 text-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-yellow-500/5 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <motion.img
            src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png"
            alt="Bildo"
            className="w-16 h-16 rounded-2xl float-anim"
          />
          <div className="text-right">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>
              בילדו
            </h2>
            <p className="text-xs text-muted-foreground">WhatsApp Business API</p>
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-4xl md:text-6xl font-black mb-4 leading-tight"
          style={{ fontFamily: 'Frank Ruhl Libre, serif' }}
        >
          כמה כסף
          <span className="gradient-text"> אתה מפסיד </span>
          כל חודש?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6"
        >
          עסקים שמשתמשים בוואטסאפ ידני מפסידים לקוחות כל יום.
          <br />
          <span className="gold-text font-semibold">גלה מה המספרים האמיתיים בעסק שלך</span>
        </motion.p>

        {/* Credibility badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-4"
        >
          {["✅ ספק רשמי Meta", "🔒 API מאובטח", "⚡ אינטגרציה תוך 24 שעות"].map((badge) => (
            <span
              key={badge}
              className="text-sm px-4 py-1.5 rounded-full gold-border text-muted-foreground"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}