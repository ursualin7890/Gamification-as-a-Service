var http = require('http');
var requestHandler = require('./src/core/requestHandler')

http.createServer(requestHandler).listen(8081, () => {
    // TODO: Try catch
    console.log("Server-ul ruleaza pe port-ul 8081...");
});
