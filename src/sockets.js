module.exports = (io) => {
  let nickNames = [];

  io.on('connection', socket => {
    console.log('Un cliente se ha conectado');

    socket.on('enviar mensaje', datos => {
      io.sockets.emit('nuevo mensaje', {
        msg: datos,
        nick: socket.nickname
      });
    });

    socket.on('enviar imagen', imageData => { 
      const mensaje = {
        nick: socket.nickname,
        msg: imageData
      };
    
      socket.emit('nuevo mensaje', mensaje); // Envía el evento al cliente actual
      socket.broadcast.emit('nuevo mensaje', mensaje); // Envía el evento a los demás clientes
    });
    

    socket.on('archivo recibido', data => {
      io.emit('archivo compartido', data);
    });

    socket.on('nuevo usuario', (datos, callback) => {
      if (nickNames.indexOf(datos) !== -1) {
        callback(false);
      } else {
        callback(true);
        socket.nickname = datos;
        nickNames.push(socket.nickname);
        actualizarUsuarios();
      }
    });

    socket.on('disconnect', () => {
      console.log('Un cliente se ha desconectado');
      if (!socket.nickname) {
        return;
      } else {
        nickNames.splice(nickNames.indexOf(socket.nickname), 1);
        actualizarUsuarios();
      }
    });

    function actualizarUsuarios() {
      io.sockets.emit('usernames', nickNames);
    }

    socket.on('chat message', msg => {
      console.log('Mensaje recibido: ' + msg);
      io.emit('chat message', msg);
    });

    socket.on('file', file => {
      console.log('Archivo recibido:', file.name);
      io.emit('file', file);
    });
  });
};
