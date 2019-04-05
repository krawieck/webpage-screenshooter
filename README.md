# Webpage Screenshooter

Tool mainly for video editors to get full-page screenshot of a website.

## How to install

The default route for most will be checking out the [releases page](https://github.com/krawieck/webpage-screenshooter/releases) where should the latest version be. Usually it's just zipped directory containing source code with nw.js executable. If there's no version for your system just go to "How to build yourself" section, it's actually pretty straightforward.

## How to build yourself

It's a node.js app so it's pretty easy.

Requirements:
* [node.js](https://nodejs.org/) (i have 10.12.0) installed
* [downloaded nw.js appropriate to your system](https://nwjs.io/downloads/)

Step-by-step instructions:
* clone this repository to a directory
* open terminal in this directory
* type `npm install` into the terminal; it will download necessary packages
* type `npm run build`  into the terminal 
* put all the contents from nwjs folder/zip to the directory
* run "nw.exe" or "nw" executable to open the program
* you can optionally rename nw.exe to something more pleasing, like screenshooter.exe
