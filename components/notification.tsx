import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useWebSocket from "react-use-websocket";

const Notification = () => {
  const [messageHistory, setMessageHistory] = useState([]);
  const socketUrl = "ws://localhost:4000/v1/ws";
  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log("Connected!"),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      console.log("onMessage", data);
      const video = data.video;
      toast(`New video from ${video.author.name}: ${video.title}`);
      setMessageHistory((prev) => prev.concat(data));
    },
    onClose: () => console.log("Disconnected!"),
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000,
    share: true,
  });
  const readyStateString: { [key: number]: string } = {
    [-1]: "NOT_YET_CONNECTED",
    [0]: "CONNECTING",
    [1]: "OPEN",
    [2]: "CLOSING",
    [3]: "CLOSED",
  };

  useEffect(() => {
    lastMessage && setMessageHistory((prev) => prev.concat(lastMessage.data));
  }, [lastMessage]);

  return <></>
};

export default Notification;
