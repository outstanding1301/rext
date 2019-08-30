#!/usr/bin/env node

const request = require('request');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const readline = require('readline');
const unzip = require('unzip');
const execNpmInstall = require('exec-npm-install')

let appname = undefined;
let author = undefined;

if(process.argv.length === 2){
  console.log('\n\x1b[32m  [ RExT 🦖 ] - React + Express Template\x1b[0m\n');
  const rl = readline.createInterface(process.stdin, process.stdout);

  rl.question('app name: \x1b[33m', (_appname) => {
    appname = _appname.toString().trim().toLowerCase().replace(' ', '-');
    console.log('\x1b[0mapp name:[\x1b[36m'+appname+'\x1b[0m]');
    rl.question('author: \x1b[33m', (_author) => {
      author = _author.toString().trim().toLowerCase().replace(' ', '-');
      console.log('\x1b[0mauthor:[\x1b[36m'+author+'\x1b[0m]');
      createApp(appname, author);
      rl.close();
    })
  });
}
else if(process.argv.length === 3){
  if (process.argv[2].startsWith("-") || process.argv[2].startsWith("--")){
    const cmd = process.argv[2];
    if(cmd === "-v" || cmd === "--version"){
      const pkgjs = require(process.cwd()+'/package.json');
      console.log(pkgjs.version);
      return;
    }
  }
  console.log('\n\x1b[32m  [ RExT 🦖 ] - React + Express Template\x1b[0m\n');
  const rl = readline.createInterface(process.stdin, process.stdout);

  appname = process.argv[2];
  appname = appname.toString().trim().toLowerCase().replace(' ', '-');
  console.log('\x1b[0mapp name:[\x1b[36m'+appname+'\x1b[0m]');
  rl.question('author: \x1b[33m', (_author) => {
    author = _author.toString().trim().toLowerCase().replace(' ', '-');
    console.log('\x1b[0mauthor:[\x1b[36m'+author+'\x1b[0m]');
    createApp(appname, author);
    rl.close();
  })
}
else if(process.argv.length === 4){
  console.log('\n\x1b[32m  [ RExT 🦖 ] - React + Express Template\x1b[0m\n');

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
