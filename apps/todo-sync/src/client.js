// Client WebSocket handler
export class TodoClient {
  constructor(url, onUpdate) {
    this.ws = new WebSocket(url);
    this.onUpdate = onUpdate;
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onUpdate(data);
      } catch (err) {
        console.error('Lỗi phân tích cú pháp dữ liệu sync:', err);
      }
    };
  }

  addTodo(id, text) {
    const message = {
      type: 'ADD_TODO',
      payload: { id, text }
    };
    this.ws.send(JSON.stringify(message));
  }

  deleteTodo(id) {
    const message = {
      type: 'DELETE_TODO',
      payload: { id }
    };
    this.ws.send(JSON.stringify(message));
  }

  close() {
    this.ws.close();
  }
}
