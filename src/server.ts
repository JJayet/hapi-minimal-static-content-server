"use strict"
import * as inert from 'inert'
import * as Hapi from 'hapi'
import * as path from 'path'

export class Server {
  nodePort: number
  httpServer: Hapi.Server

  constructor(port: number) {
    this.nodePort = port
    this.httpServer = new Hapi.Server()
  }

  onStart(done?: () => void) {

    this.httpServer.connection({
      port: this.nodePort,
      host: process.env.HOST || '0.0.0.0',
      routes: {
        cors: true,
        files: {
          relativeTo: path.join(__dirname, '../public')
        }
      }
    })

    this.httpServer
      .register([inert])
      .then(() => {

        this.httpServer.route({
          method: 'GET',
          path: '/{params*}',
          handler: {
            directory: {
              path: '.',
              lookupCompressed: true,
              defaultFilePath: 'index.html'
            }
          }
        })

        this.httpServer.start(err => {
          if (err) throw err
          else {
            console.log(`Listening on port ${this.nodePort}`)
            if (done) done()
          }
        })
      })
      .catch(err => {
        console.log(`An error occured during launch : ${err}`)
        process.exit(1)
      })

    return this.httpServer
  }

  close() {
    this.httpServer.stop()
  }
}

function start() {
  const portNumber = process.env.PORT || 8000
  const server = new Server(portNumber)
  server.onStart()
}

start()
