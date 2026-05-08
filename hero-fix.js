const fs = require('fs');
const path = require('path');

const dirs = [
  'landing',
  'omegle-alternative',
  'chatroulette-alternative',
  'monkey-app-alternative',
  'ogtv-alternative',
  'omegle-india',
  'ometv-alternative',
  'random-chat',
  'video-chat-with-girls',
  'video-chat-with-strangers'
];

dirs.forEach(dir => {
  const htmlPath = path.join('src/app/components', dir, dir + '.html');

  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Replace the main tag
    htmlContent = htmlContent.replace(
      /<main class="w-full min-h-screen shrink-0 flex flex-col items-center justify-center text-center px-4 relative pt-20">/, 
      '<main class="w-full shrink-0 flex flex-col items-center text-center px-4 relative pt-40 pb-24">'
    );
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('Updated Hero in ' + htmlPath);
  }
});
