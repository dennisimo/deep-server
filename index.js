'use strict'

var fs = require('fs')
var http = require('http')
var os = require('os')
var interfaces = os.networkInterfaces()

module.exports = (function () {
  var cipher = ['E','R','T','Y','U','I','D','F','G','H','J','X','C','V','B','N']

  return {
    createServer: createServer
  }

  function announce (address, config) {
    var message = '\nDeep Server\n' + '  Passcode: ' + encode(address) + '\n    Target: http://' + address + ':' + config.portNumber + '/' + config.path
    console.log(message)
  }

  function createServer (config) {
    var address = getAddress()
    config = config ? JSON.parse(config) : isValid(JSON.parse(fs.readFileSync(configFile, 'utf-8')))
    if (config && address) {
      http.createServer(function (req, res) {
        res.setHeader('Content-Type', 'application/json')
        res.writeHead(200, {'Access-Control-Allow-Origin': '*'})
        res.write(JSON.stringify(config))
        res.end()
      }).listen(1941)

      announce(address, config)
    } else {
      var err = function () {
        if (! address) {
          return 'Your machine is not connected to a network.'
        }
        if (! config) {
          return 'Your configuration is invalid.'
        }
      }
      console.log('Deep Server\n ', err())
    }
  }

  function encode (address) {
    var blocks = address.split('.')
    var characters = []
    if (blocks[0] === '172') {
      characters.push(cipher[blocks[1] - 16])
      blocks = blocks.splice(2, blocks.length)
    } else {
      if (blocks[0] === '192') {
        blocks = blocks.splice(1, blocks.length)
      }
      blocks = blocks.splice(1, blocks.length)
    }

    blocks.forEach(function (block) {
      var hex = parseInt(block, 10).toString(16)
      hex = hex.length < 2 ? '0' + hex : hex
      hex = hex.split('')
      hex.forEach(function (character) {
        characters.push(cipher[parseInt(character, 16)])
      })
    })
    return characters.join('')
  }

  function getAddress () {
    var values = Object.keys(interfaces).map(function (name) {
      return interfaces[name];
    })
    values = [].concat.apply([], values).filter(function (val) { 
      return val.family == 'IPv4' && val.internal == false
    })
    return values.length ? values[0].address : undefined
  }

  function isValid (config) {
    if (config.path && config.portNumber) {
      return config
    } else {
      return undefined
    }
  }
}())
