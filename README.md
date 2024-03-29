# Crash-web

main [![prod firebase deploy](https://github.com/agrc/Crash-web/actions/workflows/nodejs.yml/badge.svg?branch=main)](https://github.com/agrc/Crash-web/actions/workflows/nodejs.yml)
dev [![dev firebase deploy](https://github.com/agrc/Crash-web/actions/workflows/nodejs.yml/badge.svg?branch=dev)](https://github.com/agrc/Crash-web/actions/workflows/nodejs.yml)

View vehicle crashes for Utah with all of the metadata to view problem areas, identify trends, and perform analysis.

## Installing

1. Update `appsettings.json`

    ```json
    {
      "ConnectionStrings": {
        "main": ""
      }
    }
    ```

1. `npm run build` or `npm run build:prod`
1. publish mxd as `Crash/Crashes`
1. set `{"standardizedQueries": "false"}` in system > properties on the admin panel.
   - restart server process if standardized queries wasn't set.

## Urls

- [dev](http://crashmapping.dev.utah.gov)
- [prod](http://crashmapping.utah.gov)
