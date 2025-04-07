"use client";
import { api } from '@/convex/_generated/api';
import { CoachingOptions } from '@/services/Options';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import React from 'react';
import moment from 'moment'; // Assuming you want to use moment for date formatting

function ViewSummary() {
    const { roomid } = useParams();
    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
    console.log(DiscussionRoomData);

    const getAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find((item) => item.name === option);
        return coachingOption?.abstract ?? '/ab1.png';
    };

    return (
        <div className='-mt-10'>
        <div className='flex justify-between items-end'>
            <div className='flex gap-7 items-center'>
                <Image
                    src={getAbstractImages(DiscussionRoomData?.coachingOption)}
                    alt='abstract'
                    width={100}
                    height={100}
                    className='w-[70px] h-[70px] rounded-full'
                />
                <div>
                    <h2 className='font-bold text-lg'>{DiscussionRoomData.topic}</h2>
                    <h2 className='text-gray-400'>{DiscussionRoomData.coachingOption}</h2>
                </div>

                </div>
                <h2 className='text-gray-400'>{moment(DiscussionRoomData?._creationTime).fromNow()}</h2>
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-5 mt-5'>
                <div className='col-span-3'>
                    <h2 className='text-lg font-bold mb-6'>Summery of Your Conversation</h2>
                    <SummaryBox summary={DiscussionRoomData?.summery} />
                </div>
                <div className='col-span-2'>
                <h2 className='text-lg font-bold mb-6'>Your Conversation</h2>
                    {DiscussionRoomData?.conversation && (
                        <ChatBox
                            conversation={DiscussionRoomData?.conversation}
                            coachingOption={DiscussionRoomData?.coachingOption}
                            enableFeedbackNotes={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewSummary;
