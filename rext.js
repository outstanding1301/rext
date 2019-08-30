#!/usr/bin/env node

const request = require('request');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const unzip = require('unzip');
const execNpmInstall = require('exec-npm-install')

let appname = undefined;
let author = undefined;

console.log('\n\x1b[32m  [ RExT 🦖 ] - React + Express Template\x1b[0m\n');

if(process.argv.length === 2){
  process.stdout.write('app name: \x1b[33m');
  const stdin = process.openStdin();
  stdin.addListener('data', d => {
    appname = d.toString().trim().toLowerCase().replace(' ', '-');
    console.log('\x1b[0mapp name:[\x1b[36m'+appname+'\x1b[0m]');

    process.stdout.write('author: \x1b[33m');
    const stdin2 = process.openStdin();
    stdin2.addListener('data', d => {
      author = d.toString().trim().toLowerCase().replace(' ', '-');
      console.log('\x1b[0mauthor:[\x1b[36m'+author+'\x1b[0m]');
      createApp(appname, author);
      stdin2.pause();
    })
    createApp(appname);
    stdin.pause();
  })
}
else if(process.argv.length === 3){
  appname = process.argv[2];
  appname = appname.toString().trim().toLowerCase().replace(' ', '-');
  console.log('\x1b[0mapp name:[\x1b[36m'+appname+'\x1b[0m]');
  process.stdout.write('author: \x1b[33m');
  const stdin = process.openStdin();
  stdin.addListener('data', d => {
    author = d.toString().trim().toLowerCase().replace(' ', '-');
    console.log('\x1b[0mauthor:[\x1b[36m'+author+'\x1b[0m]');
    createApp(appname, author);
    stdin.pause();
  })
}
else if(process.argv.length === 4){
  appname = process.argv[2];
  author = process.argv[3];
  appname = appname.toString().trim().toLowerCase().replace(' ', '-');
  author = author.toString().trim().toLowerCase().replace(' ', '-');
  console.log('\x1b[0mapp name:[\x1b[36m'+appname+'\x1b[0m]');
  console.log('\x1b[0mauthor:[\x1b[36m'+author+'\x1b[0m]');
  createApp(appname, author);
}

function createApp(appname, author){
  const dir = path.join(process.cwd(), appname)
  if (fs.existsSync(dir)){
    console.log(`directory [${appname}] already exists!`)
  }
  else{
    fs.mkdirSync(dir);
    console.log("downloading REXT file...")
    request('https://github.com/outstanding1301/react-express-template/archive/master.zip')
      .pipe(fs.createWriteStream(dir+"/.rext"))
      .on('close', function () {
        console.log('DONE!');
        console.log('unpacking REXT file...')

        fs.createReadStream(dir+"/.rext").pipe(unzip.Extract({ path: dir })).on('close', function () {

          fs.readdirSync(dir+'/react-express-template-master').forEach(file => {
            fs.renameSync(dir+'/react-express-template-master/'+file, dir+"/"+file)
          })
          fs.unlinkSync(dir+'/.rext')
          fs.rmdirSync(dir+'/react-express-template-master')
          console.log('DONE!')

          const cp = require('child_process');

          const package = JSON.parse(fs.readFileSync(dir+'/package.json'))
          package.name = appname;
          package.author = author;

          const beuti = JSON.stringify(package, undefined, 2);
          fs.writeFileSync(dir+'/package.json', beuti)

          console.log('now install npm modules!')
          const npm = cp.spawn('npm', ['install', '--prefix='+dir], {env: process.env, stdio: 'inherit', detached:true})

          npm.on('close', function (code){
            if(code === 0) {
              console.log('\n\n\n\x1b[32m ✨successfully RExTed!! 🦖 \x1b[0m\n');
              console.log('🔥 USAGE')
              console.log(' - npm run dev : run react client and express server for development!')
              console.log(' - npm run build : build react client to static file!')
              console.log(' - npm run start : run server for service! (build first!)')
              console.log('\n🔥 TIP')
              console.log(' - for development : npm run dev')
              console.log(' - for service : npm run build && npm run start')

              console.log("\n > 'cd "+appname+"' and enjoy REX! 🦖")
              npm.unref();
            }
            else{
              console.log("ERROR")
            }
          });
        });
      });

  }
}
