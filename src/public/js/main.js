$(function(){
    const socket = io();
    var nick = '';

    //Obtenemos los elementos del DOM
    
    const messageForm = $('#messages-form');
    const messageBox = $('#message');
    const chat = $('#chat');

    const nickForm = $('#nick-form');
    const nickError = $('#nick-error');
    const nickName = $('#nick-name');

    const userNames = $('#usernames');

    //Eventos

    messageForm.submit( e =>{
        //Evitamos que se recargue la pantalla:
        e.preventDefault();
        //Enviamos el evento que debe recibir el servidor:
        socket.emit('enviar mensaje', messageBox.val());
        //Limpiamos el input
        messageBox.val('');
    });

    //Obtenemos respuesta del servidor:
    socket.on('nuevo mensaje', function(datos){
        let color = 'bg-white';
        if(nick == datos.nick){
            color = 'bg-purple-300';
        }
        var fecha= new Date();
        var hora_actual = fecha.getHours()+ ":" +fecha.getHours();
        
        chat.append(`
        <div class="flex mb-12">
        <img src="assets/persona.png" class="self-end rounded-full w-12 mr-4">
        <div class="flex flex-col">
        <div class="${color} p-6 rounded-3xl rounded-bl-none w-96 shadow-sm mb-2">
            <p class="font-medium mb-1">${datos.nick}</p>
            <small class="inline-block text-gray-500 mb-1">${datos.msg}</small>
        </div>
        <small class="text-gray-500">${hora_actual}</small>
        </div>
        </div>
        `);

    });


    nickForm.submit( e =>{
        e.preventDefault();
        console.log('Enviando...');
        socket.emit('nuevo usuario', nickName.val(), datos =>{
            if(datos){
                nick = nickName.val();
                $('#nick-wrap').hide();
                $('#content-wrap').show();
            }else{
                nickError.html(`
                <div class="alert alert-danger">
                El usuario ya existe
                </div>
                `); 
            }
            nickName.val('');
        });

    });

    //Obtenemos el array de usuarios de sockets.js
    socket.on('usernames', datos =>{
        let html = '';
        let color = '#000';
        let salir = '';
        console.log(nick);
        for(let i = 0; i < datos.length; i++){
            if(nick == datos[i]){
                color = '#027f43';
                salir = `<a class="enlace-salir" href="/"><i class="fas fa-sign-out-alt salir"></i></a>`;
            }else{
                color = '#000';
                salir = '';
            }
            html += `
            <div class="mr-4 text-center self-center">
            <div class="relative w-12 mb-2">
                <img src="assets/persona.png" class="rounded-full">
                <div class="absolute bg-green-300 p-1 rounded-full bottom-0 right-0 border-2 border-gray-800"></div>
            </div>
            <small> ${datos[i]}</small>
        </div>
            
            `;
        }

        //<p style="color:${color}"><i class="fas fa-user"></i> ${datos[i]} ${salir}</p>

        userNames.html(html);
    });

});