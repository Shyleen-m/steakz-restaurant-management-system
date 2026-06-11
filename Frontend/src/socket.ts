import { io } from 'socket.io-client';

const URL =
  import.meta.env.VITE_SOCKET_URL ||
  'http://localhost:5000';

export const socket = io(URL, {
  transports: ['websocket'],

    autoConnect: true,

    auth: (cb) => {
      const token =
        localStorage.getItem(
          'token'
        );

      const user =
        JSON.parse(
          localStorage.getItem(
            'user'
          ) || '{}'
        );

      cb({
        token,

        branchId:
          user?.branchId,
      });
    },
  }
);

/**
 * DEBUGGING
 */
socket.on(
  'connect',
  () => {
    console.log(
      '[Socket] Connected:',
      socket.id
    );
  }
);

socket.on(
  'connect_error',
  (error) => {
    console.error(
      '[Socket] Connection error:',
      error.message
    );
  }
);

