/**
 * mock-transport.js
 * MCP 프로토콜 테스트를 위한 인메모리 Transport Mock
 */

class MockTransport {
  constructor() {
    this.sentMessages = [];
    this.receivedMessages = [];
    this.mockResponses = new Map();
  }

  /**
   * 메시지 전송 (클라이언트 → 서버)
   */
  async send(message) {
    this.sentMessages.push(message);

    // Mock 응답 반환
    const response = this.mockResponses.get(message.method);
    if (response) {
      return response;
    }

    // 기본 응답
    return {
      jsonrpc: '2.0',
      id: message.id,
      result: {},
    };
  }

  /**
   * 메시지 수신 (서버 → 클라이언트)
   */
  async receive(message) {
    this.receivedMessages.push(message);
  }

  /**
   * 특정 메서드에 대한 Mock 응답 설정
   */
  mockResponse(method, response) {
    this.mockResponses.set(method, {
      jsonrpc: '2.0',
      result: response,
    });
  }

  /**
   * 전송된 메시지 목록
   */
  getSentMessages() {
    return [...this.sentMessages];
  }

  /**
   * 수신된 메시지 목록
   */
  getReceivedMessages() {
    return [...this.receivedMessages];
  }

  /**
   * 상태 초기화
   */
  clear() {
    this.sentMessages = [];
    this.receivedMessages = [];
    this.mockResponses.clear();
  }
}

module.exports = { MockTransport };
