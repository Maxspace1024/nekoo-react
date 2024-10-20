// StompClient.js
import {HOST} from './BaseConfig';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class StompClient {
  // 私有的靜態變數來保存單例實例
  static instance;

  constructor() {
    if (StompClient.instance) {
      return StompClient.instance;
    }

    // 初始化 SockJS 和 Stomp
    this.socket = new SockJS(`${HOST}/ws`);
    this.stompClient = Stomp.over(this.socket);
    // this.stompClient.debug = function(message) {
    //   if (message.includes('ERROR') || message.includes('WARN')) {
    //       console.log(message);
    //   }
    // };
    // this.debugFlag = false
    // 在客戶端設置心跳間隔
    // this.stompClient.heartbeat.outgoing = 20000; // 每 20 秒發送一次心跳
    // this.stompClient.heartbeat.incoming = 20000; // 每 20 秒檢查一次服務器心跳

    // 預設為未連接狀態
    this.isConnected = false;

    // 保證只能有一個實例
    StompClient.instance = this;
  }

  connect(headers, onConnectCallback, onErrorCallback) {
    if (!this.isConnected) {
      this.stompClient.connect(headers, () => {
        this.isConnected = true;
        if (onConnectCallback) {
          onConnectCallback();
        }
      }, (error) => {
        this.isConnected = false;
        if (onErrorCallback) {
          onErrorCallback(error);
        }
      });
    } else {
      console.log('已經連接');
      if (onConnectCallback) {
        onConnectCallback();
      }
    }
  }

  disconnect(onDisconnectCallback) {
    if (this.isConnected && this.stompClient) {
      this.stompClient.disconnect(() => {
        this.isConnected = false;
        console.log('STOMP 客戶端已斷開連接');
        if (onDisconnectCallback) {
          onDisconnectCallback();
        }
      });
    } else {
      console.error('STOMP 客戶端尚未連接，無法斷開');
    }
  }

  // 發送訊息
  send(destination, headers, messageBody) {
    if (this.isConnected) {
      if (this.debugFlag) console.log(messageBody)
      this.stompClient.send(destination, headers, JSON.stringify(messageBody));
    } else {
      console.error('STOMP 客戶端尚未連接，無法發送訊息');
    }
  }

  // 訂閱某個 topic
  subscribe(destination, callback) {
    if (this.debugFlag) console.log(callback)
    if (this.isConnected) {
      return this.stompClient.subscribe(destination, (message) => {
        const body = JSON.parse(message.body);
        callback(body);
      });
    } else {
      console.error('STOMP 客戶端尚未連接，無法訂閱');
    }
  }

  unsubscribe(destination) {
    if (this.isConnected) {
      return this.stompClient.unsubscribe(destination);
    } else {
      console.error('STOMP 客戶端尚未連接，無法訂閱');
    }
  }
}

// 將這個單體 StompClient 導出
const stompClient = new StompClient();
export default stompClient;
