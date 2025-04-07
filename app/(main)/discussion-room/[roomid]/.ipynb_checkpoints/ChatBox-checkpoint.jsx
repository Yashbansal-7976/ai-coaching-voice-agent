import React from 'react';

function ChatBox({ conversation }) {
    return (
        <div>
            <div className='h-[60vh] bg-secondary border rounded-xl flex flex-col relative p-4 overflow-auto'>
                <div>
                    {conversation.map((item, index) => (
                        <div key={index} className={`flex ${item.role === 'user' ? 'justify-end' : ''}`}>
                            {item.role === 'assistant' ? (
                                <h2 className='p-1 px-2 bg-primary text-white inline-block rounded-md'>
                                    {item.content}
                                </h2>
                            ) : (
                                <h2 className='p-1 px-2 bg-primary text-white inline-block rounded-md'>
                                    {item.content}
                                </h2>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <h2 className='mt-4 text-gray-400 text-sm'>
                At the end of your conversation, we will automate.
            </h2>
        </div>
    );
}

export default ChatBox;
