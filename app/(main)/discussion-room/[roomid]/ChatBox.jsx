import { Button } from '@/components/ui/button';
import { AIModelToGenerateFeedbackAndNotes } from '@/services/GlobalServices';
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { useParams } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';

function ChatBox({ conversation, enableFeedbackNotes, coachingOption }) {
    const [loading, setLoading] = useState(false);
    const updateSummary = useMutation(api.DiscussionRoom.UpdateSummery);
    const { roomid } = useParams();

    const GenerateFeedbackNotes = async () => {
        setLoading(true);
        try {
            const result = await AIModelToGenerateFeedbackAndNotes(coachingOption, conversation);
            console.log(result.content);
            await updateSummary({
                id: roomid,
                summary: result.content
            });
            toast('Feedback/Notes Saved!');
        } catch (e) {
            console.error(e);
            toast.error('Internal server error, Try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='h-[60vh] bg-secondary border rounded-xl flex flex-col relative p-4 overflow-auto scrollbar-hide'>
            <div>
                {conversation.map((item, index) => (
                    <div key={index} className={`flex ${item.role === 'user' ? 'justify-end' : ''}`}>
                        <h2 className={`p-1 px-2 mt-2 inline-block rounded-md ${item.role === 'assistant' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                            {item.content}
                        </h2>
                    </div>
                ))}
            </div>
            {enableFeedbackNotes && (
                <Button onClick={GenerateFeedbackNotes} disabled={loading} className='mt-7 w-full'>
                    {loading && <Loader2Icon className='animate-spin' />}
                    Generate Feedback/Notes
                </Button>
            )}
        </div>
    );
}

export default ChatBox;
