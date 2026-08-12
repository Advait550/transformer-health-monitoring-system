let io = null;

const initSocket = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};

const emitSensorUpdate = (payload) => {
  if (io) {
    io.emit('sensor-update', payload);
  }
};

const emitStatusChange = (payload) => {
  if (io) {
    io.emit('transformer-status-change', payload);
  }
};

const emitAlertCreated = (payload) => {
  if (io) {
    io.emit('alert-created', payload);
  }
};

const emitAlertResolved = (payload) => {
  if (io) {
    io.emit('alert-resolved', payload);
  }
};

const emitTransformerStale = (payload) => {
  if (io) {
    io.emit('transformer-stale', payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitSensorUpdate,
  emitStatusChange,
  emitAlertCreated,
  emitAlertResolved,
  emitTransformerStale,
};
