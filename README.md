# Proximate.io

> Automated attendance tracking for your space

## Team

  - __Product Owner__: Sebastian Tonkin
  - __Scrum Master__: rotating between dev team members
  - __Development Team Members__: [Avi Dunn](https://github.com/aggfr12), [Derek Barncard](https://github.com/renderf0x), [Valentyn Boginskey](https://github.com/vboginskey), [Sebastian Tonkin](https://github.com/sgtonkin)

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

> (In progress) Planned features include iBeacons (Etimotes), a backend in Node.js, frontend in Angular.js, a mobile app for iOS in Swift, and a real-world feedback system built using Tessel. You'll likely need all of these bits to run properly.

## Requirements

- Node 0.10.x
- MySQL x.x.x
- etc
- etc

## Development

### Installing Dependencies

From within the root directory:

```sh
sudo npm install -g bower
npm install
bower install
```

### Setting up mobile builds

Install ionic, dependencies, plugins, and add platforms:

```sh
npm install ionic-cli -g
npm install cordova-icon -g
npm install cordova-splash -g
cd proximate/mobile
ionic plugin add https://github.com/petermetz/cordova-plugin-ibeacon.git
ionic plugin add https://github.com/jcesarmobile/IDFVPlugin.git
cordova plugin add https://github.com/katzer/cordova-plugin-local-notifications.git && cordova prepare
ionic platform add ios
ionic platform add android
```

then run the following to build:

```sh
cd proximate/mobile
ionic build
```

The `icon.png` and `splash.png` files in the mobile root should be edited to fit your brand, and will update with all platform-specific images on build.

### Testing

```sh
gulp test
```

### Roadmap

Project roadmap is currently hosted on [Asana](http://www.asana.com)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
