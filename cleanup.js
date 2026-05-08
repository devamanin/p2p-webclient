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
  const tsPath = path.join('src/app/components', dir, dir + '.ts');
  const htmlPath = path.join('src/app/components', dir, dir + '.html');

  if (fs.existsSync(tsPath)) {
    let tsContent = fs.readFileSync(tsPath, 'utf8');
    
    // Remove imports
    tsContent = tsContent.replace(/import \{ Component, ElementRef, QueryList, ViewChildren, ViewChild, AfterViewInit, OnDestroy \} from '@angular\/core';/g, "import { Component } from '@angular/core';");
    
    // Remove class implements AfterViewInit, OnDestroy
    tsContent = tsContent.replace(/implements AfterViewInit, OnDestroy /g, '');
    
    // Remove the body of the class
    tsContent = tsContent.replace(/export class .*? \{[\s\S]*\}\s*$/m, (match) => {
        const className = match.match(/export class (\w+)/)[1];
        return "export class " + className + " {\n}\n";
    });
    
    fs.writeFileSync(tsPath, tsContent);
    console.log('Updated ' + tsPath);
  }

  if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Fix section pinning
    htmlContent = htmlContent.replace(/<section #pinSection class="[^"]*"[^>]*>/, '<section class="relative w-full bg-[#0E0E11] border-t border-white/5 py-24">');
    htmlContent = htmlContent.replace(/<div class="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">/, '<div class="w-full flex flex-col items-center justify-center relative">');
    
    // Make header normal
    htmlContent = htmlContent.replace(/<div #pinHeader class="absolute top-24 z-50 text-center px-6 transition-all duration-700 ease-out">/, '<div class="text-center px-6 mb-16 z-10">');
    
    // Fix features container
    htmlContent = htmlContent.replace(/<div class="relative w-full max-w-6xl h-\[75vh\] min-h-\[450px\] px-6 mt-20">/, '<div class="w-full max-w-6xl px-6 flex flex-col gap-8 z-10">');
    
    // Fix feature cards
    htmlContent = htmlContent.replace(/<div #featureCard class="feature-stack-card absolute inset-0 flex items-center justify-center" style="[^"]*">/g, '<div class="flex items-center justify-center bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden">');
    
    // Remove Scroll Indicator Dot entirely
    htmlContent = htmlContent.replace(/<!-- Scroll Indicator Dot -->[\s\S]*?<span class="text-\[10px\][^>]*>Scroll Through Features<\/span>\s*<\/div>/g, '');
    
    fs.writeFileSync(htmlPath, htmlContent);
    console.log('Updated ' + htmlPath);
  }
});
