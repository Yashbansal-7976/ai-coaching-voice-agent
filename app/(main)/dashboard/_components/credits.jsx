import { UserContext } from '@/app/_context/UserContext';
import React, { useContext } from 'react';
import Image from 'next/image';
import { Progress } from '@radix-ui/react-progress'; // Assuming you have a Progress component
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Wallet2 } from 'lucide-react'; // Assuming you're using react-icons for the Wallet2 icon
import { useUser } from '@stackframe/stack'; // Assuming you have a custom hook for user data

function Credits() {
    const {userData} = useContext(UserContext);
    const user = useUser();

    const CalculateProgress = () => {
        if (userData?.subscriptionId) {
            return ((50000 - Number(userData.credits)) / 50000) * 100;
        }
        return 0;
    };

    return (
        <div>
            <div className='flex gap-5 items-center'>
                <Image src={user?.profileImageUrl} width={60} height={60} className='rounded-full' alt="User Profile" />
                <div>
                    <h2 className='text-lg font-bold'>{user?.displayName}</h2>
                    <h2 className='text-gray-500'>{user?.primaryEmail}</h2>
                </div>
            </div>

            <hr className='my-3' />

            <div>
                <h2 className='font-bold'>Token Usage</h2>
                <h2>{userData.credits}/{userData?.subscriptionId ? '50,000' : '5,000'}</h2>
                <Progress value={CalculateProgress()} className='my-3' />

                <div className='flex justify-between items-center mt-3'>
                    <h2 className='font-bold'>Current Plan</h2>
                    <h2 className='p-1 bg-secondary rounded-lg px-2'>{userData?.subscriptionId ? 'Paid Plan' : 'Free Plan'}</h2>
                </div>

                <div className='mt-5 p-5 border rounded-2xl'>
                    <div className='flex justify-between mt-3'>
                        <h2 className='font-bold'>Pro Plan</h2>
                        <h2>50,000 Tokens</h2>
                    </div>
                    <h2 className='font-bold'>$10/Month</h2>
                    <Button className='w-full'>
                        <Wallet2 /> Upgrade $10
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Credits;
