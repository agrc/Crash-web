# Crash-web
The website for crash
Essentially we are looking for something that contains the same functionality as
http://share.flairbuilder.com/?shid=CeHFy2R943

## Installing
1. Make sure Web Deploy 3.5 is installed via Web Platform Installer
1. Make sure ssh is installed and configured on the machine to be deployed to.
1. Create `c:\inetpub\wwwroot\crash` folder
1. Create `c:\inetpub\crash\api` folder
1. Create `api` application inside `crash` folder in IIS with a 4.0 app pool pointed at the crash\api folder.
1. Web Deploy
1. Update `secrets.json`
1. `grunt build-{configuration}` and `grunt deploy-{configuration}`
1. publish mxd as `Crash/Crashes`
1. set `{"standardizedQueries": "false"}` in system > properties on the admin panel.
1. restart server process if the prior wasn't set.

## Testing Url
[http://test.mapserv.utah.gov/crash](http://test.mapserv.utah.gov/crash)
