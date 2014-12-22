module.exports = function(app) {

/* API routes */

// This is currently a testing stem of an endpoint that needs to be created
//to recieve and process username and deviceId POSTs.
// Currently, info arrives in the following format from the mobile app (as logged below):
// Got info {"username":"Meat puppet","deviceId":"B19A9282-3124-4A3D-A387-60B4E92F22AF"}

app.post('/api/username', function(req, res){

	// Per the note above, this is just logging requests
	console.log("Got info " + JSON.stringify(req.body));
	res.send("Got info " + JSON.stringify(req.body));
});


};
