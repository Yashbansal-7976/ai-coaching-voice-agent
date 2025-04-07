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
import { GetDiscussionRoom } from '@/convex/DiscussionRoom';

function History() {
    const convex = useConvex();
    const {userData} = useContext(UserContext);
    const [discussionRoomList, setDiscussionRoomList] = useState([]);

    useEffect(() => {
        userData && GetDiscussionRoom();
    }, [userData]);

    const GetDiscussionRooms = async () => {
        const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
            uid: userData?._id
        });
        console.log(result);
        setDiscussionRoomList(result);
    };

    const GetAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find((item) => item.name == option);
        return coachingOption?.abstract ?? '/ab1.png';
    };

    return (
        <div>
            <h2 className="font-bold text-xl">Your Previous Lectures</h2>
            {discussionRoomList?.length == 0 && (
                <h2 className='text-gray-400'>You don't have any previous lectures</h2>
            )}
            <div className='mt-5'>
                {discussionRoomList.map((item, index) =>
                    (item.coachingOption == 'Topic Base Lecture' || item.coachingOption == 'Learn Language') && (
                        <div key={index} className='border-b-[2px] pb-3 mb-4 group flex justify-between items-center cursor-pointer'>
                            <div className='flex gap-7 items-center'>
                                <Image src={GetAbstractImages(item.coachingOption)} alt='abstract' width={70} height={70} className='rounded-full h-[50px] w-[50px]' />
                                <div>
                                    <h2 className='font-bold'>{item.topic}</h2>
                                    <h2 className='text-gray-400'>{item.coachingOption}</h2>
                                    <h2 className='text-gray-400 text-sm'>{moment(item._creationTime).fromNow()}</h2>
                                </div>
                            </div>
                            <Link href={`/view-summary/+item._id`}>
                                <Button variant='outline' className='invisible group-hover:visible'>View Notes</Button>
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default History;
