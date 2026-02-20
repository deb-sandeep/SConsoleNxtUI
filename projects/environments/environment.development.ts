const serverHost = '192.168.0.195' ;
const serverPort = '8080' ;

export const environment = {
  production:false,
  serverHost: serverHost,
  serverPort: serverPort,
  apiRoot:`http://${serverHost}:${serverPort}`,
  wsRoot:`ws://${serverHost}:${serverPort}`
};
