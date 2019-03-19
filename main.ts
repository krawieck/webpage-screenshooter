console.log(process.argv)
if (process.argv[2] == 'cli') {
  let args = process.argv
  args.splice(2,1)
  console.log(args)
  console.log('cli version aint ready yet, sry guyz');
  
} else {
  console.log('starting gui version of the app (if you wanna use cli pass "cli" as a first argument)')
  const Screenshooter = require('./screenshooter')
  // let shotter = 
}
