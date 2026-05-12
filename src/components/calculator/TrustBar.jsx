import { motion } from "framer-motion";

const clients = [
  { name: "ICE CLASS", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/2e915d792_2026-05-12-125506.png" },
  { name: "TRIPEX", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/1a21d260b_1708561485985.png" },
  { name: "ש.פארם", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/c7aa070c2_2026-05-05110024.png" },
  { name: "A Head Spa", logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/e4c804092_684ab79268012-11.jpg" },
];

export default function TrustBar() {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <p className="text-center text-xs text-gray-400 font-medium mb-4 uppercase tracking-wider">
        עסקים שכבר עובדים עם בילדו
      </p>
      <div className="grid grid-cols-4 gap-3">
        {clients.map((client, i) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-center h-14 shadow-sm"
          >
            <img
              src={client.logo}
              alt={client.name}
              className="max-h-8 max-w-full object-contain opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}