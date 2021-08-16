require('dotenv').config()
require('colors');

const { leerInput,inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require('./models/busquedas');

const main = async() =>{

    const busquedas = new Busquedas();

    let opcion;

    do {
        
        opcion = await inquirerMenu();

        switch(opcion){
            case 1:
                //mostrar mensaje para que la persona escriba
                const termino = await leerInput('Ciudad:');
                const lugares = await busquedas.ciudad(termino);
                const id = await listarLugares(lugares);
                if (id === '0') continue;
                //Guardar en db
                const lugarSel = lugares.find( l => l.id === id);
                busquedas.agregarHistorial(lugarSel.nombre);
                


                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
                //buscar los lugares 
                //Seleccionar el lugar
                //Datos del clima de la ciudad seleccionada
                //mostrar resultadosd
                console.log('\nInformacion de la ciudad\n'.bold );
                console.log('Ciudad:', lugarSel.nombre.green);
                console.log('Lat:', lugarSel.lat);
                console.log('Lng:', lugarSel.lng);
                console.log('Temperatura:'.bold, clima.temp, '°C'.yellow);
                console.log('Minima:'.bold, clima.min, '°C'.yellow);
                console.log('Maxima:'.bold, clima.max, '°C'.yellow);
                console.log('Como esta el clima?', clima.desc.bold);
            break;

            case 2:
                busquedas.historialCapitalizado.forEach( (lugar,i) =>{
                    const idx = `${ i + 1}`.green;
                    console.log( `${idx} ${lugar}`);
                })            
            break;
            
        } 

        if (opcion!== 0)  await pausa();

    }while(opcion !== 0);

   

    
}

main();
  