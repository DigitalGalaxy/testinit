This is a skeleton for AEM projects. There are two main names to be replaced.

`testinit` should be replaced with safe project name. Usually hyphen separated. Example: 'rituxan-ra'

`test test` would be replaced with a human readable name. Example: 'Rituxan RA'

The base readme is as follows:
========

test test
========

This project uses SASS for CSS complication. Node.js is needed:

**Setup**

`npm install -g gulp`

`npm install`

Building
--------

This project uses Maven for building. Common commands:

First, ensure the SASS CSS is built

From the root directory, run ``mvn -PautoInstallPackage clean install`` to build the bundle and content package and install to a CQ instance.

Specifying CRX Host/Port
------------------------

The CRX host and port can be specified on the command line with:
mvn -Dcrx.host=otherhost -Dcrx.port=5502 <goals>

Front End Development
---------------------

Uses [gulp](https://github.com/gulpjs/gulp) to speed up local frontend development. To use, make sure you have gulp install globally, and install the dependencies.

**Usage**

`gulp local`

Watches css, less, js, jsp files for changes, upload to your local server's JCR

[More info](https://github.com/meltmedia/aem-tools/tree/develop/gulp)
