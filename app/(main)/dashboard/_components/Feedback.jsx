"use client";
import { UserContext } from '@/app/_context/UserContext';
import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { CoachingOptions } from '@/services/Options';
import { useConvex } from 'convex/react';
import moment from 'moment';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';

function Feedback() {
    const convex = useConvex();
    const userData = useContext(UserContext);
    const [discussionRoomList, setDiscussionRoomList] = useState([]);

    useEffect(() => {
        if (userData) {
            getDiscussionRooms();
        }
    }, [userData]);

    const getDiscussionRooms = async () => {
        const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
            uid: userData?._id
        });
        console.log(result);
        setDiscussionRoomList(result);
    };

    const getAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find((item) => item.name === option);
        return coachingOption?.abstract ?? '/ab1.png';
    };

    return (
        <div>
            <h2 className="font-bold text-xl">Feedback</h2>
            {discussionRoomList?.length === 0 && (
                <h2 className='text-gray-400'>You don't have any previous Feedback</h2>
            )}
            <div className='mt-5'>
                {discussionRoomList.map((item, index) =>
                    (item.coachingOption == 'Mock Interview' || item.coachingOption == 'Ques Ans Prep') && (
                        <div key={index} className='border-b-[2px] pb-3 mb-4 group flex justify-between items-center cursor-pointer'>
                            <div className='flex gap-7 items-center'>
                                <Image src={getAbstractImages(item.coachingOption)} alt='abstract' width={50} height={50} className='rounded-full' />
                                <div>
                                    <h2 className='font-bold'>{item.topic}</h2>
                                    <h2 className='text-gray-400'>{item.coachingOption}</h2>
                                    <h2 className='text-gray-400 text-sm'>{moment(item._creationTime).fromNow()}</h2>
                                </div>
                            </div>
                            <Link href={`/view-summary/+item._id`}>
                                <Button variant='outline' className='invisible group-hover:visible'>View feedback</Button>
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default Feedback;
