import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/calculator/HeroSection";
import SliderInput from "@/components/calculator/SliderInput";
import ResultsPanel from "@/components/calculator/ResultsPanel";
import ContactForm from "@/components/calculator/ContactForm";
import TrustSection from "@/components/calculator/TrustSection";

const formatNum = (n) => n.toLocaleString('he-IL');
const formatCurrency = (n) => `₪${n.toLocaleString('he-IL')}`;

export default function Calculator() {
  const [messages, setMessages] = useState(5000);
  const [customers, setCustomers] = useState(200);
  const [dealValue, setDealValue] = useState(1500);
  const [showForm, setShowForm] = useState(false);

  const results = useMemo(() => {
    // Assumptions based on industry data
    const noResponseRate = 0.18; // 18% of leads don't get timely response
    const conversionLift = 0.25; // 25% more conversions with automation
    const messageCost = 0.08; // cost per message with Bildo API (₪)

    const lostCustomers = Math.round(customers * noResponseRate);
    const monthlyLoss = Math.round(lostCustomers * dealValue);
    const annualLoss = monthlyLoss * 12;

    const additionalCustomers = Math.round(customers * conversionLift);
    const potentialGain = Math.round(additionalCustomers * dealValue);
    const annualGain = potentialGain * 12;

    const totalMessageCost = messages * messageCost;

    return {
      monthlyLoss,
      annualLoss,
      potentialGain,
      annualGain,
      conversionBoost: Math.round(noResponseRate * 100),
      messageCost,
      totalMessageCost: Math.round(totalMessageCost),
    };
  }, [messages, customers, dealValue]);

  return (
    <div className="min-h-screen noise-bg" style={{ background: 'hsl(28 15% 8%)' }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(271 60% 55%), transparent)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, hsl(42 85% 58%), transparent)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Hero */}
        <HeroSection />

        {/* Main Calculator */}
        <section className="px-4 pb-8">
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* Left: Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="rounded-3xl p-8 space-y-8"
              style={{ background: 'hsl(28 12% 11%)', border: '1px solid hsl(28 10% 18%)' }}
            >
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>
                  📊 הזן את נתוני העסק שלך
                </h2>
                <p className="text-sm text-muted-foreground">המחשבון יעשה את כל השאר</p>
              </div>

              <SliderInput
                label="הודעות וואטסאפ בחודש"
                description="כמה הודעות אתה שולח / מקבל"
                icon="💬"
                value={messages}
                min={100}
                max={100000}
                step={100}
                onChange={setMessages}
                format={(v) => `${v.toLocaleString('he-IL')}`}
              />

              <SliderInput
                label="לקוחות / עסקאות בחודש"
                description="כמה עסקאות חדשות נסגרות"
                icon="🤝"
                value={customers}
                min={10}
                max={5000}
                step={10}
                onChange={setCustomers}
                format={(v) => `${v.toLocaleString('he-IL')}`}
              />

              <SliderInput
                label="ערך ממוצע לעסקה / לקוח"
                description="כמה שווה כל לקוח חדש"
                icon="💰"
                value={dealValue}
                min={100}
                max={50000}
                step={100}
                onChange={setDealValue}
                format={(v) => `₪${v.toLocaleString('he-IL')}`}
              />

              {/* Live preview mini */}
              <div className="rounded-xl p-4 text-xs space-y-2" style={{ background: 'hsl(28 10% 14%)' }}>
                <p className="text-muted-foreground font-medium mb-2">תמצית הנתונים:</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">לקוחות שיוצאים ללא מענה:</span>
                  <span className="font-bold text-red-400">{Math.round(customers * 0.18)} / חודש</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">עלות API משוערת:</span>
                  <span className="font-bold gold-text">₪{results.totalMessageCost} / חודש</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <ResultsPanel
                results={results}
                onCTAClick={() => setShowForm(true)}
              />
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-10"
              style={{ fontFamily: 'Frank Ruhl Libre, serif' }}
            >
              איך בילדו עובד עם ה-API שלך?
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  step: "01",
                  title: "חיבור ה-API",
                  desc: "מחברים את המערכת שלך ל-API של Meta דרך בילדו — תוך 24 שעות",
                  icon: "🔌"
                },
                {
                  step: "02",
                  title: "הגדרת תרחישים",
                  desc: "מגדירים תשובות אוטומטיות, follow-ups, וזרימות שיחה חכמות",
                  icon: "⚙️"
                },
                {
                  step: "03",
                  title: "גידול בהכנסות",
                  desc: "כל לקוח מקבל מענה מידי — שיעורי ההמרה עולים תוך ימים",
                  icon: "📈"
                }
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{ background: 'hsl(28 12% 11%)', border: '1px solid hsl(28 10% 18%)' }}
                >
                  <div className="absolute top-3 right-3 text-4xl font-black opacity-10 text-purple-400"
                    style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <TrustSection />

        {/* Final CTA */}
        <section className="px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center rounded-3xl p-12 card-glow"
            style={{ background: 'linear-gradient(135deg, hsl(271 60% 15%) 0%, hsl(28 12% 11%) 100%)', border: '1px solid hsl(271 60% 30%)' }}
          >
            <img
              src="https://media.base44.com/images/public/user_683dc40f7f28b76cbf2cfd30/67ecd3deb_1.png"
              alt="Bildo"
              className="w-20 h-20 rounded-2xl mx-auto mb-6 float-anim"
            />
            <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Frank Ruhl Libre, serif' }}>
              מוכן להפסיק להפסיד כסף?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              קבל הדגמה חינמית ומותאמת אישית לעסק שלך — תוך 24 שעות
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="px-10 py-5 rounded-2xl text-lg font-bold text-white pulse-glow"
              style={{ background: 'linear-gradient(135deg, hsl(271 60% 45%) 0%, hsl(271 60% 65%) 100%)' }}
            >
              🎯 קבל הדגמה חינם עכשיו
            </motion.button>
            <p className="text-xs text-muted-foreground mt-4">ללא התחייבות • ללא כרטיס אשראי</p>
          </motion.div>
        </section>
      </div>

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        calculatorData={{ messages, customers, dealValue, ...results }}
      />
    </div>
  );
}