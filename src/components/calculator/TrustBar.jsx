import { motion } from "framer-motion";

const clients = [
  {
    name: "ICE CLASS",
    logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/2e915d792_2026-05-12-125506.png",
  },
  {
    name: "TRIPEX",
    logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/1a21d260b_1708561485985.png",
  },
  {
    name: "ש.פארם",
    logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/c7aa070c2_2026-05-05110024.png",
  },
  {
    name: "A Head Spa",
    logo: "https://media.base44.com/images/public/6a02f33e91d5cbd1f45f106b/e4c804092_684ab79268012-11.jpg",
  },
];

export default function TrustBar() {
  return (
    <div className="w-full max-w-3xl mt-5">
      <p className="text-center text-xs text-gray-400 mb-4 uppercase tracking-wider font-medium">
        הם כבר עובדים איתנו
      </p>
      <div className="grid grid-cols-4 gap-3">
        {clients.map((client, i) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-center h-16 shadow-sm"
          >
            <img
              src={client.logo}
              alt={client.name}
              className="max-h-10 max-w-full object-contain"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}