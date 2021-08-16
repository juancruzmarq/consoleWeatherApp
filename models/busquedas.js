const fs = require('fs');
const axios   = require("axios");

class Busquedas{

    historial = [];

    dbPath = './db/database.json';

    constructor(){
        //TODO leer DB si existe 
        this.leerDB();
    }

    get paramsMapBox(){
        return { 
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather(){
        return{
            appid: process.env.OPENWEATHER_KEY,
            lang: 'es',
            units: 'metric',
        }
    }

    get historialCapitalizado(){
        //Capitalizar cada palabra

        return this.historial.map( lugar =>{
            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1));

            return palabras.join(' ');
        });
    }

    async ciudad (lugar = '') {
        //peticion http
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapBox
            });
            
            const resp = await instance.get();

            //const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/Cordoba.json?access_token=pk.eyJ1IjoianVhbmNydXptYXJxIiwiYSI6ImNrc2JhNGx6NDAxOG0yeW5xY2Y4cjg0c3QifQ.2M7bzIF3ipGMJvZVrR08UQ&limit=5&language=es');
            return resp.data.features.map( lugar =>({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));
            
        }catch (error){
            return [];
        }   
    }

    async climaLugar (lat,lon){
        try{

            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon }
            });

            const resp = await instance.get();
            const {weather, main} = resp.data;

            return{
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp

            };

            //eturn resp.data.features.map( l

        }catch (error){
            console.log(error);
            console.log('No se encontro la ciudad');
        }     
    }

    agregarHistorial(lugar=''){
        //TODO: prevenir duplicados
        if(this.historial.includes(lugar.toLowerCase())){
            return;
        }

        this.historial = this.historial.splice(0,4);

        this.historial.unshift(lugar.toLowerCase());
        //Grabar en DB
        this.guardarDB();
    }

    guardarDB(){
        const payload = {
            historial: this.historial
        };

        fs.writeFileSync( this.dbPath, JSON.stringify(payload));     
            
    }
    leerDB(){
        if(!fs.existsSync(this.dbPath) )return;

        const info = fs.readFileSync( this.dbPath, { enconding: 'utf-8'});
        const data = JSON.parse(info);
        this.historial = data.historial;
    }
}

module.exports = Busquedas;