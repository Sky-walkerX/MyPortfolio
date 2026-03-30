const fs = require('fs');
const file = '/home/skywalker/Coding/WebDev/Projects/portfolio/MyPortfolio/client/src/sections/About.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldHeader = `header={
            <img
              src="assets/undraw_dev-productivity_5wps.svg"
              alt="grid-1"
              className="w-full sm:h-[276px] h-fit object-contain"
              style={{ marginBottom: '80px', marginTop: '55px' }}
            />
          }`;

const newHeader = `header={
            <div className="flex justify-center items-center w-full sm:h-[276px] h-fit" style={{ marginBottom: '80px', marginTop: '55px' }}>
              <img
                src="assets/profile.png"
                alt="Naman Khandelwal"
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover border-4 border-[var(--palette-mid-purple)] shadow-[0_0_20px_rgba(83,92,145,0.5)]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "assets/undraw_dev-productivity_5wps.svg";
                  e.target.className = "w-full sm:h-[276px] h-fit object-contain";
                }}
              />
            </div>
          }`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync(file, content);
console.log("Updated About.jsx");
