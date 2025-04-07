"use client"
import { api } from '@/convex/_generated/api'
import { useMutation } from 'convex/react'
import React, { useEffect, useState } from 'react'
import { UserContext } from './_context/UserContext'
import { useUser } from '@stackframe/stack'

function AuthProvider({children}) {
    const user=useUser();
    const CreateUser=useMutation(api.users.CreateUser);
    const [userData,setUserData]=useState();
    useEffect(()=>{
        console.log(user)
        user&&CreateNewUser();
    },[user])
    const CreateNewUser=async()=>{
        const result = await CreateUser({
            name:user?.displayName,
            email:user.primaryEmail
        });
       
        setUserData(result);
        console.log(result);
    }
  return (
    <div>
        <UserContext.Provider value={{userData,setUserData}}>
        {children}
        </UserContext.Provider>
        
    </div>
  )
}

export default AuthProvider