const url = "http://localhost:3001";
let timestamp = null;
let roomId = null;
let color = null;
let messagesArray = [];

const mostrarSalas = (sala, idSala) => {
  return `<div>
  <label>${sala}</label>
  <button
    name="${sala}"
    class="enter-room"
    id="${idSala}">Entrar</button>
  </div>`;
};

const messageObject = (message, time, classPosition, userName, userColor) => {
  return {
    message: message,
    time: time,
    classPosition: classPosition,
    userName: userName,
    userColor: userColor,
  };
};

const messageBaloon = ({
  message,
  time,
  classPosition,
  userName,
  userColor,
}) => {
  return `<div class="message ${classPosition}">
    <p class="nick" style="color:${userColor}">${userName}</p>
    <p class="message-content">${message}</p>
    <label style="display:flex;justify-content:flex-end"><small>${time}</small></label>
  </div>`;
};

const listarSalas = () => {
  $.ajax({
    url: `${url}/rooms`,
    method: "GET",
    credentials: "include",
    xhrFields: {
      withCredentials: true,
    },
    success: (response) => {
      for (i = 0; i < response.length; i++) {
        salas.append(mostrarSalas(response[i].name, response[i]._id));
      }
      $(".enter-room").on("click", function (event) {
        let singleRoomId = $(this).attr("id");
        $.ajax({
          url: `${url}/room/enter?roomId=${singleRoomId}`,
          method: "POST",
          credentials: "include",
          xhrFields: {
            withCredentials: true,
          },
          success: (response) => {
            salas.hide();
            roomId = singleRoomId;
            timestamp = response.timestamp;
            color = response.color;
            mensagens.append(
              `<section class="messages-title" id="current-room">
                    <h1>Sala ${$(this).attr("name")}</h1>
                </section>
                <section id="messages-list"></section>
                <section class="footer" id="message-form">
                    <input type="text" id="input-message" />
                    <button onclick=sendMessage() id="btn-send">Enviar</button>
                </section>
                `
            );
            $("#input-message").on("keypress", function (event) {
              if (event.key === "Enter") {
                sendMessage();
              }
            });
            mensagens.show();
            getMessages();
          },
          error: (xhr, statu, error) => {
            console.log("Error with listing rooms");
            console.log(error);
          },
        });
      });
    },
    error: (xhr, statu, error) => {
      console.log(error);
    },
  });
};

let nick;
let salas;
let inicio;
let mensagens;

$(document).ready(function () {
  salas = $("#salas");
  mensagens = $("#mensagens");

  salas.hide();
  mensagens.hide();

  $("#btn-entrar").on("click", () => {
    nick = $("#input-nick");
    inicio = $("#inicio");

    if (nick.val().length > 2 && nick.val().length < 9) {
      $.ajax({
        url: `${url}/enter`,
        method: "POST",
        data: { nick: nick.val() },
        xhrFields: {
          withCredentials: true,
        },
        success: (response) => {
          nick.val("");
          inicio.hide();
          salas.show();
          listarSalas();
        },
        error: (xhr, statu, error) => {
          console.log(error);
        },
      });
    }
  });
});

const sendMessage = () => {
  let tempMsg = $("#input-message").val();
  if (tempMsg !== "") {
    $.ajax({
      url: `${url}/room/${roomId}/message`,
      method: "POST",
      data: {
        timestamp: timestamp,
        msg: $("#input-message").val(),
      },
      xhrFields: {
        withCredentials: true,
      },
      success: (response) => {
        $("#input-message").val("");
        const message = messageObject(
          tempMsg,
          formatTimestamp(response.timestamp),
          "message-right",
          response.user,
          response.color
        );
        messagesArray.push(message);
        $("#messages-list").append(messageBaloon(message));
        timestamp = response.timestamp;
      },
      error: (xhr, statu, error) => {
        console.log(error);
      },
    });
  }
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedTime = `${formattedHours}:${formattedMinutes}`;
  return formattedTime;
};

const getMessages = () => {
  $.ajax({
    url: `${url}/room/${roomId}/message?timestamp=${timestamp}`,
    method: "GET",
    xhrFields: {
      withCredentials: true,
    },
    success: (response) => {
      timestamp = response.timestamp;
      // comparing array in response.msgs and messagesArray and adding the new messages to messagesArray
      for (i = 0; i < response.msgs.length; i++) {
        let message = response.msgs[i];
        if (!messagesArray.some((msg) => msg.message === message.message)) {
          message.time = formatTimestamp(message.time);
          message.classPosition = "message-left";
          messagesArray.push(message);
        }
      }
      // sorting messagesArray by timestamp
      messagesArray.sort((a, b) => a.timestamp - b.timestamp);
      // clearing messages-list div
      $("#messages-list").empty();
      // adding messages from messagesArray to messages-list div
      for (i = 0; i < messagesArray.length; i++) {
        $("#messages-list").append(messageBaloon(messagesArray[i]));
      }
    },
    error: (xhr, statu, error) => {
      console.log(error);
    },
  });
  setTimeout(getMessages, 3000);
};
