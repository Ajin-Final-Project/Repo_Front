import React from 'react'
import s from './ChatIcon.module.scss'

const ChatIcon = ({ onClick, isOpen }) => {
  return (
    <div className={`${s.chatIcon} ${isOpen ? s.open : ''}`} onClick={onClick}>
      <div className={s.chatIconInner}>
        {isOpen ? (
          <span className={s.closeIcon}>✕</span>
        ) : (
          <span className={s.chatIconSymbol}>💬</span>
        )}
      </div>
      <div className={s.chatIconTooltip}>
        {isOpen ? '챗봇 닫기' : '챗봇 열기'}
      </div>
    </div>
  )
}

export default ChatIcon


