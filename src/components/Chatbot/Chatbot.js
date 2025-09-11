import React, { Component } from 'react'
import axios from 'axios'
import './Chatbot.scss'

const API_URL = 'http://localhost:8000'

class Chatbot extends Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: [],
      input: '',
      isLoading: false
    }
    this.messagesEndRef = React.createRef()
  }

  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }


  handleSendMessage = async () => {
    const { input, isLoading } = this.state
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    // 즉시 로딩 상태로 변경하여 중복 요청 방지
    this.setState(prevState => ({
      messages: [...prevState.messages, userMessage],
      input: '',
      isLoading: true
    }))

    try {
      console.log('🚀 프론트엔드에서 요청 전송:', {
        url: `${API_URL}/chat`,
        data: {
          question: input
        }
      })
      
      const response = await axios.post(`${API_URL}/smartFactory/chat`, {
        question: input
      }, {
        headers: {
          'X-Skip-Loading': 'true' // 전역 로딩 스크린 비활성화
        }
      })

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.data.answer,
        timestamp: new Date()
      }

      this.setState(prevState => ({
        messages: [...prevState.messages, assistantMessage]
      }))
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `오류가 발생했습니다: ${error.response?.data?.detail || error.message}`,
        timestamp: new Date()
      }
      this.setState(prevState => ({
        messages: [...prevState.messages, errorMessage]
      }))
    } finally {
      this.setState({ isLoading: false })
    }
  }

  handleExampleClick = (question) => {
    // 로딩 중이면 예제 질문 클릭 무시
    if (this.state.isLoading) {
      console.log('처리 중입니다. 잠시만 기다려주세요.')
      return
    }
    this.setState({ input: question })
  }

  handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      // 로딩 중이면 키보드 이벤트 무시
      if (!this.state.isLoading) {
        this.handleSendMessage()
      }
    }
  }

  formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  render() {
    const { isOpen, onClose } = this.props
    const { messages, input, isLoading } = this.state

    return (
      <>
        {/* 오버레이 */}
        <div className={`chatbot-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
        
        {/* 챗봇 사이드바 */}
        <div className={`chatbot-sidebar ${isOpen ? 'open' : ''}`}>
          <div className="chatbot-header">
            <h3> AJIN 무물보 챗봇입니다</h3>
            <button className="chatbot-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <h4>안녕하세요! AJIN 스마트팩토리 챗봇입니다.</h4>
                <p>생산 데이터, 금형 현황, 불량 분석 등에 대해 질문해보세요.</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-bubble">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {this.formatTimestamp(message.timestamp)}
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="message assistant">
                <div className="message-bubble">
                  <div className="loading">
                    <div className="spinner"></div>
                    답변을 생성하고 있습니다...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={this.messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <form className="chatbot-input-form" onSubmit={(e) => { 
              e.preventDefault(); 
              // 로딩 중이면 폼 제출 무시
              if (!this.state.isLoading) {
                this.handleSendMessage(); 
              }
            }}>
              <div className="input-group">
                <textarea
                  className="chatbot-input"
                  value={input}
                  onChange={(e) => this.setState({ input: e.target.value })}
                  onKeyPress={this.handleKeyPress}
                  placeholder="생산 데이터, 금형 현황, 불량 분석 등에 대해 질문해보세요..."
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? '전송 중...' : '전송'}
              </button>
            </form>
          </div>
        </div>
      </>
    )
  }
}

export default Chatbot
