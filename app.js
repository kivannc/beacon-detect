const Noble = require("noble");
const BeaconScanner = require("node-beacon-scanner");
const _ = require("lodash");
var scanner = new BeaconScanner(Noble);

var beacons = [];

scanner.onadvertisement = (advertisement) => {
    var beacon = advertisement["iBeacon"];
    beacon.rssi = advertisement["rssi"];
    beacon.deviceId = "Raspberry";
    var beaconData = {
        id : beacon.minor,
        rssi : beacon.rssi,
        txPower : beacon.txPower
    }
    beacons.push(beaconData);
};

scanner.startScan().then(() => {
    console.log("Scanning for BLE devices...")  ;
}).catch((error) => {
    console.error(error);
});

function sendData() {
    var groupedBeacons = _.groupBy(beacons, "id");
    var keys = Object.keys(groupedBeacons);
    var beaconsWithMean = {};
    beaconsWithMean.id = "Node1",
    beaconsWithMean.beacons = [];
    keys.forEach(key => {
        var beaconsArray = groupedBeacons[key];
        var rssiMean = _.meanBy(beaconsArray, "rssi");
        var txPowerMean = _.meanBy(beaconsArray, "txPower");
        beaconsWithMean.beacons.push({
            id : key,
            rssi : Math.floor(rssiMean),
            txPower : Math.floor(txPowerMean),
            distance : calculateDistance(rssiMean)
        });
        //send with post in here
	console.log(beaconsWithMean)
	beacons = [];
    });

}

var interval = setInterval(sendData,5000);



function calculateDistance(rssi) {
  
    var txPower = -59 //hard coded power value. Usually ranges between -59 to -65
    
    if (rssi == 0) {
      return -1.0; 
    }
  
    var ratio = rssi*1.0/txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio,10);
    }
    else {
      var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
      return distance;
    }
  } 