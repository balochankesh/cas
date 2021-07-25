import React from "react";
import {View,Button,Platform,PermissionsAndroid,Linking,Text,TouchableOpacity,Alert,NativeModules, NativeEventEmitter} from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { getUniqueId,getMacAddress, getManufacturer } from 'react-native-device-info';
import BleManager from 'react-native-ble-manager';
import { RNCamera } from 'react-native-camera';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default class App extends React.Component{

    constructor() {
        super();
        this.state = {
            is_scanning: false,
            peripherals: null,
            connected_peripheral: null,
            user_id: null,
            attendees: null,
            promptVisible: false,
            has_attended: false,
            mac: "",
            color: "white",
            message: "scan",

        }


        this.peripherals = [];


        this.startScan = this.startScan.bind(this);
      }

    UNSAFE_componentWillMount() {
      BleManager.enableBluetooth()
        .then(() => {
          console.log('Bluetooth is already enabled');
        })
        .catch((error) => {
          Alert.alert('You need to enable bluetooth to use this app.');
        });

     
      BleManager.start({showAlert: false})
      .then(() => {
        console.log('Module initialized');
      });

        if(Platform.OS === 'android' && Platform.Version >= 23){
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
          if(!result){
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
              if(!result){
                Alert.alert('You need to give access to coarse location to use this app.');
              }
            });
          }
      });
    }
    }

    componentDidMount() {

      bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {

        var peripherals = this.peripherals;
    
        var el = peripherals.filter((el) => {
          return el.id === peripheral.id;
        });

        if(!el.length){
          peripherals.push({
            id: peripheral.id,
            name: peripheral.name
          });
          this.peripherals = peripherals;
        }
      });



        bleManagerEmitter.addListener(
          'BleManagerStopScan',
          () => {
            console.log('scan stopped');
            if(this.peripherals.length == 0){
              Alert.alert('Nothing found', "Sorry, no peripherals were found");
            }
            this.setState({
              is_scanning: false,
              peripherals: this.peripherals
            });  
          }
        );
    }

    startScan() {
      this.peripherals = [];
      this.setState({
        is_scanning: true
      });

      BleManager.scan([], 10)
      .then(() => { 
        console.log('scan started');
      });

    }


    ifScanned = e =>{
        
        getMacAddress().then(mac => {
            try{

                fetch(`https://starlordb.pythonanywhere.com/post/${mac}/${e.data}`)
                    .then(res => res.json())
                    .then(data => this.setState({
                        color: data.color,
                        message: data.message
                }));
                console.log(mac,this.state);
            }
            catch(err){
                
                this.setState({
                    message: "scan again",
                    color: "yellow"
                })
            }
});}
    render(){
        return(
            <View>
            <View>
            <QRCodeScanner
                onRead = {this.ifScanned}
                reactivate={true}
                permissionDialogMessage="camera permission"
                reactivateTimeout={100}
                showMarker={true}
                cameraProps={{zoom: 0.3,autoFocus: RNCamera.Constants.AutoFocus.on}}
                markerStyle={{border:"#ffffff",borderRadius:4}}
                bottomContent={
                    <TouchableOpacity>
                    <Text style={{fontSize:21,color:"rgb(0,122,225)"}}>
                    </Text>
                    </TouchableOpacity>
                
                }

                />

            </View>
            <View style = {{
                "backgroundColor": this.state.color,
                "height":"30%",
                    "justifyContent":"center",
                "alignItems":"center"
            }}
            >
            <Text style = {{
                "fontSize":40,
            }}>{this.state.message}</Text>
            </View>
            </View>
        )
    }

}
