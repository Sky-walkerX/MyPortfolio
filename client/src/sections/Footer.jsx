const Footer = () => {
  return (
    <footer className="c-space pt-7 pb-3 border-t border-black-300 flex justify-between items-center flex-wrap gap-5">
      {/* Policies */}
      <div className="text-white-500 flex gap-2">
        <p>Terms & Conditions</p>
        <p>|</p>
        <p>Privacy Policy</p>
      </div>

      {/* Social Icons */}
      <div className="flex gap-3 z-50 opacity-50">
        <a href="https://github.com/Sky-walkerX" target="_blank" rel="noopener noreferrer" className="social-icon">
          <img src="/assets/github.svg" alt="github" className="w-1/2 h-1/2" />
        </a>
        <a href="https://twitter.com/NamanKh07423765" target="_blank" rel="noopener noreferrer" className="social-icon">
          <img src="/assets/icons8-twitter.svg" alt="twitter" className="w-1/2 h-1/2" />
        </a>
        <a href="https://www.linkedin.com/in/naman-khandelwal-53161829a/" target="_blank" rel="noopener noreferrer" className="social-icon">
          <img src="/assets/linkedin-svgrepo-com.svg" alt="linkedin" className="w-1/2 h-1/2" />
        </a>
      </div>

      {/* Copyright */}
      <p className="text-white-500">© 2025 Naman Khandelwal. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
