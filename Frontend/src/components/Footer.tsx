import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    experience: [
      { name: 'Our Story', path: '/about' },
      { name: 'The Menu', path: '/menu/manchester' },
      { name: 'Reservations', path: '/reservations' },
      { name: 'Private Dining', path: '/contact' },
    ],
    branches: [
      { name: 'Manchester', path: '/branches/manchester' },
      { name: 'London', path: '/branches/london' },
      { name: 'Birmingham', path: '/branches/birmingham' },
      { name: 'Edinburgh', path: '/branches/edinburgh' },
      { name: 'Leeds', path: '/branches/leeds' },
      { name: 'Cardiff', path: '/branches/cardiff' },
    ],
    legal: [
      { name: 'Privacy Policy', path: '#' },
      { name: 'Terms of Service', path: '#' },
      { name: 'Cookie Policy', path: '#' },
    ]
  };

  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-8">
              <span className="text-3xl font-black tracking-[0.4em] text-white">STEAKZ</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-xs">
              Exceptional cuts, Michelin-star hospitality, and an atmosphere designed for the discerning guest.
            </p>
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[var(--primary)]">Join the Circle</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--primary)] flex-1 transition-all"
                />
                <button className="bg-[var(--primary)] text-black p-3 rounded-lg hover:brightness-110 transition-all">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.3em] font-black text-white mb-8">The Experience</h4>
            <ul className="space-y-4">
              {footerLinks.experience.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/50 hover:text-[var(--primary)] transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Branches */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.3em] font-black text-white mb-8">Our Branches</h4>
            <ul className="space-y-4">
              {footerLinks.branches.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/50 hover:text-[var(--primary)] transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.3em] font-black text-white mb-8">Get In Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 text-white/50 text-sm">
                <Phone className="w-4 h-4 text-[var(--primary)]" />
                <span>+44 161 123 4567</span>
              </li>
              <li className="flex items-center gap-4 text-white/50 text-sm">
                <Mail className="w-4 h-4 text-[var(--primary)]" />
                <span>hello@steakz.co.uk</span>
              </li>
              <li className="flex items-start gap-4 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>Deansgate Square, Manchester M15 4UP</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-6 mt-10">
              {['Instagram', 'Twitter', 'LinkedIn', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href="#" 
                  className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 hover:text-[var(--primary)] transition-all"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
            © {currentYear} STEAKZ HOSPITALITY GROUP. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            {footerLinks.legal.map(link => (
              <Link key={link.name} to={link.path} className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold hover:text-white transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
