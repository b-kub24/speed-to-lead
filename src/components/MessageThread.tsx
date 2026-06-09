'use client';

interface MessageData {
  id: string;
  channel: 'sms' | 'email';
  direction: 'outbound' | 'inbound';
  body: string;
  sent_at: string;
  twilio_sid: string | null;
}

interface MessageThreadProps {
  messages: MessageData[];
  loading: boolean;
}

export default function MessageThread({
  messages,
  loading,
}: MessageThreadProps): React.ReactElement {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i: number) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className="bg-gray-200 rounded-xl p-4 w-72 h-20" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p>No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg: MessageData) => {
        const isOutbound = msg.direction === 'outbound';
        const isSms = msg.channel === 'sms';

        return (
          <div
            key={msg.id}
            className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm lg:max-w-md rounded-2xl px-4 py-3 ${
                isOutbound
                  ? 'bg-brand-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              {/* Channel badge */}
              <div
                className={`flex items-center gap-1.5 mb-1 text-xs ${
                  isOutbound ? 'text-orange-100' : 'text-gray-400'
                }`}
              >
                {isSms ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                <span>{isSms ? 'SMS' : 'Email'}</span>
                <span className="mx-1">&middot;</span>
                <span>{isOutbound ? 'Sent' : 'Received'}</span>
              </div>

              {/* Message body */}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>

              {/* Timestamp */}
              <div
                className={`text-xs mt-2 ${
                  isOutbound ? 'text-orange-100' : 'text-gray-400'
                }`}
              >
                {new Date(msg.sent_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
