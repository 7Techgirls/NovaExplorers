import { ACT, authenticate, execute } from "tl-api";
import { ArduinoIoTCloud } from 'arduino-iot-js';

const baseUrl = "http://192.168.4.1";

const { info, ...context } = await authenticate(baseUrl, {
  password: "5GeTpI7jTS8KRqHw"});

// Connect to arduino cloud

const client = await ArduinoIoTCloud.connect({
    deviceId: '88f3005f-6234-4c12-9740-1bc7195324b6',
    secretKey: 'JAQN5MN08WBPD8QXMKHR',
    onDisconnect: (message) => console.error(message),
});

// Function to retreive data from router
async function getInfo(key, values) {
    if(!info) return console.log(chalk.bgRed('Trying to getData while connection is not initiated'));
    const result = await execute(
        baseUrl,
        [
            [
                ACT.GL,
                key,
                [
                    ...values
                ],
            ],
        ],
        context
    );
    if(result.error != 0) return console.log(chalk.bgRed(`Encountered error ${result.error} while trying to get data usage`));
    //else show on the dashboard 
    return result;
}




async function reqsend() {

    // Running the function to retrieve data
    
    var Routerinfo = await getInfo('LAN_WLAN', ["SSID","BSSID","X_TP_Band","Enable"]);
    var Networkinfo = await getInfo('WAN_LTE_LINK_CFG', ["signalStrength", "networkType", "simStatus",  "ipv4"]);
    var Data = await getInfo('WAN_LTE_INTF_CFG', ["totalStatistics","curRxSpeed","curTxSpeed"]);
    var Users = await getInfo('LAN_HOST_ENTRY', ["IPAddress","hostName"]);

    // Data to send to arduino cloud
    var current_status = false;
    if(Routerinfo.actions[0].res.attributes.enable == '1'){
        current_status = true;
    }

    var ssid = Routerinfo.actions[0].res.attributes.SSID;
    var bssid = Routerinfo.actions[0].res.attributes.BSSID;
    var tp_band = Routerinfo.actions[0].res.attributes.X_TP_Band;
    var signalstrength = Networkinfo.actions[0].res[1].attributes.signalStrength;
    var networktype = Networkinfo.actions[0].res[1].attributes.networkType;
    var totalstatistics = Data.actions[0].res[1].attributes.totalStatistics;
    var uploadspeed = Data.actions[0].res[1].attributes.curRxSpeed;
    var downloadspeed = Data.actions[0].res[1].attributes.curTxSpeed;
    var ip_adress = Users.actions[0].res[2].attributes.IPAddress;
    var name = Users.actions[0].res[2].attributes.hostName;
    var ip_adress2 = Users.actions[0].res[0].attributes.IPAddress;
    var name2 = Users.actions[0].res[0].attributes.hostName;
    var ip_adress3 = Users.actions[0].res[1].attributes.IPAddress;
    var name3 = Users.actions[0].res[1].attributes.hostName;
    var ip_adress4 = Users.actions[0].res[3].attributes.IPAddress;
    var name4 = Users.actions[0].res[3].attributes.hostName;


    if ( Networkinfo.actions[0].res[1].attributes.networkType == '2') {
        networktype = "3G LTE";
    
        //  block of code to be executed if the condition is true
      } else {
        networktype = "4G LTE"
        //  block of code to be executed if the condition is false
      }




    // send values to arduino cloud
    console.log(current_status);
    console.log(ssid);
    console.log(bssid);
    console.log(tp_band);
    console.log(signalstrength * 25);
    console.log(networktype);
    console.log(ip_adress);
    console.log(name);
    console.log(ip_adress2);
    console.log(name2);
    console.log(ip_adress3);
    console.log(name3);
    console.log(ip_adress4);
    console.log(name4);
     
    
    //console.dir(Users, { depth: 10 });
    var signal_strenght = signalstrength * 25;
    console.log(totalstatistics / 1074000000,"GM");
    console.log(uploadspeed,"KB/S");
    console.log(downloadspeed,"KB/S");
    var data = (totalstatistics / 1074000000);

    client.sendProperty('current_status', current_status);
    client.sendProperty('ssid', ssid);
    client.sendProperty('bssid', bssid);
    client.sendProperty('tp_band', tp_band);
    client.sendProperty('signal_strenght',signal_strenght);
    client.sendProperty('networktype',networktype);
    client.sendProperty('data',data);
    client.sendProperty('uploadspeed',uploadspeed);
    client.sendProperty('downloadspeed',downloadspeed);
    client.sendProperty('ip_adress',ip_adress);
    client.sendProperty('name',name);
    client.sendProperty('ip_adress2',ip_adress2);
    client.sendProperty('name2',name2);
    client.sendProperty('ip_adress3',ip_adress3);
    client.sendProperty('name3',name3);
    client.sendProperty('ip_adress4',ip_adress4);
    client.sendProperty('name4',name4);
}

setInterval(reqsend, 1000);



console.log("SKYLINKER IS ON!")
