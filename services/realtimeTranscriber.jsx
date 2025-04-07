import { EventEmitter } from 'events';

class RealtimeTranscriber extends EventEmitter {
  constructor({ token, sample_rate = 16000 }) {
    super();
    this.token = token;
    this.sample_rate = sample_rate;
    this.socket = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;

    try {
      this.socket = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${this.sample_rate}`);

      this.socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        this.emit('transcript', data);
      };

      this.socket.onopen = () => {
        this.socket.send(JSON.stringify({ token: this.token }));
        this.connected = true;
      };

      this.socket.onclose = () => {
        this.connected = false;
      };

      this.socket.onerror = (error) => {
        console.error('Assembly AI WebSocket error:', error);
        this.connected = false;
      };
    } catch (error) {
      console.error('Failed to connect to Assembly AI:', error);
      throw error;
    }
  }

  sendAudio(audioData) {
    if (!this.connected || !this.socket) {
      console.warn('Not connected to Assembly AI');
      return;
    }

    try {
      this.socket.send(audioData);
    } catch (error) {
      console.error('Error sending audio data:', error);
    }
  }

  async close() {
    if (!this.connected || !this.socket) return;

    try {
      this.socket.close();
      this.connected = false;
    } catch (error) {
      console.error('Error closing Assembly AI connection:', error);
    }
  }
}

export default RealtimeTranscriber; 