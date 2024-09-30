// StompClient.js

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
    // this.socket = new SockJS('http://localhost:8080/ws');
    this.socket = new SockJS('https://nekoo.xyz/ws');
    this.stompClient = Stomp.over(this.socket);

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

  // 發送訊息
  send(destination, headers, messageBody) {
    if (this.isConnected) {
      console.log(messageBody)
      this.stompClient.send(destination, headers, JSON.stringify(messageBody));
    } else {
      console.error('STOMP 客戶端尚未連接，無法發送訊息');
    }
  }

  // 訂閱某個 topic
  subscribe(destination, callback) {
    console.log(callback)
    if (this.isConnected) {
      return this.stompClient.subscribe(destination, (message) => {
        const body = JSON.parse(message.body);
        callback(body);
      });
    } else {
      console.error('STOMP 客戶端尚未連接，無法訂閱');
    }
  }
}

// 將這個單體 StompClient 導出
const stompClient = new StompClient();
export default stompClient;
