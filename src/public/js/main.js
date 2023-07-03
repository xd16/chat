$(function() {
    const socket = io();
    var mostrarmensajes;
    var nick = '';
    var archiv
    var img


    var imagen = false
    var archivo = false

    const messageForm = $('#messages-form');
    const messageBox = $('#message');
    const chat = $('#chat');
    const nickForm = $('#nick-form');
    const nickError = $('#nick-error');
    const nickName = $('#nick-name');
    const password = $('#password');
    const userNames = $('#usernames');
    const divElement = document.querySelector('.flex.mb-12');
    divElement.style.display = 'none';
    const pElement = document.querySelector('.font-medium.mb-1');
    const smallElement = document.querySelector('.inline-block.text-gray-500.mb-1');
    const smallTextElement = document.getElementById('time');
    const fileInput = document.getElementById('myFileInput');
    const openModalBtn = document.getElementById('open-modal-btn');
    const cameraModal = document.getElementById('camera-modal');
    const closeModalBtn = cameraModal.querySelector('.close');
    const cameraVideo = document.getElementById('camera-video');
    const captureBtn = document.getElementById('capture-btn');
    const capturedImageCanvas = document.getElementById('captured-image');
    const imagenLogin = document.getElementById('loginImagen');


    // Agregar evento de clic al botón para cerrar el modal
    closeModalBtn.addEventListener('click', closeModal);
    openModalBtn.addEventListener('click', openModal);
    captureBtn.addEventListener('click', captureImage);
    imagenLogin.addEventListener('click', cargarImagen);


    function cargarImagen() {
        if (password.val() !== '' && password.val() !== undefined) {
        document.getElementById("perfil").src = password.val();
        }
     }
    
    // Función para abrir el modal
    function openModal() {
      cameraModal.style.display = 'block';
      startCamera();
    }

    // Función para cerrar el modal
    function closeModal() {
      cameraModal.style.display = 'none';
      stopCamera();
    }

    // Función para iniciar la cámara
    function startCamera() {
      // Verificar si el navegador admite la API de MediaDevices
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Obtener acceso a la cámara del dispositivo
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(function(stream) {
            // Mostrar el stream de la cámara en el elemento de video
            cameraVideo.srcObject = stream;
          })
          .catch(function(error) {
            console.error('Error al acceder a la cámara:', error);
          });
      } else {
        console.error('El navegador no admite la API de MediaDevices');
      }
    }



    // Función para detener la cámara
    function stopCamera() {
      // Obtener el stream de la cámara
      const stream = cameraVideo.srcObject;
      if (stream) {
        // Detener el stream y limpiar el srcObject
        const tracks = stream.getTracks();
        tracks.forEach(function(track) {
          track.stop();
        });
        cameraVideo.srcObject = null;
      }
    }

    function captureImage() {
        // Obtener el contexto del canvas y capturar la imagen como datos binarios
        const context = capturedImageCanvas.getContext('2d');
        capturedImageCanvas.width = cameraVideo.videoWidth;
        capturedImageCanvas.height = cameraVideo.videoHeight;
        context.drawImage(cameraVideo, 0, 0, cameraVideo.videoWidth, cameraVideo.videoHeight);
        const imageDataURL = capturedImageCanvas.toDataURL('image/jpeg');
        var imm = localStorage.getItem('login');
        imm = JSON.parse(imm);
        var login ={ 
            nick: imm.nick,
            password: imm.password,
            imagenURL:imageDataURL
        }
        img = imageDataURL
        // Emitir un evento 'enviar imagen' con los datos binarios de la imagen
        socket.emit('enviar imagen', login);
        imagen = true
        // Cerrar el modal
        closeModal();
      }

    
      fileInput.addEventListener('change', () => { debugger
        const messageInput = document.getElementById('message');
        messageInput.value = fileInput.files[0].name;
        mostrarmensajes = fileInput;
        archivo = true
        if (fileInput.files[0]) {
          archiv = URL.createObjectURL(mostrarmensajes.files[0]);
          localStorage.setItem('archivURL', archiv);
        }
        socket.emit('archivo recibido', { mostrarmensajes: mostrarmensajes });
       
      });


      function verificarExtension(archivo) { debugger
        if (archivo.imagenURL) {
            return false;
        }
        const extensionesPermitidas = ["xlxs", "pdf", "docx"];
        const nombreArchivo = archivo.toLowerCase(); // Convertir a minúsculas para una comparación sin distinción de mayúsculas/minúsculas
      
        for (let extension of extensionesPermitidas) {
          if (nombreArchivo.includes(extension)) {
            return true;
          }
        }
      
        return false;
      }

    messageForm.submit(e => {
      e.preventDefault();
      socket.emit('enviar mensaje', messageBox.val());
      messageBox.val('');
    });
  
    socket.on('nuevo mensaje', function(datos) {  debugger
      let color = 'bg-white';
      var fecha = new Date();
      var hora_actual = fecha.getHours() + ":" + fecha.getMinutes();

      var loginJSON = localStorage.getItem('login');
      var login = JSON.parse(loginJSON);

      if (nick == datos.nick.nick) {
        color = 'bg-purple-300';
      }
        if (archivo || verificarExtension(datos.msg) ) {
            if (mostrarmensajes.type == "file") {
                const fileType = mostrarmensajes.files[0].type;
                const iconClass = getIconClass(fileType);
                const storedArchivURL = localStorage.getItem('archivURL');
                const archivURL = storedArchivURL || '';
                var url =  datos.nick.password

                chat.append(`
                <div class="flex mb-12">
                <img src="assets/fantasma.jpg" id="chatImg" class="self-end rounded-full w-12 mr-4">
                <div class="flex flex-col">
                  <div class="${color} p-6 rounded-3xl rounded-bl-none w-96 shadow-sm mb-2">
                    <p class="font-medium mb-1">${datos.nick.nick}</p>
                    <a href="${archivURL}" target="_blank" >${datos.msg} <i class="${iconClass}"></i></a>
                  </div>
                  <small class="text-gray-500">${hora_actual}</small>
                </div>
              </div>
                `);            
                document.getElementById("chatImg").src = url;
                archivo = false
              }
        } else if (imagen || datos.msg.imagenURL) {
                var url =  datos.nick.password
                chat.append(`
                <div class="flex mb-12">
                <img src="assets/fantasma.jpg" id="chatImg" class="self-end rounded-full w-12 mr-4">
                <div class="flex flex-col">
                  <div class="${color} p-6 rounded-3xl rounded-bl-none w-96 shadow-sm mb-2">
                    <p class="font-medium mb-1">${datos.nick.nick}</p>
                    <img src="${datos.msg.imagenURL}" alt="Imagen recibida">
                  </div>
                  <small class="text-gray-500">${hora_actual}</small>
                </div>
              </div>
                `);
                document.getElementById("chatImg").src = url;   
               
        } else {
            var url = datos.nick.password;
            var nic = datos.nick.nick;
          if (true) {
            chat.append(`
            <div class="flex mb-12">
              <img src="" id="chatImg${nic}" class="self-end rounded-full w-12 mr-4">
              <div class="flex flex-col">
                <div class="${color} p-6 rounded-3xl rounded-bl-none w-96 shadow-sm mb-2">
                  <p class="font-medium mb-1">${datos.nick.nick}</p>
                  <small class="inline-block text-gray-500 mb-1">${datos.msg}</small>
                </div>
                <small class="text-gray-500">${hora_actual}</small>
              </div>
            </div>
          `);
          }
            document.getElementById(`chatImg${nic}`).src = url;
          }
          
  
      divElement.style.display = 'block'; 
      if (imagen || datos.msg.imagenURL) {
            smallElement.textContent = 'Envio un foto...';
            imagen = false
      }else{
      smallElement.textContent = datos.msg;
      }
      pElement.textContent = datos.nick.nick;
      smallTextElement.textContent = hora_actual;
      mostrarmensajes = undefined
      img = undefined
    });



    socket.on('archivo recibido', (data) => {
        const { name, size, fileURL } = data;
      
        // Muestra la información del archivo recibido en el chat
        const color = 'bg-white';
        const fecha = new Date();
        const hora_actual = fecha.getHours() + ":" + fecha.getMinutes();
      
        const archivoHTML = `
          <div class="flex mb-12">
            <img src="assets/fantasma.jpg" class="self-end rounded-full w-12 mr-4">
            <div class="flex flex-col">
              <div class="${color} p-6 rounded-3xl rounded-bl-none w-96 shadow-sm mb-2">
                <p class="font-medium mb-1">${datos.nick}</p>
                <a href="${fileURL}" target="_blank">${name} (${formatFileSize(size)})</a>
              </div>
              <small class="text-gray-500">${hora_actual}</small>
            </div>
          </div>
        `;
      
        chat.append(archivoHTML);
      });
      

    function getIconClass(fileType) {
        if (fileType.includes('image')) {
          return 'fas fa-image'; // Icono para imágenes
        } else if (fileType.includes('audio')) {
          return 'fas fa-music'; // Icono para archivos de audio
        } else if (fileType.includes('video')) {
          return 'fas fa-video'; // Icono para archivos de video
        } else if (fileType.includes('pdf')) {
          return 'fas fa-file-pdf'; // Icono para archivos PDF
        } else if (fileType.includes('word')) {
          return 'fas fa-file-word'; // Icono para archivos de Word
        } else if (fileType.includes('excel')) {
          return 'fas fa-file-excel'; // Icono para archivos de Excel
        } else if (fileType.includes('powerpoint')) {
          return 'fas fa-file-powerpoint'; // Icono para archivos de PowerPoint
        } else {
          return 'fas fa-file'; // Icono genérico para otros tipos de archivo
        }
      }
  
    nickForm.submit(e => {
        var login ={ 
            nick: nickName.val(),
            password: password.val()
        }
      e.preventDefault();
      socket.emit('nuevo usuario', login, datos => {
        if (datos) {
          nick = nickName.val();
          $('#nick-wrap').hide();
          $('#content-wrap').show();
        } else {
          nickError.html(`
            <div class="alert alert-danger">
              El usuario ya existe
            </div>
          `);
        }
        var sssss = JSON.stringify(login);
        // Guardar la cadena JSON en el almacenamiento local
        localStorage.setItem('login', sssss);
        nickName.val('');
      });


    });
  
    socket.on('usernames', datos => {
      let html = '';
      let color = '#000';
      let salir = '';
      for (let i = 0; i < datos.length; i++) {
        if (nick == datos[i].nick) {
          color = '#027f43';
          salir = `<a class="enlace-salir" href="/"><i class="fas fa-sign-out-alt salir"></i></a>`;
        } else {
          color = '#000';
          salir = '';
        }
        var url = datos[i].password;
        html += `
          <div class="mr-4 text-center self-center">
            <div class="relative w-12 mb-2">
              <img src="${url}" class="rounded-full" style="width:60px; height:45px;" >
              <div class="absolute bg-green-300 p-1 rounded-full bottom-0 right-0 border-2 border-gray-800"></div>
            </div>
            <small> ${datos[i].nick}</small>
          </div>
        `;
      }
      userNames.html(html);
    });
  
    $('#chat-form').submit(e => {
      e.preventDefault();
      const message = $('#input-message').val();
      socket.emit('chat message', message);
      $('#input-message').val('');
  
      const fileInput = $('#file-input');
      const file = fileInput[0].files[0];
  
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          const fileData = event.target.result;
          socket.emit('file', { name: file.name, data: fileData });
        };
        reader.readAsDataURL(file);
      }
      return false;
    });
  });
  